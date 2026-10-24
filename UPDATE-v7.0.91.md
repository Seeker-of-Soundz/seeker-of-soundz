# v7.0.91 — Compact Collaboration Studio

- Preserves original DOM IDs, Supabase project and messaging logic, and v7.0.90 left-side accordions.
- Removes the visible Supabase workspace advertisement from the left sidebar.
- Converts dynamically injected Project Access, Studio Directory, Production Progress, and Project Actions into collapsible sections; keeps the original controls in their same DOM nodes.
- Keeps other inspector sections collapsible; production tracker opens by default.
- Limits desktop workspace height with independently scrollable left, center messages, and right panels so the composer stays visible.
- Repairs narrow badges, headings, collaborator cards, and wrapping in the inspector.
- Adds responsive two-column / single-column layouts for tablets and phones.

Validation: Run project selection, message send, audio attachment, collaborator add/remove, notes save/history, and progress update against your actual Supabase account. No database migration needed.
