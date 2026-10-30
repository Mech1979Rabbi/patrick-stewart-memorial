# Harden moderated tributes and repair map lifecycle

Visitor payloads now receive strict type, size and country validation. The endpoint always inserts pending submissions, checks CAPTCHA hostname, times out verification calls and handles upstream exceptions. SQL explicitly revokes public table access; the owner continues moderating in the private Supabase dashboard.

Fix map cleanup on language changes, invalid stored languages, CAPTCHA cleanup and reduced-motion rotation. Improve keyboard focus and narrow layouts. Remove the unsupported death-year assertion.

Validation: seven mocked API regression tests pass; JavaScript syntax and git whitespace checks pass. Live Supabase/RLS testing remains blocked by network access and missing project/Turnstile configuration. No deployment or changes to main are included.

Remaining release work: licensed photographic gallery, full translation coverage, live security tests, production throttling, legal/privacy content and multilingual SEO. Existing images and map assets require a documented license review. Do not publish before these are reviewed by the owner.
