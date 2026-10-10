# Homepage logo repair v7.0.56

The home hero uses the supplied transparent assets/images/sos-logo.png and a stable image key `homepage-main-logo`. The old dynamically assigned key (often `img-002`) may have held an incorrect image override in Supabase; the new stable key prevents that override from replacing the logo. The image remains editable under Admin Hub > Site Images & Galleries > index.html > homepage-main-logo.

If an image is replaced in that Admin panel, its override will intentionally take precedence. Use Reset on the homepage-main-logo card to return to the bundled transparent artwork. This patch does not delete any existing Supabase records or change other site images.
