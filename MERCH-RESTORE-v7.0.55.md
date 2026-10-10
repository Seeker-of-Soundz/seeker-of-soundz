# v7.0.55 Merch recovery and homepage logo

The homepage logo uses the original transparent PNG and retains the decorative halo; the new CSS targets only the hero.

If Supabase merchandise table is empty, the storefront shows products already stored in the current browser, including four bundled default products. Existing browser merchandise is not automatically uploaded to Supabase.

To publish old browser products to all visitors: sign in as Admin, open Merch Store, click **Import previous browser products to Supabase**. Run the v7.0.54 SQL patch first. Cloud products are preserved during import. Products that were saved in another browser can only be recovered from that browser or a backup.

This release does not change Supabase schema, authentication, or other website pages.
