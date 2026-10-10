# v7.0.61 Homepage Smooth Loop Fix

- Based on the complete user-uploaded v7.0.60 ZIP.
- Replaces repaint-heavy background-position animation with a compositor-friendly transform on a tiled pseudo-element.
- Moves the static oval feather mask onto the stationary parent.
- Pre-blurs the default tiled pattern once as an optimized image, rather than blurring the animated layer on every frame.
- Translates exactly one tile for a seamless infinite loop.
- Keeps existing image key `homepage-moving-pattern` and main logo key, with no Admin or Supabase modifications.
- Mobile and reduced-motion support.
- To deploy, upload all extracted contents to repository root and commit. Hard-refresh the site.
