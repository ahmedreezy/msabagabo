-- Add CMS-managed page heroes without changing any existing published content.
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
    'page_presentations'
  ));

create index if not exists cms_entries_page_presentations_slug_idx
  on public.cms_entries (slug)
  where collection = 'page_presentations';
