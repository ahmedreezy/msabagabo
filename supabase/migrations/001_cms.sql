create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('editor', 'publisher', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in ('updates', 'projects', 'publications', 'departments', 'stats')),
  slug text,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cms_entries_collection_status_order_idx
  on public.cms_entries(collection, status, sort_order);

create unique index if not exists cms_entries_collection_slug_unique_idx
  on public.cms_entries(collection, slug)
  where slug is not null;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists cms_entries_set_updated_at on public.cms_entries;
create trigger cms_entries_set_updated_at before update on public.cms_entries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger security definer set search_path = public language plpgsql as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.cms_has_role(allowed_roles text[])
returns boolean security definer set search_path = public language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.cms_entries enable row level security;

drop policy if exists "Profiles are visible to their owner and admins" on public.profiles;
create policy "Profiles are visible to their owner and admins"
on public.profiles for select
using (id = auth.uid() or public.cms_has_role(array['admin']));

drop policy if exists "Admins manage staff profiles" on public.profiles;
create policy "Admins manage staff profiles"
on public.profiles for update
using (public.cms_has_role(array['admin']))
with check (public.cms_has_role(array['admin']));

drop policy if exists "Published CMS entries are public" on public.cms_entries;
create policy "Published CMS entries are public"
on public.cms_entries for select
using (status = 'published' or public.cms_has_role(array['editor', 'publisher', 'admin']));

drop policy if exists "CMS staff create entries" on public.cms_entries;
create policy "CMS staff create entries"
on public.cms_entries for insert
with check (
  public.cms_has_role(array['publisher', 'admin'])
  or (public.cms_has_role(array['editor']) and status = 'draft' and created_by = auth.uid())
);

drop policy if exists "CMS staff update entries" on public.cms_entries;
create policy "CMS staff update entries"
on public.cms_entries for update
using (
  public.cms_has_role(array['publisher', 'admin'])
  or (public.cms_has_role(array['editor']) and status = 'draft')
)
with check (
  public.cms_has_role(array['publisher', 'admin'])
  or (public.cms_has_role(array['editor']) and status = 'draft')
);

drop policy if exists "Publishers delete entries" on public.cms_entries;
create policy "Publishers delete entries"
on public.cms_entries for delete
using (public.cms_has_role(array['publisher', 'admin']));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "CMS media is publicly readable" on storage.objects;
create policy "CMS media is publicly readable"
on storage.objects for select using (bucket_id = 'cms-media');

drop policy if exists "CMS staff upload media" on storage.objects;
create policy "CMS staff upload media"
on storage.objects for insert
with check (bucket_id = 'cms-media' and public.cms_has_role(array['editor', 'publisher', 'admin']));

drop policy if exists "Publishers manage media" on storage.objects;
create policy "Publishers manage media"
on storage.objects for delete
using (bucket_id = 'cms-media' and public.cms_has_role(array['publisher', 'admin']));

-- Promote the first CMS user by email. This also creates their profile when the
-- Auth user existed before this migration was installed:
-- insert into public.profiles (id, full_name, role)
-- select
--   id,
--   coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)),
--   'admin'
-- from auth.users
-- where lower(email) = lower('you@example.com')
-- on conflict (id) do update set role = excluded.role;
