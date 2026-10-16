-- Publish the first Municipal Notice Board PDF and connect the Community-Based
-- Services forum card to the same controlled document.
insert into public.cms_entries (collection, slug, title, payload, status, sort_order, published_at)
values (
  'publications',
  'msmc-metropolitan-development-forum-members',
  'MSMC Metropolitan Development Forum member directory',
  jsonb_build_object(
    'title', 'MSMC Metropolitan Development Forum member directory',
    'category', 'Committees and forums',
    'format', 'PDF',
    'publishedDate', '2026-10-14',
    'department', 'Community-Based Services',
    'departmentSlug', 'community-services',
    'referenceNumber', 'MSMC/CBS/MDF/2026',
    'summary', 'Official directory of the 36 confirmed Metropolitan Development Forum members and the stakeholder categories they represent.',
    'url', '/documents/msmc-metropolitan-development-forum-members.pdf',
    'fileName', 'msmc-metropolitan-development-forum-members.pdf'
  ),
  'published',
  0,
  '2026-10-14T00:00:00Z'
)
on conflict (collection, slug) where slug is not null do update
set title = excluded.title,
    payload = excluded.payload,
    status = 'published',
    sort_order = excluded.sort_order,
    published_at = excluded.published_at;

update public.cms_entries as entry
set payload = jsonb_set(
  entry.payload,
  '{publicBodies}',
  coalesce((
    select jsonb_agg(
      case when body ->> 'id' = 'metropolitan-development-forum'
        then body || jsonb_build_object(
          'documentUrl', '/documents/msmc-metropolitan-development-forum-members.pdf',
          'documentFileName', 'msmc-metropolitan-development-forum-members.pdf'
        )
        else body
      end
      order by ordinal
    )
    from jsonb_array_elements(coalesce(entry.payload -> 'publicBodies', '[]'::jsonb)) with ordinality as bodies(body, ordinal)
  ), '[]'::jsonb),
  true
)
where entry.collection = 'departments'
  and entry.slug = 'community-services';
