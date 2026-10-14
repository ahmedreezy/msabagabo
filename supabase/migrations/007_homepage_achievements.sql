-- Make the homepage achievement ledger editable through the existing CMS.
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
    'service_guides',
    'achievements'
  ));

-- Point an existing CMS-managed homepage hero at the supplied municipal image
-- without changing its approved headline, summary or calls to action.
update public.cms_entries
set payload = payload || jsonb_build_object(
  'image', '/images/msmc-aerial-home.jpg',
  'imageAlt', 'Aerial view of a divided road passing through a green residential area in Makindye Ssabagabo',
  'focalX', 50,
  'focalY', 50,
  'isIllustrative', false,
  'credit', ''
)
where collection = 'page_presentations'
  and slug = 'home';
