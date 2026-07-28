# Nixo Content Grid — Website

A static, dependency-free rebuild of [nixocontentgrid.themavenpk.com](https://nixocontentgrid.themavenpk.com/)
with a richer UI layer: carousels, tabs, grids, an accordion, a comparison table,
scroll-driven animation and hand-drawn signature marks.

Original was WordPress + Elementor (~40 CSS/JS bundles). This is **three files** —
`index.html`, `assets/css/style.css`, `assets/js/main.js` — plus images.

## Design system

Colours and typography are lifted 1:1 from the live brand kit, so the site is
visually continuous with the original:

| Token | Value | Use |
| --- | --- | --- |
| `--green` | `#53F387` | primary / CTA |
| `--green-2` | `#31E063` | secondary, accents |
| `--navy` | `#15344B` | headings, body, dark sections |
| `--mint` | `#F1FFF6` | alternating section background |
| `--line` | `#cad4d4` | borders |

Type: **Outfit** (headings + body) and **Nanum Pen Script** (script accents and
signatures) — the same two families the original loads.

## UI components

- **Carousels** — testimonial slider (autoplay, dots, arrows, drag/swipe,
  responsive 3→2→1 per view) and an infinite client-logo marquee
- **Tabs** — six core services, with a sliding pill indicator
- **Grids** — 4-up service cards, 6-up filterable industry cards
- **Accordion** — the four-step process, height-animated
- **Table** — 16-row plan comparison, sticky header, horizontal scroll on mobile
- **Cards** — pricing (with monthly/yearly toggle), services, industries, stats

## Effects

Scroll-reveal via `IntersectionObserver`, animated counters, custom cursor,
magnetic buttons, button ripples, 3D tilt, parallax ornaments, scroll-progress
bar, sticky/shrinking header, scrollspy, word rotator, gradient blobs,
preloader, and self-drawing SVG signature flourishes.

All animation is disabled under `prefers-reduced-motion: reduce`.

## Run locally

Any static server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Zero-config on Vercel — it is plain static output, no build step.
`vercel.json` only sets long-lived cache headers for `/assets`.

## Notes

- Prices show `XXX PKR` exactly as the live site does; swap the `data-mo` /
  `data-yr` attributes on `.pcard__price b` when real numbers are set.
- The newsletter form validates and gives feedback client-side only; point it at
  a real endpoint in `main.js` → `form()` when one exists.
