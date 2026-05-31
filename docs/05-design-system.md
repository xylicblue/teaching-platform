# 05 — Design System

The visual and interaction language for the platform. Every screen builds on this vocabulary.

## Core posture

**Editorial, scholarly, warm, regionally-grounded.** Closer in feel to a respected private academy than to Khan Academy / BYJU's / Duolingo.

- Voice: *considered, warm, specific, plainspoken*
- Anti-voice: *playful, gamified, hyped, transformational*
- Single-word mood: **trustworthy**

## The non-negotiable

**Must not look AI-designed.** Explicitly reject the visual epidemic of:

- Mesh / purple-pink gradients
- Glassmorphism cards floating over blurred blobs
- 3-column feature grids with abstract icons
- Stock photos of multi-ethnic smiling people at laptops
- Bento grids without purpose
- 3D objects, floating geometric shapes, Lottie decorative filler
- "Step 1 / Step 2 / Step 3" how-it-works rows
- Testimonial carousels with avatars and star ratings
- "Trusted by" logo bars
- Border radius ≥16px on cards
- Generic SaaS button copy ("Get Started Free", "Unlock", "Empower")

## References to study

- The New Yorker (editorial type discipline)
- Ghost.org (warm minimalism, considered restraint)
- MIT Press, A Book Apart (publishing design language)
- Mubi (confident dark editorial, but warm)
- Outschool tutor profile pages (information density, real people)

## Color tokens

| Token | Hex | Use |
|---|---|---|
| Paper | `#FAF7F2` | Page background — warm off-white, not pure white |
| Ink | `#1F1B16` | Headlines, body — warm near-black with brown undertone |
| Slate | `#5C544A` | Captions, metadata, eyebrow labels |
| Cloud | `#E5DFD3` | Hairline rules, muted card backgrounds |
| Evergreen | `#1F4A3D` | Primary buttons, hover links, brand mark |
| Saffron | `#C9923B` | Pull-quote underlines, badges, highlight strokes — sparingly |
| Terracotta | `#B0532A` | Rare moments only — "limited slots" badges, error states |
| Success | `#3B6E54` | Confirmation, verified badges |
| Warning | `#A8741C` | Late reschedule warnings, urgency cues |
| Critical | `#962E1F` | Errors only |

### Rules

- **No gradients anywhere.** Solid fills only. Single allowed exception: optional ≤3% opacity paper-texture overlay on the hero.
- **Evergreen and Saffron should never appear on the same component.** Pick one per section.
- Dark mode is **not** in scope for v1.
- The palette is tuned to itself — don't drift one chip without re-evaluating the others.

## Typography

| Use | Font | Notes |
|---|---|---|
| Display / Headlines | **Fraunces** (soft, optical-display variant) | Weights 400 and 600; italics used deliberately. Alternative: Newsreader. |
| Body / UI | **Inter** | Weights 400, 500, 600. Body tracking -0.005em. |
| Mono | **JetBrains Mono** | Weight 400. *Only* for session codes, exam codes, system metadata. |

### Scale (starting point)

```
Hero headline      Fraunces 600  64–96px  line-height 1.05  tracking -0.02em
Section headline   Fraunces 500  40–48px  line-height 1.1
Subhead            Fraunces 400  24–28px  italic optional
Eyebrow label      Inter 500     12px     uppercase  tracking 0.12em  Slate
Body large         Inter 400     18px     line-height 1.6
Body               Inter 400     16px     line-height 1.55
Caption            Inter 400     13px     Slate
```

Use Fraunces italics deliberately — pull quotes, emotional emphasis.

## Layout principles

- **Asymmetric editorial grids** — 12-column underneath but compositions rarely use all 12 evenly. Think magazine spread.
- **Generous breathing room around headlines; tight density inside content blocks.** A teacher card should feel like a trading card — information-rich, not a vast empty card with one icon.
- **One hero element per fold.**
- **Hairlines, not shadows.** 1px Cloud lines for card separation. Drop shadows only on hover, low opacity.
- **Border radius discipline:** 4px buttons / 6px cards / 8–12px max on largest containers.

## Imagery

- **Real photography of real local people.** Commission a small shoot for early teachers; carefully sourced otherwise. Pakistani settings, not generic global stock.
- Allowed: half-tone treatment, warm color grading, occasional duotone in Ink + Paper.
- **No abstract illustration libraries** — no unDraw, Storyset, Notion-style line illustrations. If illustration needed, commission one illustrator with an editorial style.
- **Icons:** Lucide, 1.5px stroke. Used sparingly — UI controls only, never decorative section toppers.
- **Allowed graphic flourishes:** thin Saffron underline brushstrokes under select words; occasional hand-drawn arrow annotation; marginalia-style notes in Slate.

## Motion

- Default duration: **180–220ms ease-out**
- Hover states: every interactive element changes subtly — 1px underline, color shift to Evergreen, 2px lift. No bouncy springs.
- Page transitions: crossfade only (120ms). No swooshy slide-ins.
- Scroll: no parallax, no scroll-jacking. Native browser scrolling.
- **One allowed exception:** when the catalog section enters the viewport, stream cards fade in with a 40ms stagger. Once. That's it.
- Respect `prefers-reduced-motion` — disable all motion when set.

## Accessibility

- Body contrast ≥ AAA (Ink on Paper is already AAA — keep it).
- Slate captions hit AA — verify per use.
- Saffron not allowed on text smaller than 24px (insufficient contrast on Paper).
- Every interactive element has visible focus state: **2px Evergreen ring with 2px offset**.
- All copy must work at 200% zoom without horizontal scroll.
- Alt text everywhere, including decorative pull-quote treatments.

## Forbidden copy words

In any user-facing copy:

- *unlock, empower, transform, revolutionize, journey, seamless, ecosystem*

## Tailwind token mapping (for handoff)

To translate into `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      paper: '#FAF7F2',
      ink: '#1F1B16',
      slate: '#5C544A',
      cloud: '#E5DFD3',
      evergreen: '#1F4A3D',
      saffron: '#C9923B',
      terracotta: '#B0532A',
      success: '#3B6E54',
      warning: '#A8741C',
      critical: '#962E1F',
    },
    fontFamily: {
      display: ['Fraunces', 'serif'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    borderRadius: {
      'btn': '4px',
      'card': '6px',
      'lg': '8px',
      'xl': '12px',
    },
    transitionDuration: {
      DEFAULT: '200ms',
    },
    transitionTimingFunction: {
      DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',  // ease-out variant
    },
  },
}
```
