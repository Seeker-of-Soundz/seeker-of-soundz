# Supabase merchandise setup — v7.0.54

1. In Supabase SQL Editor, run `supabase/patch-v7.0.48-site-content-studio-save.sql` first if not already installed. The new merchandise patch reuses its administrator-role authorization function.
2. Run `supabase/patch-v7.0.54-merch-cloud-catalog.sql`.
3. Deploy this entire ZIP to GitHub Pages. Sign in as Owner or Administrator and open Admin → Merch Store.
4. Use **Import previous browser products to Supabase** once on the browser that has your old products. This does not overwrite matching cloud IDs.
5. Add or edit an item with the existing form. Confirm the `Saved to Supabase` status. Refresh the public Merch page in another browser to verify.

The public page reads cloud products. Product saves and deletes use Supabase; cart remains local to the shopper. The site does not upload product image bytes to Supabase Storage; existing image URLs/paths are saved in product JSON. If image fields contain `data:` images, consider moving them to a Supabase Storage bucket before publishing large catalogs. If the SQL migration has not been run, the cloud read will fail and merchandise may not render until configured. Do not publish until you have tested the migration and storefront.
