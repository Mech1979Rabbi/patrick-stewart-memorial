# Public tributes and location setup

New submissions publish immediately after server-side validation and Turnstile verification, as requested by the owner. No manual approval queue is used for new messages. Existing pending messages are not automatically published.

1. Apply `supabase/schema.sql` before deploying the updated Edge Function. It adds optional city and paired latitude/longitude columns. Existing records keep their country-level position.
2. Deploy `tribute-api` with the Supabase CLI (`--no-verify-jwt`). Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET` and `ALLOWED_ORIGIN` in Supabase secrets. Never put private keys in the website.
3. Set the public Turnstile site key in `config.js`. Configure the Turnstile widget for the hostname of `ALLOWED_ORIGIN`.
4. Submit a staging message with a city or custom point: expect HTTP 201 and status approved, followed by its public appearance. Invalid coordinates and failed CAPTCHA must not insert a record.
5. Hide abusive entries in the private Supabase dashboard by setting status to rejected. Public roles retain no direct database access. CAPTCHA is not a complete rate limiter; configure production request limits and a reporting/contact process.

Coordinates are rounded server-side to two decimals. Visitors are told to choose approximate locations. Country, city and custom points are visitor assertions, not verified residence. The public feed currently returns the newest 500 entries; it is not a complete 20,000-point archive.

Run `node --test tests/*.test.mjs` using Node 24. These tests mock external services; live RLS, CAPTCHA and database checks are still required. Serve with `python3 -m http.server 8000 --bind 127.0.0.1` and verify desktop/mobile views and map controls. Publish migrations/functions only with the owner's explicit release approval.
