-- Publish department-specific hero photographs while keeping them editable in the CMS.
insert into public.cms_entries (collection, slug, title, payload, status, sort_order, published_at)
values
  (
    'page_presentations',
    'directorate-administration',
    'Administration',
    jsonb_build_object(
      'slug', 'directorate-administration',
      'eyebrow', 'Municipal department',
      'title', 'Administration',
      'summary', 'Provides administrative support, manages human resources and records, coordinates procurement and supports municipal compliance.',
      'image', '/images/departments/administration-offices.webp',
      'imageAlt', 'Makindye Ssabagabo Municipal Council administration offices and landscaped crane sculpture',
      'focalX', 55,
      'focalY', 48,
      'ctaLabel', '',
      'ctaTo', '',
      'isIllustrative', false,
      'credit', ''
    ),
    'published',
    4,
    now()
  ),
  (
    'page_presentations',
    'directorate-education-sports',
    'Education & Sports',
    jsonb_build_object(
      'slug', 'directorate-education-sports',
      'eyebrow', 'Municipal department',
      'title', 'Education & Sports',
      'summary', 'Oversees education standards, government-supported schools, inspection and sports development.',
      'image', '/images/departments/education-building-v3.webp',
      'imageAlt', 'Wide exterior view of a storeyed classroom building in Makindye Ssabagabo',
      'focalX', 50,
      'focalY', 48,
      'ctaLabel', '',
      'ctaTo', '',
      'isIllustrative', false,
      'credit', ''
    ),
    'published',
    5,
    now()
  )
on conflict do nothing;
