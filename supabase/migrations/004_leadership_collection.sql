alter table public.cms_entries
  drop constraint if exists cms_entries_collection_check;

alter table public.cms_entries
  add constraint cms_entries_collection_check
  check (collection in ('updates', 'projects', 'publications', 'departments', 'stats', 'environment', 'leadership'));

insert into public.cms_entries (collection, slug, title, payload, status, sort_order, published_at)
values
  (
    'leadership',
    'mayor',
    'Galabuzi John Bosco',
    jsonb_build_object(
      'id', 'mayor',
      'slug', 'mayor',
      'office', 'Office of the Mayor',
      'name', 'Galabuzi John Bosco',
      'role', 'Mayor',
      'description', 'Leads the elected Municipal Council.',
      'mark', 'M',
      'image', '/images/mayor.webp'
    ),
    'published',
    0,
    now()
  ),
  (
    'leadership',
    'town-clerk',
    'Otimong Moses',
    jsonb_build_object(
      'id', 'town-clerk',
      'slug', 'town-clerk',
      'office', 'Office of the Town Clerk',
      'name', 'Otimong Moses',
      'role', 'Town Clerk',
      'description', 'Directs administration and service delivery.',
      'mark', 'TC',
      'image', '/images/town-clerk-landscape.png'
    ),
    'published',
    1,
    now()
  ),
  (
    'leadership',
    'speaker',
    'Office of the Speaker',
    jsonb_build_object(
      'id', 'speaker',
      'slug', 'speaker',
      'office', 'Office of the Speaker',
      'name', '',
      'role', 'Speaker',
      'description', 'Presides over council sittings.',
      'mark', 'S',
      'image', ''
    ),
    'published',
    2,
    now()
  ),
  (
    'leadership',
    'heads-of-directorates',
    'Heads of Directorates',
    jsonb_build_object(
      'id', 'heads-of-directorates',
      'slug', 'heads-of-directorates',
      'office', 'Heads of Directorates',
      'name', '',
      'role', 'Sector delivery',
      'description', 'Coordinate the council’s technical sectors.',
      'mark', 'HD',
      'image', ''
    ),
    'published',
    3,
    now()
  )
on conflict do nothing;
