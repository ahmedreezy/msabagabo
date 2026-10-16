-- Publish the supplied Natural Resources, Physical Planning and Works records.
-- The bundled files must be deployed with the website before this migration runs.
with documents(slug, title, category, department, department_slug, summary, url, file_name, sort_order) as (
  values
    ('bunamwaya-climate-change-vulnerability-assessment', 'Bunamwaya Climate Change Vulnerability Assessment', 'Environment and climate', 'Physical Planning & Natural Resources', 'natural-resources', 'Climate change vulnerability assessment for Bunamwaya Division.', '/documents/natural-resources/bunamwaya-climate-change-vulnerability-assessment.pdf', 'bunamwaya-climate-change-vulnerability-assessment.pdf', 10),
    ('masajja-climate-change-vulnerability-assessment', 'Masajja Climate Change Vulnerability Assessment', 'Environment and climate', 'Physical Planning & Natural Resources', 'natural-resources', 'Climate change vulnerability assessment for Masajja Division.', '/documents/natural-resources/masajja-climate-change-vulnerability-assessment.pdf', 'masajja-climate-change-vulnerability-assessment.pdf', 11),
    ('ndejje-climate-change-vulnerability-assessment', 'Ndejje Climate Change Vulnerability Assessment', 'Environment and climate', 'Physical Planning & Natural Resources', 'natural-resources', 'Climate change vulnerability assessment for Ndejje Division.', '/documents/natural-resources/ndejje-climate-change-vulnerability-assessment.pdf', 'ndejje-climate-change-vulnerability-assessment.pdf', 12),
    ('msmc-climate-action-plan', 'Makindye Ssabagabo Climate Action Plan', 'Environment and climate', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal climate action plan for coordinated mitigation, adaptation and resilience work.', '/documents/natural-resources/msmc-climate-action-plan.pdf', 'msmc-climate-action-plan.pdf', 13),
    ('msmc-environment-action-plan', 'Makindye Ssabagabo Environment Action Plan', 'Environment and climate', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal action plan for environmental management and protection.', '/documents/natural-resources/msmc-environment-action-plan.pdf', 'msmc-environment-action-plan.pdf', 14),
    ('state-of-environment-report', 'State of the Environment Report', 'Environment and climate', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal report on the condition of the environment and priority management issues.', '/documents/natural-resources/state-of-environment-report.pdf', 'state-of-environment-report.pdf', 15),
    ('wetland-restoration-plan', 'Wetland Restoration Plan', 'Environment and climate', 'Physical Planning & Natural Resources', 'natural-resources', 'Restoration plan for priority wetlands in Makindye Ssabagabo Municipality.', '/documents/natural-resources/wetland-restoration-plan.pdf', 'wetland-restoration-plan.pdf', 16),
    ('municipal-physical-development-plan-3d', 'Municipal Physical Development Plan — 3D View', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Three-dimensional presentation of the municipal physical development plan.', '/documents/physical-planning/municipal-physical-development-plan-3d.pdf', 'municipal-physical-development-plan-3d.pdf', 17),
    ('administrative-boundaries-map', 'Administrative Boundaries Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Map of municipal administrative boundaries.', '/documents/physical-planning/administrative-boundaries-map.pdf', 'administrative-boundaries-map.pdf', 18),
    ('busabala-detailed-plan', 'Busabala Detailed Plan', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Detailed physical planning framework for Busabala.', '/documents/physical-planning/busabala-detailed-plan.pdf', 'busabala-detailed-plan.pdf', 19),
    ('namasuba-detailed-plan', 'Namasuba Detailed Plan', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Detailed physical planning framework for Namasuba.', '/documents/physical-planning/namasuba-detailed-plan.pdf', 'namasuba-detailed-plan.pdf', 20),
    ('mutungo-topographic-plan', 'Mutungo Topographic Plan', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Topographic planning map for Mutungo.', '/documents/physical-planning/mutungo-topographic-plan.pdf', 'mutungo-topographic-plan.pdf', 21),
    ('drainage-map', 'Drainage Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal drainage network and planning map.', '/documents/physical-planning/drainage-map.pdf', 'drainage-map.pdf', 22),
    ('economic-infrastructure-map', 'Economic Infrastructure Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Map of key economic infrastructure across the municipality.', '/documents/physical-planning/economic-infrastructure-map.pdf', 'economic-infrastructure-map.pdf', 23),
    ('environmental-map', 'Environmental Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Environmental features and planning considerations map.', '/documents/physical-planning/environmental-map.pdf', 'environmental-map.pdf', 24),
    ('growth-trends-map', 'Municipal Growth Trends Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Map showing municipal development and growth trends.', '/documents/physical-planning/growth-trends-map.pdf', 'growth-trends-map.pdf', 25),
    ('health-and-density-map', 'Health Facilities and Population Density Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Map relating health infrastructure to population density.', '/documents/physical-planning/health-and-density-map.pdf', 'health-and-density-map.pdf', 26),
    ('land-tenure-map', 'Land Tenure Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal land tenure map supporting physical planning decisions.', '/documents/physical-planning/land-tenure-map.pdf', 'land-tenure-map.pdf', 27),
    ('physical-development-plan-2040', 'Physical Development Plan 2040', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Long-term municipal physical development plan to 2040.', '/documents/physical-planning/physical-development-plan-2040.pdf', 'physical-development-plan-2040.pdf', 28),
    ('municipal-physical-development-plan', 'Municipal Physical Development Plan', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal physical development planning document and map.', '/documents/physical-planning/physical-development-plan.pdf', 'physical-development-plan.pdf', 29),
    ('physical-features-map', 'Physical Features Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Map of physical and natural features within the municipality.', '/documents/physical-planning/physical-features-map.pdf', 'physical-features-map.pdf', 30),
    ('road-infrastructure-2040', 'Road Network and Transport Infrastructure 2040', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Planned road network and transport infrastructure to 2040.', '/documents/physical-planning/road-infrastructure-2040.pdf', 'road-infrastructure-2040.pdf', 31),
    ('road-network-2018', 'Road Network 2018', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal road network baseline map for 2018.', '/documents/physical-planning/road-network-2018.pdf', 'road-network-2018.pdf', 32),
    ('soils-map', 'Soils Map', 'Physical planning maps', 'Physical Planning & Natural Resources', 'natural-resources', 'Municipal soils map for land-use and physical planning.', '/documents/physical-planning/soils-map.pdf', 'soils-map.pdf', 33),
    ('gkma-community-and-contractors-grievance-redress-committees', 'GKMA Community and Contractors’ Grievance Redress Committees', 'Committees and forums', 'Works & Engineering', 'works-engineering', 'Official directory of community and contractor grievance redress committees for GKMA road projects.', '/documents/works/community-and-contractors-grievance-redress-committees.pdf', 'community-and-contractors-grievance-redress-committees.pdf', 34)
)
insert into public.cms_entries (collection, slug, title, payload, status, sort_order, published_at)
select
  'publications',
  slug,
  title,
  jsonb_build_object(
    'title', title,
    'category', category,
    'format', 'PDF',
    'publishedDate', '2026-10-15',
    'department', department,
    'departmentSlug', department_slug,
    'summary', summary,
    'url', url,
    'fileName', file_name
  ),
  'published',
  sort_order,
  '2026-10-15T00:00:00Z'::timestamptz
from documents
on conflict (collection, slug) where slug is not null do update
set title = excluded.title,
    payload = excluded.payload,
    status = 'published',
    sort_order = excluded.sort_order,
    published_at = excluded.published_at;
