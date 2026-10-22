# SOS 7.0.84 — Socials and Forum Layout Repair

- Restored an explicit two-column forum grid, keeping the new-post form in the discussion content column, with a single-column mobile layout.
- Public Socials now re-fetches saved Supabase social links when the page regains focus, on page show and on authentication events; validates URLs and reports backend failures.
- The existing admin editor writes to Supabase via admin_save_site_social_link; changes are only shared across browsers if the Supabase migration has been applied successfully.
- No PHP files were present in the provided website archive. This is a static GitHub Pages site; security of Supabase depends on deployed RLS policies and function permissions. No claim of an exhaustive vulnerability assessment is made.
- All other original site files retained.
