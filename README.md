# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Production deployment

Netlify is configured by `netlify.toml` to run `npm run build`, publish the generated `dist` directory, and serve `index.html` for Vue Router URLs.

The GitHub Actions workflow in `.github/workflows/production.yml` verifies pull requests into `main` and every merged revision. Netlify's connected Git integration then builds and publishes pushes to `main`; this avoids storing Netlify account tokens in GitHub or running duplicate production deploys.

Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` configured under the Netlify project's environment variables. Do not store those values in the workflow file.

## Municipal CMS

The protected CMS is available at `/admin`. It uses Supabase Authentication, Postgres, Row Level Security and Storage.

### Setup

1. Create a Supabase project.
2. In the Supabase dashboard, open **SQL Editor > New query**, paste all of `supabase/migrations/001_cms.sql`, and run it once.
3. Copy `.env.example` to `.env.local` and add the project URL and browser-safe publishable key from the Supabase **Connect** dialog. The legacy anonymous key remains supported as a fallback.
4. In **Authentication > Sign In / Providers**, keep Email enabled and disable public sign-ups so the CMS remains staff-only.
5. In **Authentication > Users**, create the first staff user with an email and password.
6. Promote that user to `admin` using the email-based create-or-promote SQL statement documented at the end of the migration. It also works when the Auth user was created before the migration.
7. Restart the development server, open `/admin`, and sign in.

Never place a Supabase secret key, `service_role` key, database password, or personal access token in a `VITE_` variable or commit it to Git. Every `VITE_` variable is bundled into the browser; this application only needs the publishable key.

Roles:

- `editor`: creates and updates drafts.
- `publisher`: publishes and deletes content.
- `admin`: publisher permissions plus staff-role management at the database level.

Use **Import starter content** once on an empty CMS to copy the current website content into drafts. Publishing an entry makes it available to the public website automatically; local source data remains the fallback if Supabase is unavailable.
