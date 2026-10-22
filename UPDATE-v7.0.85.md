# v7.0.85 — Admin Socials publishing repair

- Fixed save button lookup: it previously lacked type=submit, so the submit handler threw before calling Supabase.
- Admin save now verifies RPC returned a row and confirms it is readable in the admin list before reporting success.
- Cross-tab notifications prompt Socials page to reload public links.
- Cache-busted both changed scripts.
- Supabase migration `supabase/patch-v4.19.7-socials-manager.sql` must be installed in your production project.
- Live database permissions and production publishing have not been tested.
