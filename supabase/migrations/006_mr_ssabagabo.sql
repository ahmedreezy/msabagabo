-- Mr. Ssabagabo MVP: approved service guidance, public-only retrieval and rate limiting.
create extension if not exists pg_trgm;

alter table public.cms_entries
  drop constraint if exists cms_entries_collection_check;

alter table public.cms_entries
  add constraint cms_entries_collection_check
  check (collection in (
    'updates',
    'projects',
    'publications',
    'departments',
    'stats',
    'environment',
    'leadership',
    'page_presentations',
    'service_guides'
  ));

-- This function is the only chatbot retrieval surface. It deliberately excludes
-- drafts, staff profiles and every CMS collection that is not useful for public guidance.
create or replace function public.search_public_assistant_knowledge(
  search_query text,
  result_limit integer default 6
)
returns table (
  id uuid,
  collection text,
  title text,
  slug text,
  payload jsonb,
  published_at timestamptz,
  relevance real
)
language sql
stable
security invoker
set search_path = public
as $$
  with candidates as (
    select
      entry.id,
      entry.collection,
      entry.title,
      entry.slug,
      entry.payload,
      entry.published_at,
      concat_ws(' ', entry.title, entry.slug, entry.payload::text) as searchable_text
    from public.cms_entries as entry
    where entry.status = 'published'
      and entry.collection in ('service_guides', 'departments', 'publications')
  ),
  scored as (
    select
      candidate.*,
      greatest(
        ts_rank_cd(
          to_tsvector('english', candidate.searchable_text),
          websearch_to_tsquery('english', left(coalesce(search_query, ''), 500))
        ),
        similarity(lower(candidate.searchable_text), lower(left(coalesce(search_query, ''), 500)))
      )::real as relevance
    from candidates as candidate
    where nullif(trim(search_query), '') is not null
  )
  select
    scored.id,
    scored.collection,
    scored.title,
    scored.slug,
    scored.payload,
    scored.published_at,
    scored.relevance
  from scored
  where scored.relevance > 0.01
  order by scored.relevance desc, scored.published_at desc nulls last
  limit least(greatest(result_limit, 1), 8);
$$;

grant execute on function public.search_public_assistant_knowledge(text, integer) to anon, authenticated;

create table if not exists public.assistant_rate_limits (
  client_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1,
  primary key (client_hash, window_started_at)
);

alter table public.assistant_rate_limits enable row level security;
revoke all on public.assistant_rate_limits from anon, authenticated;

create or replace function public.check_assistant_rate_limit(
  supplied_client_hash text,
  window_minutes integer default 10,
  request_limit integer default 20
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz;
  updated_count integer;
begin
  if supplied_client_hash is null or length(supplied_client_hash) < 16 then
    return false;
  end if;

  current_window := date_trunc('hour', now())
    + floor(extract(minute from now()) / greatest(window_minutes, 1))
      * greatest(window_minutes, 1) * interval '1 minute';

  insert into public.assistant_rate_limits (client_hash, window_started_at, request_count)
  values (left(supplied_client_hash, 128), current_window, 1)
  on conflict (client_hash, window_started_at)
  do update set request_count = public.assistant_rate_limits.request_count + 1
  returning request_count into updated_count;

  delete from public.assistant_rate_limits
  where window_started_at < now() - interval '24 hours';

  return updated_count <= least(greatest(request_limit, 1), 100);
end;
$$;

revoke all on function public.check_assistant_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_assistant_rate_limit(text, integer, integer) to service_role;

-- Safe starter guidance. It directs residents to the responsible office without
-- inventing requirements, fees or approval timelines that have not been verified.
insert into public.cms_entries (collection, slug, title, payload, status, sort_order, published_at)
values (
  'service_guides',
  'education-school-enquiries',
  'Education and school enquiries',
  jsonb_build_object(
    'title', 'Education and school enquiries',
    'audience', 'Parents, guardians, school leaders and people seeking guidance about schools.',
    'summary', 'The Education & Sports Directorate provides guidance about municipal education services, school standards and the government school directory.',
    'department', 'Education & Sports',
    'office', 'Municipal Education Office',
    'steps', jsonb_build_array(
      'Explain the school service or registration guidance you need.',
      'Contact the Education & Sports Directorate for the current requirements and responsible officer.',
      'Confirm the required documents, applicable fees and submission location before travelling.'
    ),
    'requirements', jsonb_build_array(),
    'fees', 'Confirm current fees with the responsible office. No fee is stated in the published website information.',
    'processingTime', 'Confirm the current processing time with the responsible office.',
    'location', 'Makindye Ssabagabo Municipal Council head office, Ndejje-Zanta, Wakiso District',
    'openingHours', '',
    'phone', '0800 256 260',
    'email', 'education@msabagabo.go.ug',
    'sourceTitle', 'Makindye Ssabagabo Municipal Council website',
    'sourceUrl', '/directorates/education-sports',
    'lastReviewed', to_char(current_date, 'YYYY-MM-DD')
  ),
  'published',
  0,
  now()
)
on conflict do nothing;

