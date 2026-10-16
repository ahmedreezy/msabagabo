-- Publish the verified Physical Planning and Environment technical leadership profiles.
update public.cms_entries
set payload = payload || jsonb_build_object(
  'featureTeamAsLeadership', true,
  'team', jsonb_build_array(
    jsonb_build_object(
      'name', 'Matia Bisirikirwa',
      'role', 'Head of Physical Planning Unit',
      'photo', '/images/departments/matia-bisirikirwa-head-physical-planning.webp'
    ),
    jsonb_build_object(
      'name', 'Ssempala Alaphat',
      'role', 'Senior Environment Officer',
      'photo', '/images/departments/ssempala-alaphat-senior-environment-officer.webp'
    )
  )
)
where collection = 'departments'
  and slug = 'natural-resources';
