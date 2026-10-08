# Site Content Studio saving repair v7.0.49

The original Studio and public-page loader referenced `window.SOSSupabase`, but the site initializes the client as `window.SOS_SUPABASE`. This mismatch made the editor report a failed save without reaching the configured Supabase project. Both scripts now resolve the actual client.

The Save button now requests the upserted row back from Supabase and checks the returned text and typography. If a database policy or column rejects the operation, the editor shows the real Supabase error.

**Deploy the whole ZIP to GitHub Pages** and hard refresh the admin and public pages. Ensure `supabase/patch-v7.0.48-site-content-studio-save.sql` has been executed in your Supabase SQL Editor. Sign in as Owner or Administrator, edit one word and drag its size slider, wait for 'Saved to Supabase', then refresh the public page to confirm persistence.

If the editor displays an RLS or permission error, verify the logged-in user's row in `public.profiles` has `role` set to `owner` or `administrator`. Do not disable RLS.
