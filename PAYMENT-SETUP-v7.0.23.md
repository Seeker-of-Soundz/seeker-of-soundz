# Seeker Of SoundZ v7.0.23 — Stripe + PayPal secure checkout setup

The website is static on GitHub Pages, so **secret payment keys must never be placed in HTML/JS**. v7.0.23 uses a Supabase Edge Function as the secure server-side checkout bridge.

1. In Supabase SQL Editor run `supabase/patch-v7.0.23-payment-settings.sql`.
2. Deploy `supabase/functions/create-checkout/index.ts` as an Edge Function named `create-checkout`.
3. In Supabase → Edge Functions / Project Secrets, add the providers you want:
   - `STRIPE_SECRET_KEY` = Stripe test or live secret key.
   - `PAYPAL_CLIENT_ID` = PayPal sandbox/live client ID.
   - `PAYPAL_CLIENT_SECRET` = PayPal sandbox/live secret.
   - `PAYPAL_MODE` = `sandbox` or `live`.
4. Add `PAYMENT_CATALOG_JSON`. This is the secure price source. Example:
   `{"shirt-01":{"name":"SOS Shirt","unit_amount":2500,"currency":"usd"},"pack-01":{"name":"Sound Pack","unit_amount":1200,"currency":"usd"}}`
   Product IDs must match the IDs used by the site's cart. Prices are cents (2500 = $25.00).
5. Open Admin → Settings. Enable Stripe and/or PayPal, choose the preferred provider and Test/Live mode, then Save.
6. Click **Test Secure Checkout Service**. It should report the configured providers and Catalog as ready.
7. Add a matching product to the cart and use **Secure Checkout**. Test with sandbox/test credentials before switching to live keys.

Important: The included checkout bridge creates Stripe Checkout Sessions and PayPal approval orders. For a production store, add provider webhooks before granting digital entitlements automatically. Never trust a success URL alone as proof of payment.
