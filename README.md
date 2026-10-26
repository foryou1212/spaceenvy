# SpaceEnvy

A responsive interior-design website for SpaceEnvy in Hyderabad, with a public project portfolio and a private Supabase-backed admin workspace.

## What’s included

- Public Home and About pages, plus upcoming and completed project listings.
- Enquiry form with required mobile number and privacy consent.
- Client feedback submissions that remain private until approved by an admin.
- Invite-only admin sign-in, editable homepage copy and hero image, project/image management, paginated enquiry review, complete CSV export, and testimonial moderation.
- Supabase Postgres and Storage with row-level security policies.
- Search metadata, local-business structured data, `robots.txt`, and a sitemap.
- Docker/Compose packaging for portable hosting and Vercel deployment support.

## Run locally

1. Install Node.js 22 or newer.
2. Install dependencies and create your local environment file:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

3. Create a Supabase project and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env`.
4. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
5. Follow the [Supabase admin setup](#supabase-setup) below.
6. Set `SITE_URL=http://localhost:3000` in `.env`, then run:

   ```powershell
   npm run dev
   ```

   Visit `http://localhost:3000`.

The public marketing pages can be previewed without Supabase, but enquiry submissions and the admin workspace require a configured Supabase project. The site reports that setup is missing rather than pretending an enquiry was saved.

## Supabase setup

1. Create a Supabase project. The schema creates the `site_settings`, `projects`, `enquiries`, `testimonials`, and `admin_users` tables, their row-level security policies, and the public `project-images` Storage bucket.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. The statements are safe to re-run. If the site is already deployed, run the updated schema again before deploying this testimonial feature so the `testimonials` table and policies are created.
3. In Supabase Auth settings, turn off public sign-ups. Invite only the people who should administer the site.
4. After an invited user exists in `auth.users`, approve their account by adding its UUID to `public.admin_users` from the SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'approved.person@example.com'
   on conflict (user_id) do nothing;
   ```

   Repeat this only for individually approved accounts. Removing the row revokes admin data access.
5. Set the Supabase project URL and publishable/anon key in `.env`. The public key is safe to use in the browser because all access is constrained by row-level security. **Never add a Supabase service-role key to this app or expose it to the browser.**
6. Update Supabase Auth’s site URL and redirect URL allowlist for local development and each deployed domain.

Only published projects are visible publicly. Admins can upload JPG, PNG, WebP, or AVIF project images up to 10 MB to the public portfolio bucket.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key; RLS protects data |
| `NEXT_PUBLIC_SPACEENVY_WHATSAPP_NUMBER` | Optional WhatsApp number in international format, e.g. `+91XXXXXXXXXX` (replace the placeholder with the business number) |
| `SITE_URL` | Canonical public origin used by metadata, structured data, and sitemap |
| `GOOGLE_SITE_VERIFICATION` | Optional Google Search Console verification token |

If your Supabase project still uses the legacy anon key name, `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported as a fallback. `.env` is ignored by Git and Docker. Keep credentials out of commits; `.env.example` contains placeholders only. `NEXT_PUBLIC_` values are compiled into browser code, so use only a Supabase publishable/anon key here—never a secret key.

The WhatsApp contact is optional until SpaceEnvy chooses a business number. Keep the `.env.example` placeholder (`+91XXXXXXXXXX`) for now; it is deliberately rejected as a phone number, so no message link will be shown. When the business number is ready, replace it with the international country-code format (for example `+919876543210`) in `.env`, then restart the development server. For Vercel, set the same environment variable in Project Settings and redeploy. Docker passes it at build time, so rebuild the image after changing it. The link opens WhatsApp with a pre-filled enquiry message; only a valid 8–15 digit international number is used.

## Deploy

### Vercel

Import the repository into Vercel and configure the required variables above in the project’s environment settings. Set `NEXT_PUBLIC_SPACEENVY_WHATSAPP_NUMBER` when the business number is decided. Add the optional Google verification token when verifying the site in Search Console. Use your real HTTPS domain for `SITE_URL`, redeploy, and add that domain to Supabase Auth’s allowed redirect URLs.

### Docker

Copy `.env.example` to `.env`, set the Supabase values and public `SITE_URL`, then build and start the container:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

Open `http://localhost:3000`. Docker Compose passes public Supabase values, the optional WhatsApp number, `SITE_URL`, and the optional Google verification token as build arguments because browser config and search metadata are generated during the Next.js build; runtime settings are also provided from `.env`. Rebuild the image when changing these values. The container listens on port `3000`; configure your domain and HTTPS at the hosting platform or reverse proxy.

For another Docker-capable host, build with the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, optional `NEXT_PUBLIC_SPACEENVY_WHATSAPP_NUMBER`, `SITE_URL`, and optional verification token build arguments. The app has no Vercel-only runtime dependency.

## Admin workflow

- Sign in at `/admin/login` with an approved Supabase Auth account.
- Edit public homepage and About introduction text from **Overview & homepage**.
- Add, edit, publish, or remove portfolio projects from **Projects**.
- Review, export as Excel-compatible CSV, and delete client requests from **Enquiries**.
- Review client feedback from **Testimonials**. Only approved feedback appears on the public homepage; rejected feedback stays private, and feedback can be deleted.
- Clients can submit feedback from the homepage without providing contact details. Submissions require consent and remain pending until an admin approves them.
- Deletion is permanent. Enquiries contain personal contact details; export and share them with care.

## Before launch

- Replace placeholder project content with accurate descriptions and client-approved photos.
- Review the privacy notice at `/privacy` and update it to reflect SpaceEnvy’s actual contact details, retention practices, and applicable legal obligations.
- Set the real production domain in `SITE_URL`, configure Supabase Auth URLs, and verify the owner-created admin accounts.
- The public copy describes a commitment to careful delivery; it does not claim an unconditional 100% satisfaction guarantee. Only publish a formal guarantee if SpaceEnvy is prepared to honor its stated terms.

## Checks

```powershell
npm run lint
npm run build
```
