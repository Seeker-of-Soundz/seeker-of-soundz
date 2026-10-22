# Seeker Of SoundZ v7.0.86

## Installation
1. Upload this entire ZIP to the same GitHub Pages repository.
2. In the **same Supabase project** configured in `js/supabase/supabase-client.js`, ensure `supabase/patch-v4.19.7-socials-manager.sql` has been installed; do not rerun its seed unless needed (it uses ON CONFLICT DO NOTHING).
3. Run `supabase/patch-v7.0.86-socials-history-recovery.sql` in Supabase SQL Editor. This creates a baseline backup of existing rows and logs subsequent changes. It does **not** magically recover deleted rows that no longer exist.
4. Inspect the diagnostic queries at the end of that SQL file. If missing links are absent from the live table, check your Supabase database backups, other project instances, and historical SQL exports. Do not overwrite the database with blank defaults.
5. In Admin Hub → Socials, use Hide/Show, Refresh history, and Restore this version. Save confirmation checks the persisted URL and visibility.
6. Contact → Message type → Bug Report routes the subject and message to `bug-report.html` for final submission. Report tracking requires the existing `supabase/patch-v7.0.62-community-bug-reports.sql` to be installed.

## Limitations
This update cannot read production Supabase records from a local ZIP and cannot recover previously deleted rows without existing backups. Database operations and authenticated admin workflows require live verification. Existing website files outside targeted features were preserved.
