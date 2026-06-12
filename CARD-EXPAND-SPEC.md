# vogel.haus card-expand — measured spec (ground truth)

The exact mechanics of the hero → section-2 card entrance on https://www.vogel.haus/,
reverse-engineered 2026-06-12 three independent ways: decompiled Framer component config,
the Framer/Motion runtime source, and a headless-Chromium scroll sweep of the live site
(11 samples, model fits to 4 decimals). Use this as the prompt/spec for replicating the
effect anywhere — it replaces guessed specs (GSAP pin, 200vh sections, eased scrubs):
**none of that exists on the real site.**

## What the site actually does

The site is built in **Framer** (not Webflow). The card is driven by Framer's
*Scroll Transform* effect, which compiles to Motion's `scroll()` with
`offset: ["start end", "end end"]`. There is **no GSAP, no ScrollTrigger, no Lenis,
no pinning, no sticky positioning, and no tall driver section**. The card sits in
normal flow and rides the page while it animates.

### Progress driver

```
p = clamp((scrollY + viewportHeight − cardLayoutTop) / cardLayoutHeight, 0, 1)
```

- `p = 0` when the card's **untransformed** top edge crosses the viewport bottom
- `p = 1` when the card's untransformed bottom edge reaches the viewport bottom
- The scrub distance therefore equals the card's own layout height (1011.7px on desktop)
- Use layout geometry (offsetTop), never getBoundingClientRect of the transformed card

### Interpolation

**Linear. Direct scrub.** No easing curve, no duration, no spring, no catch-up lag
(`transform(p, [0,1], [from,to])` with clamping; a scroll-jump test settles within one
frame). The "buttery" feel comes entirely from natural scroll inertia riding a linear map.

### Animated channels (desktop ≥810px)

| element | x | y | scale | rotate |
|---|---|---|---|---|
| Letter card | 0 | 50px → 0 | **0.70 → 1.00** | **7° → 0°** |
| Left polaroid | 30px → 0 | 50px → 0 | 0.90 → 1.00 | −7° → −4° |
| Right polaroid | −30px → 0 | 50px → 0 | 0.90 → 1.00 | 14° → 7° |

(Polaroid resting tilts −4°/7° are static; only the ±3°/7° delta animates.
Opacity is constant 1 throughout. transform-origin: center.)

### What does NOT animate

- **border-radius** — constant 38px (`corner-shape: superellipse(1.7)`; fallback
  `38px × 0.671 ≈ 25.5px` without corner-shape support). The radius only *appears*
  to grow because scale multiplies it.
- **width/height** — never animated. Card layout: `max-width: 672px`, content height
  (1011.7px as published), `padding: 48px 48px 148px`.
- Nothing above/below the card moves abnormally — no pin spacer, no layout shift.

### Card chrome (verbatim from the live site)

- background `rgb(255, 253, 250)`; hairline `0.5px solid rgba(33,33,33,0.12)`
  drawn by an `::after` overlay with `border-radius: inherit`
- box-shadow (5 layers):
  `0.414945px 0.652056px 2.318666px -0.3px rgba(0,0,0,0.03),
   1.130005px 1.775723px 6.314344px -0.6px rgba(0,0,0,0.04),
   2.481083px 3.898845px 13.864013px -0.9px rgba(0,0,0,0.04),
   5.507438px 8.654545px 30.774944px -1.2px rgba(0,0,0,0.05),
   14px 22px 78.230429px -1.5px rgba(0,0,0,0.08)`
- polaroids: 205×264px, white, radius 2px, anchored at (left: −11%, top: 61%) and
  (left: 107%, top: 73%) of the card, centered with translate(-50%,-50%)
- `will-change: transform` on every animated element

### Responsive / accessibility

- **Phone (≤809.98px): the effect is OFF.** The card ships static at identity
  (radius 32px). Do not port the scrub to mobile if fidelity is the goal.
- Reduced motion: only opacity is driven (1→1, i.e. effectively static).

### Empirical keyframes (desktop 1440×900, for side-by-side validation)

| p | scale | rotate | translateY |
|---|---|---|---|
| 0.00 | 0.700 | 7.00° | 50.0px |
| 0.25 | 0.775 | 5.25° | 37.5px |
| 0.50 | 0.850 | 3.50° | 25.0px |
| 0.75 | 0.925 | 1.75° | 12.5px |
| 1.00 | 1.000 | 0.00° | 0.0px |

## Replication recipes

Vanilla (zero dependencies — what `portfolio/main.js` uses):

```js
const p = Math.min(1, Math.max(0, (scrollY + innerHeight - cardTop) / cardHeight));
card.style.transform =
  `translate3d(0, ${50*(1-p)}px, 0) scale(${0.7 + 0.3*p}) rotate(${7*(1-p)}deg)`;
// rAF-throttled scroll listener; recompute cardTop/cardHeight on resize/load
```

GSAP equivalent (what `portfolio/card-expand.html` uses — note `scrub: true` not
`scrub: 1`, `ease: "none"`, and **no pin**; trigger an untransformed wrapper):

```js
gsap.fromTo(card, { y: 50, scale: 0.7, rotation: 7 },
  { y: 0, scale: 1, rotation: 0, ease: 'none',
    scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom bottom', scrub: true } });
```

Motion (literally what Framer runs):

```js
import { scroll, transform } from 'motion';
scroll((progress) => { /* set transform from the table above */ },
  { target: card, offset: ['start end', 'end end'] });
```

## Where it lives in this repo

- `portfolio/card-expand.html` — the mechanic isolated on a self-contained page
  (placeholder hero above, placeholder section below, GSAP driver + vanilla fallback)
- `portfolio/main.js` ("LETTER CARD" block) + `portfolio/styles.css` — the same motion
  integrated on the real site's second fold (`.letter__card` + the two polaroids)
