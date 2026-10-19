-- Publish the Procurement and Disposal Unit's e-GP FAQ document.
-- The bundled PDF must be deployed with the website before this migration runs.
insert into public.cms_entries (collection, slug, title, payload, status, sort_order, published_at)
values (
  'publications',
  'e-government-procurement-faqs-and-answers',
  'e-Government Procurement (e-GP 2.0) Frequently Asked Questions and Answers',
  jsonb_build_object(
    'title', 'e-Government Procurement (e-GP 2.0) Frequently Asked Questions and Answers',
    'category', 'Procurement',
    'format', 'PDF',
    'publishedDate', '2026-10-19',
    'department', 'Procurement and Disposal',
    'departmentSlug', 'administration',
    'summary', 'Frequently asked questions and answers about e-GP 2.0, supplier participation, electronic procurement processes, training, payments, security and the applicable public-procurement framework.',
    'url', '/documents/procurement/e-government-procurement-faqs-and-answers.pdf',
    'fileName', 'e-government-procurement-faqs-and-answers.pdf'
  ),
  'published',
  37,
  '2026-10-19T00:00:00Z'::timestamptz
)
on conflict (collection, slug) where slug is not null do update
set title = excluded.title,
    payload = excluded.payload,
    status = 'published',
    sort_order = excluded.sort_order,
    published_at = excluded.published_at;
