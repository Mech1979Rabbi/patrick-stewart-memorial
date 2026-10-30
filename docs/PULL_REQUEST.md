# Add space scenery, selectable locations and direct tribute publication

The globe now uses a locally stored daytime Earth texture without city lights, procedural stars, a shaded Moon and a visible Sun whose directional light illuminates Earth. Visitors can select major cities for all supported countries or place a custom point on a separate map; coordinates also have keyboard-accessible inputs.

New messages publish immediately after validation and CAPTCHA, per the owner’s updated requirement. Existing pending records remain pending. Public database roles cannot directly access the table. Rejected messages remain excluded. Apply the additive coordinate schema before deploying the endpoint; private credentials stay in Supabase.

Validation: nine mocked API tests pass, including direct publication, coordinate limits, CAPTCHA rejection and malformed inputs. Browser checks cover rendering, city options and custom location selection. No production migration, merge or website publication was performed. Live Supabase configuration is still required. The feed currently shows the newest 500 messages; large-scale pagination/aggregation remains future work. Portrait gallery remains blocked on image-source access.
