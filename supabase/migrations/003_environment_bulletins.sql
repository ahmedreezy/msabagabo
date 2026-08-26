alter table public.cms_entries
  drop constraint if exists cms_entries_collection_check;

alter table public.cms_entries
  add constraint cms_entries_collection_check
  check (collection in ('updates', 'projects', 'publications', 'departments', 'stats', 'environment'));

create index if not exists cms_entries_environment_date_idx
  on public.cms_entries ((payload ->> 'date') desc)
  where collection = 'environment' and status = 'published';
