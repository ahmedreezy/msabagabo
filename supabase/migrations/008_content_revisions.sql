-- Non-destructive editorial revisions and atomic publication for reviewed releases.
create table if not exists public.cms_entry_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.cms_entries(id) on delete cascade,
  title text not null,
  slug text,
  payload jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  review_status text not null default 'draft' check (review_status in ('draft', 'in_review', 'approved', 'rejected', 'archived')),
  release_key text,
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cms_entry_revisions_active_unique_idx
  on public.cms_entry_revisions(entry_id)
  where review_status in ('draft', 'in_review', 'approved');

create index if not exists cms_entry_revisions_release_idx
  on public.cms_entry_revisions(release_key, review_status);

drop trigger if exists cms_entry_revisions_set_updated_at on public.cms_entry_revisions;
create trigger cms_entry_revisions_set_updated_at before update on public.cms_entry_revisions
for each row execute function public.set_updated_at();

alter table public.cms_entry_revisions enable row level security;

drop policy if exists "CMS staff read revisions" on public.cms_entry_revisions;
create policy "CMS staff read revisions" on public.cms_entry_revisions for select
using (public.cms_has_role(array['editor', 'publisher', 'admin']));

drop policy if exists "CMS staff create revisions" on public.cms_entry_revisions;
create policy "CMS staff create revisions" on public.cms_entry_revisions for insert
with check (
  created_by = auth.uid()
  and (
    public.cms_has_role(array['publisher', 'admin'])
    or (public.cms_has_role(array['editor']) and review_status in ('draft', 'in_review'))
  )
);

drop policy if exists "CMS staff update revisions" on public.cms_entry_revisions;
create policy "CMS staff update revisions" on public.cms_entry_revisions for update
using (public.cms_has_role(array['editor', 'publisher', 'admin']))
with check (
  public.cms_has_role(array['publisher', 'admin'])
  or (public.cms_has_role(array['editor']) and review_status in ('draft', 'in_review'))
);

drop policy if exists "Publishers delete revisions" on public.cms_entry_revisions;
create policy "Publishers delete revisions" on public.cms_entry_revisions for delete
using (public.cms_has_role(array['publisher', 'admin']));

