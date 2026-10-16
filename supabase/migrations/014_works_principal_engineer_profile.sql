-- Publish the verified Works & Services Head of Department profile.
update public.cms_entries
set payload = payload || jsonb_build_object(
  'hodName', 'Wilber Mukasa',
  'hodTitle', 'Principal Engineer',
  'hodPhoto', '/images/departments/wilber-mukasa-principal-engineer.webp'
)
where collection = 'departments'
  and slug = 'works-engineering';
