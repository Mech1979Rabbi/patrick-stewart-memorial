# Kondolenzbuch einrichten / Condolence book setup

The public website stays online while submissions remain disabled until all configuration is complete.

1. Create a Supabase project. Open SQL Editor and execute `supabase/schema.sql`.
2. Install Supabase CLI, link the project, deploy `supabase/functions/tribute-api` with `supabase functions deploy tribute-api --no-verify-jwt`. Never publish service-role keys.
3. Create a Cloudflare Turnstile widget for the GitHub Pages domain and obtain its public site key and private secret.
4. In Supabase Edge Function secrets, set `TURNSTILE_SECRET` to the private secret and `ALLOWED_ORIGIN` to `https://mech1979rabbi.github.io`. The standard `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be available as secrets.
5. Edit the public `config.js` with the function endpoint `https://YOUR_PROJECT.supabase.co/functions/v1/tribute-api` and the **public** Turnstile site key. Never put the private Turnstile secret or Supabase service role key in GitHub.
6. Test with a dummy submission. It must appear as `pending` in the Supabase Table Editor and must **not** appear on the map.
7. As owner, review the message in Supabase Table Editor, set `status` to `approved` and refresh the webpage. It will then appear on the globe and map. Set `rejected` to reject.
8. Before accepting public messages, publish a correct legal notice, privacy policy, deletion/contact procedure and retention policy. Add monitoring, request throttling/WAF rules, and data backup. Cloudflare Turnstile reduces automated spam but is not a complete rate limiter.

Only the project owner with Supabase dashboard access can approve messages. No public database policies exist. The server-side function publishes only approved rows, and the displayed map uses country-level approximate coordinates, never precise visitor location.

The current map has a fixed set of supported countries; expand it for full international coverage before launch.

## Development checks

Use Node.js 24: `node --check main.js` and `node --test tests/*.test.mjs`.
Serve the static checkout with `python3 -m http.server 8000 --bind 127.0.0.1`.
The API tests use mocked Supabase and Turnstile responses; they do not validate a live database or its deployed RLS configuration.

The API checks Turnstile's returned hostname against `ALLOWED_ORIGIN`. Configure the widget for that exact hostname. The SQL revokes table access from both public API roles (`anon`, `authenticated`); moderation remains exclusively in the owner's Supabase dashboard. Never grant visitors dashboard access or the service role key.

Before deployment, test against a staging Supabase project: anonymous and authenticated clients must be unable to select pending rows or update statuses; a valid submission must create exactly one pending row; approving it in the dashboard must make it appear in GET responses, and rejecting it must remove it. Missing credentials, failing CAPTCHA and malformed requests must not insert rows. Deploying migrations and functions to the public project requires the owner's explicit release approval.
