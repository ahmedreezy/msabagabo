# Education & Sports migration note

The earlier standalone Education pilot has been retired. Education & Sports now uses the same public page and CMS workflow as every municipal department:

1. Mandate
2. Sectors under the department
3. Frequently asked questions
4. Service routes, team and contact information

In `/admin`, open **Departments** and select `education-sports`. Staff can manage ordered sectors and FAQs with the shared department structure editor, preview the standard department presentation, and save or publish using the normal department rules.

Legacy `educationProfile` values already stored in a department JSON payload are preserved when the shared form is saved, but they are no longer edited, validated or rendered publicly. This avoids deleting collected research while keeping Education consistent with the rest of the website.

## Verification

- `npm test` verifies the shared department model and compatibility helpers.
- `npm run test:browser -- tests/browser/education.spec.js` verifies the public layout at desktop and mobile sizes, both department URL forms, and the shared CMS editing/preview/publishing flow.
- `npm run build` verifies the production bundle.
