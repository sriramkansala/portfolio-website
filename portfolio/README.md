# Mara Vance — Portfolio

A production-grade, single-page product-designer portfolio. Original design, built in the
editorial/cinematic *spirit* of sites like vogel.haus (techniques documented in
[`../TEARDOWN.md`](../TEARDOWN.md)), with animation rigor from Emil Kowalski's framework.

Everything here is original: original copy, an original palette, open-source fonts, and
generated placeholder visuals. Nothing is copied from any reference site. Swap in your own
content and it's ready to ship.

---

## Run it

It's static — no build step. Pick one:

```bash
# Python (built in on macOS)
cd portfolio
python3 -m http.server 4321
# → http://localhost:4321

# or Node
npx serve portfolio
```

Open the printed URL. The Google Fonts + Lenis smooth-scroll load from CDN, so the first
load needs a network connection; everything degrades gracefully offline (system fonts,
native scroll).

## File structure

```
portfolio/
├── index.html     # markup + content (edit your copy/projects here)
├── styles.css     # all styling — palette + type scale as CSS variables at the top
├── main.js        # interactions (zero dependencies; Lenis is optional progressive enhancement)
├── serve.py       # tiny local static server used during development (optional)
└── README.md
```

## Components / sections

| Section | What it is | Notable behavior |
| --- | --- | --- |
| **Nav** | Fixed header, `mix-blend-mode: difference` so it stays legible over light *and* dark sections | Underline-on-hover links; collapses to a full-screen burger menu ≤768px |
| **Hero** | Oversized masked headline + availability badge + lede | Lines rise from behind a mask on load (staggered); serif-italic accent word |
| **Marquee** | Infinite scrolling discipline list | CSS-only loop; pauses on hover |
| **Approach** | Large manifesto statement | Words light up one-by-one as they scroll into view |
| **Work** | Selected-projects list | Hover reveals a cursor-following image preview (desktop); rows shift + accent on hover |
| **Capabilities** | Dark chapter, 6-cell grid | Hairline grid via `gap:1px`; cell hover lightens |
| **About** | Portrait + bio + facts table | Portrait has a subtle, bounded parallax |
| **Contact** | Dark chapter, masked headline + email CTA | Lines reveal on scroll into view |
| **Footer** | Meta + back-to-top | — |

## Motion → technique map

See [`../TEARDOWN.md`](../TEARDOWN.md) for the full breakdown. In short:

- **Smooth scroll** — Lenis (CDN), progressively enhanced; native fallback.
- **Masked line reveals** — `.line { overflow:hidden } .line-inner { translateY }`.
- **Scroll reveals** — `IntersectionObserver` adds `.in`; fade + rise + blur-clear.
- **Parallax** — rAF, `transform: translate3d`, clamped to ±70px so it never overlaps.
- **Work hover-preview** — fixed element, cursor-follow via `lerp`.
- **Magnetic buttons + custom cursor** — pointer-delta transforms, **fine-pointer only**.
- **Easing** — Emil Kowalski curves (`cubic-bezier(0.23,1,0.32,1)`), all CSS variables.
- Every effect is gated behind `prefers-reduced-motion` and `(hover:hover) and (pointer:fine)`.

## Make it yours

1. **Copy** — edit text directly in `index.html`.
2. **Projects** — each `.work__item` carries a `data-bg` (the hover preview). Replace the
   gradient with a real image: `data-bg="url('assets/halcyon.jpg')"`.
3. **Portrait** — swap the `.about__portrait` background for your photo.
4. **Palette** — change the CSS variables under `:root` in `styles.css` (`--bg`, `--ink`,
   `--accent`, …). One accent, used sparingly, reads most premium.
5. **Fonts** — swap the Google Fonts `<link>` and the `--font-*` variables.

## Validated

Captured and visually checked at **390 / 768 / 1440 / 1920** via headless Chrome (CDP).
Zero console errors at every breakpoint. Capture harness lives in `../.tools/` (scratch —
safe to delete).

## What is intentionally *not* a clone

This is an **original interpretation**, not a 1:1 reproduction of any existing site. The
reference's photography, video, written copy, licensed fonts, and exact composition are that
studio's protected work and are not reproduced here. What *is* shared is technique — motion,
scroll behavior, type-scale strategy, spacing discipline — which is what makes the genre feel
the way it does, and which is yours to use freely.