-- Owner-release records carry the minimum metadata and structured fields needed
-- by their public views. Enforcing this here prevents a bypass of the CMS form.
create or replace function public.cms_owner_payload_is_publishable(
  supplied_collection text,
  supplied_payload jsonb
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(supplied_payload ->> 'contentRelease', '') <> 'product-owner-2026' then true
    when coalesce(supplied_payload ->> 'reviewStatus', '') <> 'approved' then false
    when nullif(trim(supplied_payload ->> 'sourceTitle'), '') is null then false
    when nullif(trim(supplied_payload ->> 'lastReviewed'), '') is null then false
    when supplied_collection = 'faqs' then
      nullif(trim(supplied_payload ->> 'departmentSlug'), '') is not null
      and jsonb_typeof(supplied_payload -> 'answerBlocks') = 'array'
      and jsonb_array_length(supplied_payload -> 'answerBlocks') > 0
    when supplied_collection = 'projects' then
      jsonb_typeof(supplied_payload -> 'contractPackages') = 'array'
      and jsonb_array_length(supplied_payload -> 'contractPackages') > 0
      and jsonb_typeof(supplied_payload -> 'implementationUpdates') = 'array'
      and jsonb_array_length(supplied_payload -> 'implementationUpdates') > 0
    when supplied_collection = 'departments' then
      nullif(trim(supplied_payload ->> 'mandate'), '') is not null
      and supplied_payload #>> '{fieldSources,mandate,sourceTitle}' is not null
    else true
  end;
$$;

create or replace function public.publish_cms_revision(revision_id uuid)
returns public.cms_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  revision public.cms_entry_revisions;
  target_entry public.cms_entries;
  published_entry public.cms_entries;
begin
  if not public.cms_has_role(array['publisher', 'admin']) then
    raise exception 'Publisher permission is required.';
  end if;

  select * into revision from public.cms_entry_revisions where id = revision_id for update;
  if revision.id is null then raise exception 'Revision not found.'; end if;
  if revision.review_status <> 'approved' then raise exception 'Approve the revision before publishing.'; end if;
  select * into target_entry from public.cms_entries where id = revision.entry_id for update;
  if target_entry.id is null then raise exception 'CMS entry not found.'; end if;
  if not public.cms_owner_payload_is_publishable(target_entry.collection, revision.payload) then
    raise exception 'The owner-content record is incomplete or has not been approved.';
  end if;

  insert into public.cms_entry_revisions (entry_id, title, slug, payload, sort_order, review_status, release_key, created_by, reviewed_by)
  select id, title, slug, payload, sort_order, 'archived', payload ->> 'contentRelease', updated_by, auth.uid()
  from public.cms_entries
  where id = revision.entry_id and status = 'published';

  update public.cms_entries
  set title = revision.title,
      slug = revision.slug,
      payload = revision.payload,
      sort_order = revision.sort_order,
      status = 'published',
      published_at = now(),
      updated_by = auth.uid()
  where id = revision.entry_id
  returning * into published_entry;

  update public.cms_entry_revisions
  set review_status = 'rejected', reviewed_by = auth.uid()
  where entry_id = revision.entry_id and id <> revision.id and review_status in ('draft', 'in_review', 'approved');
  delete from public.cms_entry_revisions where id = revision.id;
  return published_entry;
end;
$$;

create or replace function public.rollback_cms_entry(supplied_entry_id uuid)
returns public.cms_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  archived_revision public.cms_entry_revisions;
  current_entry public.cms_entries;
  restored_entry public.cms_entries;
begin
  if not public.cms_has_role(array['publisher', 'admin']) then
    raise exception 'Publisher permission is required.';
  end if;

  if exists (
    select 1
    from public.cms_entry_revisions as revision
    where revision.release_key = supplied_release_key
      and revision.review_status in ('draft', 'in_review')
  ) or exists (
    select 1
    from public.cms_entries as entry
    where entry.status = 'draft'
      and entry.payload ->> 'contentRelease' = supplied_release_key
      and coalesce(entry.payload ->> 'reviewStatus', '') <> 'approved'
  ) then
    raise exception 'Every active record in the release must be approved before bulk publication.';
  end if;

  if exists (
    select 1
    from public.cms_entry_revisions as revision
    join public.cms_entries as entry on entry.id = revision.entry_id
    where revision.release_key = supplied_release_key
      and revision.review_status = 'approved'
      and not public.cms_owner_payload_is_publishable(entry.collection, revision.payload)
  ) or exists (
    select 1
    from public.cms_entries as entry
    where entry.status = 'draft'
      and entry.payload ->> 'contentRelease' = supplied_release_key
      and entry.payload ->> 'reviewStatus' = 'approved'
      and not public.cms_owner_payload_is_publishable(entry.collection, entry.payload)
  ) then
    raise exception 'The release contains incomplete owner-content records.';
  end if;
  select * into current_entry from public.cms_entries where id = supplied_entry_id for update;
  select * into archived_revision from public.cms_entry_revisions
  where entry_id = supplied_entry_id and review_status = 'archived'
  order by updated_at desc limit 1 for update;
  if archived_revision.id is null then raise exception 'No previous published version is available.'; end if;

  insert into public.cms_entry_revisions (entry_id, title, slug, payload, sort_order, review_status, release_key, created_by, reviewed_by)
  values (current_entry.id, current_entry.title, current_entry.slug, current_entry.payload, current_entry.sort_order, 'archived', current_entry.payload ->> 'contentRelease', current_entry.updated_by, auth.uid());

  update public.cms_entries
  set title = archived_revision.title, slug = archived_revision.slug, payload = archived_revision.payload,
      sort_order = archived_revision.sort_order, status = 'published', published_at = now(), updated_by = auth.uid()
  where id = supplied_entry_id returning * into restored_entry;
  delete from public.cms_entry_revisions where id = archived_revision.id;
  return restored_entry;
end;
$$;

create or replace function public.publish_cms_release(supplied_release_key text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  revision record;
  published_count integer := 0;
  draft_count integer := 0;
begin
  if not public.cms_has_role(array['publisher', 'admin']) then
    raise exception 'Publisher permission is required.';
  end if;

  for revision in
    select * from public.cms_entry_revisions
    where release_key = supplied_release_key and review_status = 'approved'
    order by created_at
  loop
    perform public.publish_cms_revision(revision.id);
    published_count := published_count + 1;
  end loop;

  update public.cms_entries
  set status = 'published', published_at = now(), updated_by = auth.uid()
  where status = 'draft'
    and payload ->> 'contentRelease' = supplied_release_key
    and payload ->> 'reviewStatus' = 'approved';
  get diagnostics draft_count = row_count;
  published_count := published_count + draft_count;
  return published_count;
end;
$$;

revoke all on function public.publish_cms_revision(uuid) from public, anon, authenticated;
revoke all on function public.publish_cms_release(text) from public, anon, authenticated;
revoke all on function public.rollback_cms_entry(uuid) from public, anon, authenticated;
revoke all on function public.cms_owner_payload_is_publishable(text, jsonb) from public, anon, authenticated;
grant execute on function public.publish_cms_revision(uuid) to authenticated;
grant execute on function public.publish_cms_release(text) to authenticated;
grant execute on function public.rollback_cms_entry(uuid) to authenticated;
