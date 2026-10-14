-- Use the Education hero image explicitly selected by the content owner.
update public.cms_entries
set
  payload = payload || jsonb_build_object(
    'image', '/images/departments/education-building-v3.webp',
    'imageAlt', 'Wide exterior view of a storeyed classroom building in Makindye Ssabagabo',
    'isIllustrative', false,
    'credit', ''
  ),
  updated_at = now()
where collection = 'page_presentations'
  and slug = 'directorate-education-sports';
