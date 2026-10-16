-- Publish the verified Education & Sports Head of Department profile.
update public.cms_entries
set payload = payload || jsonb_build_object(
  'hodName', 'Nsangi Pauline',
  'hodTitle', 'Principal Education Officer',
  'hodPhoto', '/images/departments/nsangi-pauline-principal-education-officer.webp'
)
where collection = 'departments'
  and slug = 'education-sports';
