# Seeker Of SoundZ v7.0.89 — Homepage Socials Sync & Page Visibility Verification

- Homepage social cards now use the same public Supabase RPC (`get_site_social_links`) as socials.html.
- Name, category, description, URL, icon, featured state, and public visibility come from the live database.
- Hidden links do not appear on the homepage or public Socials page.
- Social link changes refresh on focus, return to page, and cross-tab notifications.
- New responsive card styling prevents icon/text collisions and long-title overflow.
- Admin Page Access save now reads back the saved access mode and reports mismatches.
- Navigation hiding also works when links are not wrapped in list items.
- No changes to SOS Beat Lab, Forums, Producer Hub, or Supabase tables.

## Setup and validation
1. Ensure `supabase/patch-v4.19.7-socials-manager.sql`, `supabase/patch-v7.0.86-socials-history-recovery.sql`, and `supabase/patch-v7.0.88-custom-social-icons.sql` have been applied as needed.
2. In Admin Hub > Socials, hide a link and save. It should disappear from the homepage and Socials page, but remain editable in Admin Hub.
3. In Admin Hub > Page Access & Visibility, select Hidden for a non-home page and Save. Check the verified save message; test navigation as a logged-out visitor.
4. Restore Public when done. Test at 390px mobile viewport.

NOTE: GitHub Pages is static. The client-side page gate is not security protection for confidential page source or bundled assets. Do not place secrets in HTML or JS. Database permissions must be enforced by Supabase RLS.
