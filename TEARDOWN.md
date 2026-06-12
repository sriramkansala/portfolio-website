# Technique Teardown — editorial studio sites (ref: vogel.haus)

A breakdown of the *techniques* that give sites like vogel.haus their feel, so they can be
re-implemented from scratch with original content and design. This documents **how**, not
**what** — no copy, imagery, fonts, or composition is reproduced.

---

## 1. Page architecture

A long single-page scroll, sectioned with strong vertical rhythm:

1. Fixed minimal nav (logo left, links right, contact CTA)
2. Hero — oversized headline, short sub-line, scroll cue
3. Manifesto / value statement (large type, sparse)
4. Selected work (the centerpiece interaction)
5. Capabilities / services grid
6. Tech / tools strip (often a marquee)
7. Showreel video band
8. Newsletter / contact CTA
9. Footer

The rhythm alternates **light and dark sections** to create cinematic "chapters" as you scroll.

## 2. Motion system

The signature is **slow, weighted, confident** motion — nothing snappy, nothing bouncy.

- **Smooth/inertia scroll** — momentum scrolling (Lenis-style). The page glides and decelerates
  rather than tracking the wheel 1:1. This single thing accounts for ~50% of the "expensive" feel.
- **Masked line reveals** — headlines sit in `overflow: hidden` containers; each line translates
  up from `translateY(110%) → 0`, staggered. Looks like text rising from behind a mask.
- **Scroll-triggered reveals** — blocks fade + rise (`opacity 0→1`, `translateY(24px→0)`),
  sometimes with a tiny `blur` clearing, triggered by IntersectionObserver near viewport entry.
- **Parallax** — media moves slightly slower than scroll (`translateY` driven by scroll position),
  giving depth. Always `transform`, never `top`/`margin`.
- **Hover-preview on work list** — hovering a project row reveals a floating image that follows the
  cursor with lag (lerp). This is the hallmark studio interaction.
- **Magnetic buttons / links** — interactive elements drift slightly toward the cursor on approach.
- **Custom cursor** — a small ring (often `mix-blend-mode: difference`) trailing the pointer,
  scaling up over interactive targets.

### Easing & timing (the part most people get wrong)
- Custom curves, never the weak CSS defaults. Strong `ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)`.
- Reveals: 700–1000ms (deliberately slow for the cinematic feel).
- UI feedback (button press): 100–160ms, `scale(0.97)`.
- Never `ease-in` on entrances; never animate from `scale(0)`.

## 3. Typography system

- **Display:** a tightly-tracked grotesque (or heavy sans) at huge fluid sizes — `clamp()` from
  ~3rem mobile to ~11rem on large desktop. Negative letter-spacing (`-0.02em` to `-0.04em`),
  line-height ~0.95–1.0.
- **Accent:** occasional contrast face (e.g. a serif italic) on a single word for editorial pop.
- **Meta labels:** small uppercase, often monospace, wide tracking (`0.08em`) — section indices
  like `01 / Work`.
- **Body:** clean sans, 1.1–1.25rem, line-height ~1.5, measured to ~60ch.

## 4. Layout & spacing

- 12-column grid with a generous max-width (~1400–1600px) and large gutters.
- Section padding is the spacing workhorse: vertical `clamp(6rem, 14vh, 12rem)`.
- Lots of negative space — content rarely fills the column.
- Spacing follows a consistent scale (e.g. 4 / 8 / 16 / 24 / 40 / 64 / 96 / 160).

## 5. Color logic

- Near-monochrome base (one warm off-white + one near-black) carries 95% of the design.
- A **single** saturated accent, used sparingly (links, small marks, one CTA). Restraint reads
  as expensive.
- Dark sections invert the same two neutrals.

## 6. Responsive behavior

- Fluid type via `clamp()` means few hard breakpoints are needed for text.
- Layout breakpoints typically ~768px (tablet) and ~1024px (desktop).
- Heavy motion (custom cursor, magnetic, hover-preview) is **disabled** under `pointer: coarse`;
  mobile gets inline thumbnails instead of cursor-following previews.
- All motion respects `prefers-reduced-motion: reduce`.

## 7. Likely stack (from observed behavior)

- Smooth scroll: **Lenis**
- Scroll animation/orchestration: **GSAP + ScrollTrigger** (or Motion)
- Build/CMS: commonly **Webflow** or a **Next.js** front-end
- A `.mp4` showreel for the video band

---

## How this maps to the build in `portfolio/`

| Technique | Implementation here |
| --- | --- |
| Inertia scroll | Lenis via CDN, progressively enhanced (native fallback) |
| Masked line reveals | `.line > .line-inner` translateY, staggered on load |
| Scroll reveals | `IntersectionObserver` → `.in`, fade + rise + blur-clear |
| Parallax | rAF, `transform: translate3d` driven by scroll |
| Work hover-preview | floating element, cursor-following with lerp |
| Magnetic buttons | pointer-delta transform, fine-pointer only |
| Custom cursor | blend-mode ring, lerp follow, grows on hover |
| Easing | Emil Kowalski curves in CSS variables |
| Reduced motion | every effect gated behind `prefers-reduced-motion` |

Everything is original: original copy, original palette, open-source fonts, generated
placeholder visuals you replace with your own.
