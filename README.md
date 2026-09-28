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

## Mr. Ssabagabo AI service guide

The public website includes an AI municipal information guide. Its browser component calls the `mr-ssabagabo` Supabase Edge Function, which searches only published `service_guides`, `departments` and `publications` before requesting a grounded answer from the OpenAI Responses API.

### Deploy

1. Apply `supabase/migrations/006_mr_ssabagabo.sql` to the Supabase project.
2. Add the server-only Edge Function secrets:

   ```sh
   supabase secrets set OPENAI_API_KEY=... OPENAI_CHAT_MODEL=gpt-5.4-mini CHAT_ALLOWED_ORIGINS=https://your-domain.example CHAT_RATE_LIMIT_SALT=...
   ```

3. Deploy the function:

   ```sh
   supabase functions deploy mr-ssabagabo
   ```

4. In `/admin`, open **Departments & services > AI service guides**. Verify each process with the responsible office before publishing it.

If the browser reports `Failed to send a request to the Edge Function`, verify deployment with:

```sh
curl -i https://YOUR_PROJECT_REF.supabase.co/functions/v1/mr-ssabagabo
```

A `404` response with `Requested function was not found` means step 3 has not been completed for that Supabase project. The database migration and function deployment are both required.

The OpenAI API key and service-role key must remain server-side. The function sends only the visitor's question, a short conversation history and retrieved public excerpts. It sets `store: false` on every model request. Do not add private CMS collections to `search_public_assistant_knowledge`.

The migration includes one conservative education-enquiry guide. It does not claim unverified requirements, fees or processing times. Replace it with Client Charter guidance after municipal review.

Roles:

- `editor`: creates and updates drafts.
- `publisher`: publishes and deletes content.
- `admin`: publisher permissions plus staff-role management at the database level.

Use **Import starter content** once on an empty CMS to copy the current website content into drafts. Publishing an entry makes it available to the public website automatically; local source data remains the fallback if Supabase is unavailable.
