# Site Content Studio — Supabase repair (v7.0.48)

1. Open your existing Supabase project → **SQL Editor** → **New query**.
2. Paste `supabase/patch-v7.0.48-site-content-studio-save.sql` and run it.
3. Verify the output includes `style_json` with type `jsonb`.
4. Log in to the website with an account whose `public.profiles.role` is `owner` or `administrator`.
5. In **Admin → Site Content Studio**, change a text block's font size and text, then Save.
6. Refresh the editor and the public page. Both changes should persist. If not, inspect the Studio's Supabase error message and browser console.

This patch fixes the **database schema and permissions**. It does not by itself fix JavaScript bugs or prove a live authenticated save. It does not remove existing content or require a new Supabase project. No Storage bucket is needed: overrides are saved in a database table.

**Security:** The earlier v7.0.17 patch granted all signed-in users permission to change public content. This patch restricts writes to Owner/Administrator accounts. Other custom RLS policies, if previously added under different names, should also be reviewed in the Supabase dashboard.
