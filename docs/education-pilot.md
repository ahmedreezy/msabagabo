# Education & Sports pilot

## Local review

Run `npm run dev` and open `/departments/education-sports` (the existing `/directorates/education-sports` URL also works). If no approved Education profile is published, development mode displays the labelled research draft. A production build never substitutes this draft for published content.

The page keeps the existing font, municipal colours, header and footer. It adds section navigation, service guidance, a school directory, responsibilities, contact routes, activities and documents. Other departments retain their existing layout.

## Editing

In the admin dashboard, open **Departments**, select the entry with URL `education-sports`, and choose **Load research draft** or **Start with a blank profile**. Existing entries and starter imports retain their base fields; loading the research pack is an explicit editor action.

Each repeatable entry has a source reference, an editor-only review note and a verified checkbox. Add, remove and reorder entries within their groups. Staff names and roles use the existing team editor; portraits are optional for Education. Activity photographs and documents use the existing CMS storage service. Upload errors preserve the previous URL.

Use **Preview changes** to see the same Education component used on the website. Draft notes and missing-section prompts are visible in this preview. **Save draft** permits incomplete content. To publish:

1. Check all included entries against the municipality's current records. Confirm school names/classifications and any location or contact data.
2. Resolve and clear entry notes, provide source links, and mark entries verified.
3. Resolve and clear the overall notes. Review the introduction, mandate, authority and any named staff, then select the overall approval checkbox.
4. Preview and publish using a publisher/admin account. Editing content resets approval.

Publication validation runs both in the editor and in the CMS client save method. The public component also rejects an unresolved profile. This is a client workflow safeguard, not a new database permission policy: existing Supabase role/RLS controls remain authoritative. No database migration or production CMS mutation is part of this change.

The optional `educationProfile` field is stored in the department's existing JSON payload. It contains `version`, `approved`, `reviewNotes`, and repeatable `guidance`, `schools`, `units`, `contacts`, `activities`, and `documents` arrays. Entries have stable IDs and editorial source/review metadata. The public projection includes only display fields. Existing `services: string[]` and other department fields remain compatible with the service directory.

## Content provenance and outstanding review

- Primary content source: https://www.msabagabo.go.ug/education (reviewed for this development phase on 7 September 2026; the source reporting period is not established).
- Organisation references: https://www.kcca.go.ug/physical-planning and https://entebbe.go.ug/ova_dep/education/.
- The draft transcribes 16 primary, two secondary and three partnership school entries from the municipal education page. This describes the source list, not a verified current municipal total.
- Service steps are editorial drafts for departmental review, not verified application/complaint procedures. No unsupported fees or turnaround times are included.
- Two historical classroom projects have deliberately blank update dates and photograph fields. Obtain dated updates and images of the actual projects before publishing them.
- Current officers, direct departmental contacts, sports activities and education documents still need verification. No invented officers, email addresses or documents are supplied. Council enquiries link to `/contact#contact-details`, bypassing the non-submitting contact form.
- Undated/inconsistent education ratios and headline statistics are excluded.

## Verification

`npm test` checks filtering, publication rules, public data projection, schema compatibility, reorder/save round trips and URL validation.

`npm run test:browser` starts isolated development and production-preview servers on ports 4173 and 4174, using an intercepted test Supabase host. It does not read or write live CMS records. The test harness rebuilds `dist/` with test configuration; run `npm run build` afterward to restore the normal production output. Install a Playwright Chromium browser with `npx playwright install chromium`, or set `PLAYWRIGHT_EXECUTABLE_PATH` to an existing Chrome/Edge executable. Browser tests cover responsive layouts, anchors, school filters, CMS draft/review flows, file uploads and recovery, published content and missing department routes. Screenshots/traces are written to ignored `test-results/`.

Run `npm run build` for the normal production build. Review this pilot before extending the design to another department or changing the department directory.
