-- Product-owner website content: make reviewed FAQs a first-class CMS collection.
-- Department, FAQ and project starter records are imported through the CMS so they
-- enter the normal draft/review/publish workflow instead of bypassing editorial approval.
alter table public.cms_entries
  drop constraint if exists cms_entries_collection_check;

alter table public.cms_entries
  add constraint cms_entries_collection_check
  check (collection in (
    'updates',
    'projects',
    'publications',
    'departments',
    'stats',
    'environment',
    'leadership',
    'page_presentations',
    'service_guides',
    'faqs'
  ));

create index if not exists cms_entries_faq_category_idx
  on public.cms_entries ((payload ->> 'category'), sort_order)
  where collection = 'faqs' and status = 'published';

-- The records themselves are imported as reviewable drafts through the CMS.
-- Migration 008 keeps revisions separate from the currently published payload.
