# Marina Seaside — Beachfront Restaurant

Static, restaurant-first website built to the **Revised Design Plan v1.0**, with the
colour direction overridden per your instruction: **white and blue, with yellow used
sparingly for detail** (taken directly from the supplied logo).

**Setting:** the restaurant is **by the beach, not on it** — an open-air terrace set back
and slightly raised, looking out over the sand to the anchorage where the dhows and
yachts are moored. All copy and photography reflect this; there are no "toes in the
sand" or "directly on the beach" claims anywhere on the site.

---

## Live structure

| Page | File | Role |
|---|---|---|
| Home | `index.html` | Video-led hero, restaurant preview first & largest |
| Restaurant | `restaurant.html` | **Primary focus** — expanded gallery, ambiance clip, hours, menu CTA |
| Menu | `menu.html` | Full food & drink list + PDF download |
| Explore More | `explore.html` | Accommodation + Boat Cruises, deliberately minimised |
| About | `about.html` | Story, kitchen, values |
| Contact | `contact.html` | WhatsApp booking form, details, map |

---

## How the brief was met

### Restaurant-first (§3.1)
- Restaurant is the first, largest content block on the homepage; the boats/accommodation
  strip sits last and smallest.
- Gallery expanded to **6 categories** (All / Ambiance / Interior / Food / Bar / Beach)
  with filtering.
- Opening-hours card, menu PDF download and WhatsApp reservation CTA kept prominent and
  unchanged in function — they appear on Home, Restaurant and Contact.

### Accommodation & Boats minimised (§3.2)
- Merged into a single **"Explore More"** section/page.
- Small cards, **no category filters**, **no dual-image hover** — each links straight to a
  pre-filled WhatsApp enquiry.

### Colour direction (your override of §4.1)
Sampled from the logo:

| Token | Hex | Use |
|---|---|---|
| Navy | `#002454` | Headings, nav, footer, primary buttons |
| Ocean | `#0C84C0` | Eyebrows, prices, links, accents |
| Sun | `#FCC018` | **Detail only** — rules, hover fills, active states |
| White / Mist | `#FFFFFF` / `#F2F6FA` | Base and section alternation |

Yellow is intentionally restricted to small detail elements (dividers, button hover
fills, "open now" pill, focus rings) — never large fills.

### Typography (§4.3)
- Headings: **Playfair Display** (retained).
- Body: **Jost** — a soft, geometric humanist sans that reads "boutique resort"
  rather than corporate.

### Video (§5)
| Asset | Format | Size | Notes |
|---|---|---|---|
| `hero-loop.mp4` | H.264 | ~1.1 MB | 15s seamless loop |
| `hero-loop.webm` | VP9 | ~1.1 MB | served first where supported |
| `ambiance.mp4/.webm` | H.264 / VP9 | ~0.8 MB | 10s clip, Restaurant page only |

Implementation details:
- Autoplay **muted**, looping, `playsinline`, gradient overlay retained for text contrast.
- **Seamless loop** — the last frame is an exact copy of the first, so there is no jump.
- `preload="none"`; sources are attached by JS only when playback is wanted, so video
  never blocks first paint.
- **Static poster fallback** always renders first (`hero-poster.jpg`).
- Video is **skipped entirely** on `save-data`, 2G connections, or
  `prefers-reduced-motion` — the poster simply stays.
- Non-hero video is **lazy-loaded** via IntersectionObserver and pauses off-screen.
- Total video use: **one hero loop + one supporting clip**, exactly as specified.

### Performance (§5.3)
- Every image is **under the 500 KB cap** (largest ≈ 315 KB), progressive JPEG.
- Above-the-fold cost is the poster only (~217 KB) — video is opt-in after load.
- No frameworks, no build step, no external JS. One CSS file, one JS file.
- Hosting stays fully static.

---

## Deploying

Any static host works — the site is plain HTML/CSS/JS.

```bash
# Netlify
netlify deploy --prod --dir .

# Vercel
vercel --prod

# GitHub Pages — commit and enable Pages on the branch root
```

`netlify.toml` and `vercel.json` are included with sensible cache headers
(immutable for `/assets/*`, revalidate for HTML).

Local preview:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

---

## Before go-live — content to swap

These are placeholders and must be replaced with real client assets/details:

1. **Phone / WhatsApp number** — currently `+254 722 406 291`.
   Change it in the HTML files if the reservation contact changes.
2. **Email** — `reservations@marinaseaside.co.ke`.
3. **Address & map pin** — placeholder Mtwapa coordinates (-3.9435, 39.7453) in `contact.html`.
4. **Photography & video** — all imagery is AI-generated for layout purposes.
   Replace with the real shoot, keeping the same filenames to avoid touching markup.
5. **Menu items & prices** — indicative only; confirm with the kitchen.
   Regenerate the PDF with `python3 build/gen_menu_pdf.py`.
6. **Reviews** — placeholder guest quotes on the homepage.
7. **Social links** — footer icons currently point to `#`.

---

## Regenerating

```bash
python3 build/process_assets.py   # logo + image optimisation
python3 build/make_video.py       # hero loop (needs ffmpeg via imageio-ffmpeg)
python3 build/gen_menu_pdf.py     # menu PDF
python3 build/gen_index.py        # homepage
python3 build/gen_pages.py        # all other pages
python3 build/qa.py               # automated QA sweep
```

`build/` is tooling only — it does not need to be deployed.

---

## Accessibility & QA

Automated sweep (`build/qa.py`) runs 6 pages × 3 viewports and checks for console
errors, failed requests, broken images, horizontal overflow and missing alt text.
**Current status: 0 failures.**

- Skip link, visible focus rings, semantic landmarks, single `h1` per page.
- All content is readable with **JavaScript disabled** — reveal animations are
  scoped to `.js` so nothing is hidden without it.
- `prefers-reduced-motion` disables animation, parallax, carousel autoplay and video.
- Decorative images are `aria-hidden`; the hero video is `aria-hidden` with a
  pause control.
