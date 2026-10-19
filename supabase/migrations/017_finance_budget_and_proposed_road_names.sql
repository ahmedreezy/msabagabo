-- Publish the Finance budget and Planning Unit proposed-road-names documents.
-- The bundled PDFs must be deployed with the website before this migration runs.
with documents(slug, title, category, department, department_slug, summary, url, file_name, sort_order) as (
  values
    (
      'final-budget-fy-2026-2027',
      'Final Budget FY 2026/2027',
      'Budget and finance',
      'Finance & Planning',
      'finance-planning',
      'Final municipal budget document for the 2026/2027 financial year, supplied by the Finance department.',
      '/documents/finance/final-budget-fy-2026-2027.pdf',
      'final-budget-fy-2026-2027.pdf',
      35
    ),
    (
      'proposed-road-names-for-ppc-approval',
      'List of Proposed Road Names Forwarded to PPC for Approval',
      'Planning',
      'Planning Unit',
      'planning-unit',
      'Proposed municipal road names submitted to the Physical Planning Committee for approval, including locations, starting points and required road-name plates.',
      '/documents/planning/proposed-road-names-for-ppc-approval.pdf',
      'proposed-road-names-for-ppc-approval.pdf',
      36
    )
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
    'publishedDate', '2026-10-19',
    'department', department,
    'departmentSlug', department_slug,
    'summary', summary,
    'url', url,
    'fileName', file_name
  ),
  'published',
  sort_order,
  '2026-10-19T00:00:00Z'::timestamptz
from documents
on conflict (collection, slug) where slug is not null do update
set title = excluded.title,
    payload = excluded.payload,
    status = 'published',
    sort_order = excluded.sort_order,
    published_at = excluded.published_at;
