# 06 — Landing Page Brief

> **For the designer.** This brief is the spec for the public landing page. It assumes [the design system](./05-design-system.md) is the source of truth for tokens; this doc focuses on the page itself.

## 0. Context

We're building a tutoring marketplace for **O-level and A-level students in Pakistan and the broader South Asian region** (global expansion later). Students browse by curriculum level → stream → subject, find a teacher, request a free demo class, and enroll. Sessions run on Google Meet; the platform handles everything around them.

You're designing the **public landing page** — the page a student or parent lands on with zero prior context. Its job: in under 5 seconds, communicate *what this is*, *who it's for*, and *how to start*, then escort them into the catalog.

## 1. The single most important instruction

**This site must not look like it was designed by AI.**

The current visual epidemic in ed-tech / SaaS landing pages — purple-pink gradients, three-column feature grids with abstract icons, stock photos of multi-ethnic smiling people at laptops, glassmorphism cards floating over blurred blobs — has made every product page look interchangeable. We are not that.

Inspiration:
- **The New Yorker** (editorial type discipline, serif headlines with personality)
- **Ghost.org** (warm minimalism, considered restraint)
- **MIT Press** / **A Book Apart** (publishing-led design language)
- **Mubi** (confident dark editorial, but warm)
- **Outschool's tutor profile pages** (information density, real people)

Explicitly **avoid the visual language** of generic SaaS landing pages, bootcamp ed-tech (Lambda School, Coursera), crypto/AI startup pages, stock-photo-heavy corporate sites.

## 2. Brand voice

Serious, warm, regionally-grounded. Closer to a respected private academy than to Khan Academy or BYJU's.

- Voice: *considered, scholarly, warm, specific, plainspoken*
- Anti-voice: *playful, gamified, hyped, transformational*
- Mood: **trustworthy**

## 3. Visual system

The tokens (color, type, motion) are in [the design system doc](./05-design-system.md). Use them strictly. The TL;DR:

- **Paper** `#FAF7F2` base, **Ink** `#1F1B16` text, **Evergreen** `#1F4A3D` primary, **Saffron** `#C9923B` secondary
- **Fraunces** for display, **Inter** for body, **JetBrains Mono** for codes
- Hairlines over shadows; 4–8px radius max; no gradients; no glassmorphism

## 4. Section-by-section spec

### 4.1 Top navigation

- Sticky, Paper-colored, 1px Cloud bottom border on scroll
- Left: wordmark (Fraunces 500, ~22px, Ink)
- Center: *Browse Tutors · How it works · For Parents · For Teachers* (Inter 500, 14px)
- Right: *Sign in* (text link) + *Find a tutor* (Evergreen button, 14px, 8px/18px padding, 4px radius)
- Mobile: hamburger → full-screen drawer with same items in large Fraunces

### 4.2 Hero (above the fold)

**Goal:** in 2 seconds, convey "this is a serious tutoring marketplace for O/A levels."

Composition:
- Asymmetric
- **Left column (60% width on desktop):** editorial headline. Starting options:
  - *"Find a tutor who's already sat the paper you're about to."*
  - *"Better grades start with the right teacher. We help you find one."*
  - *"O and A levels are hard enough. Finding the right teacher shouldn't be."*
- **Subhead** (Fraunces 400 italic, 24px): one sentence, plain language
- **Catalog entry point** — *not* a "Get Started" button. Three pill selectors and a primary CTA:
  - Level (O / A / IGCSE)
  - Subject (Physics, Chemistry…)
  - Exam board (CAIE, Edexcel, AQA)
  - CTA: *"See tutors."*
- **Right column (40%):** real photograph of a teacher mid-session at a table with handwritten notes, slightly desaturated, with a Saffron caption: *"Mr. Hassan, A-level Physics. 9 years teaching CAIE."*

Motion: a single slow text reveal on first load (200ms ease-out). No bouncing.

### 4.3 The catalog (the real hero of this page)

Place immediately after the hero. Not buried.

- **Levels as horizontal tabs** at the top (O Level · A Level · IGCSE · MYP · IB) with subtle Saffron underline on the active tab
- **Streams as cards** below (Sciences, Humanities, Commerce, Languages, Mathematics):
  - Each card has Fraunces stream name, one-line Slate description, sample of 4 subjects ("Physics, Chemistry, Biology, Computer Science")
  - Hover: lifts 2px, hairline Evergreen border appears, faint "*12 tutors available*" reveals at bottom
- **Every subject is clickable directly.** Don't force three discrete clicks.

### 4.4 "Tutors we'd recommend right now"

Curated row of **6 featured tutor cards.** Trading-card style — dense, beautiful, full of real information.

Each card:
- Real photograph (square crop, 1:1, warm grade)
- Name (Fraunces 500): *"Ayesha Khan"*
- Subjects (Inter Slate): *"A-level Chemistry, IGCSE Chemistry"*
- One-line quote (Fraunces italic): *"I teach because the syllabus deserves better explanations than the textbook gives."*
- Specific credential: *"CAIE A* June 2018 · MSc Imperial College"*
- Footer row, 4 micro-stats in JetBrains Mono: **★ 4.9 · 142 sessions · Responds in 1h · Rs 2,500/hr**
- Hover: card lifts 2px, "See profile" appears in Evergreen at bottom right

No carousel arrows. Static grid. Single *"Browse all 247 tutors →"* link in Evergreen below.

### 4.5 The "how this works" section — done differently

**Reject the standard "Step 1 / Step 2 / Step 3" pattern.**

Write this as a short narrative, set like a magazine column with a drop cap:

> ***Hira's mother*** *messaged us in September. Her daughter's CIE A-levels were eight months out and she was failing Physics mocks. We matched her with Mr. Hassan, who has tutored A-level Physics on the CAIE syllabus since 2015. They met for a free 30-minute demo class on a Sunday. By the end, Hira asked her mother if they could book the next session.*
>
> *In June, Hira sat 9702/22. She scored an A.*

Below, a thin Cloud divider and a small caption:

> *"This is what we do. You message us. We match you. You meet your tutor. You take it from there."*

That section is **one block of editorial text**. No icons. No step cards. It will stop people scrolling because nothing else looks like this.

### 4.6 Demo class CTA strip

Full-width band, Evergreen background, Paper text.

- Headline (Fraunces 500, 40px, Paper):
  > *"Try a demo class. It's free, it's 30 minutes, and you don't have to commit to anything."*
- Right side: Saffron button (**only place Saffron is used as a button background**): *"Request a demo class"*

No subhead. No extra noise.

### 4.7 For parents (specific carve-out)

Parents are the buyers in this market.

Two-column section:
- **Left:** Fraunces headline (*"A note for parents."*) + short paragraph in Body Large covering safeguarding, verified tutors, recording access via Google Drive, refund policy, admin oversight
- **Right:** four small information chits in a vertical stack (Cloud background, 1px border, 12px padding), each with one factual claim and a small Saffron underline — e.g., *"Every tutor's ID and qualifications are verified before they teach."*

No icons. No badges. Plain claims, clearly stated.

### 4.8 What students say (single pull quote, not a carousel)

Single large pull quote in Fraunces 400 italic, 56px, centered, in Ink, with Saffron hairlines above and below:

> *"My CIE Chemistry teacher at school skipped half the syllabus. Mr. Salman went through every past paper since 2017 with me. I got an A*."*
>
> — Bilal, A2 student, Lahore.

Below: small line — *"Read 1,200+ reviews from students and parents →"*.

If more social proof is needed elsewhere on the page, use *one* more pull quote later. Never a carousel.

### 4.9 For teachers

Visually quieter than student sections. Two-column band, paper background tinted slightly more cream (`#F4EFE5`) to signal context shift.

- **Left:** Fraunces headline (*"Teach with us."*) + 2-sentence pitch about commission, payouts, the kind of teacher we look for
- **Right:** Single primary CTA *"Apply to teach"* + small text link *"What we look for in a tutor →"*

### 4.10 Footer

Proper editorial footer with substance.

Four columns:
1. **Subjects** — every major subject, alphabetized, as text links (also SEO landing pages)
2. **Exam boards** — CAIE, Edexcel, AQA, OCR, IB, each linking to a board guide
3. **For students & parents** — How it works, Pricing, Safety, FAQs, Refunds
4. **Company** — About, Careers, Press, Contact, Blog

Below: thin rule, wordmark again, copyright in Slate, language switcher (English / اردو), single line:

> *"Made in Lahore. Built for South Asian students."*

No social icon row. (Social lives in About or Press if needed.)

## 5. Interaction & motion rules

- Default duration: 180–220ms ease-out
- Hover states: every interactive element changes *something* subtly — 1px underline, color shift to Evergreen, 2px lift. No bouncy springs.
- Page transitions: crossfade only (120ms)
- Scroll: no parallax, no scroll-jacking
- **One exception:** catalog stream cards fade in with 40ms stagger when section enters viewport. Once.

## 6. Mobile

- Single column but **don't sacrifice information density.** A mobile teacher card still shows photo, name, subjects, quote, credential, 4 micro-stats.
- Catalog levels: horizontal scroll of pills with snap
- Hero headline drops to 40–48px; right-column photo moves below
- Touch targets ≥44px

## 7. Accessibility (non-negotiable)

- Body contrast ≥ AAA
- Slate captions hit AA
- Saffron not on text <24px
- Visible focus states (2px Evergreen ring, 2px offset)
- `prefers-reduced-motion` disables all animation
- Alt text everywhere
- All copy works at 200% zoom without horizontal scroll

## 8. Deliverables

1. **Three desktop hero direction explorations** (different headlines, different photo treatments, within the design system)
2. **Full landing page mock at 1440px and 375px** — every section above
3. **A small style spec page** — type ramp, color tokens, button states, card components
4. **Handoff doc** with all design tokens ready for `tailwind.config.js`

Use Figma. Auto-layout everything. Component-ize the teacher card and the section-headline pattern.

## 9. Rejection criteria

I will reject on sight:

- Any gradient
- Any glassmorphism
- Generic stock photography
- "Get Started Free" button copy
- Three-column feature grid with abstract icons
- Testimonial carousels
- Numbered "How it works" steps
- Floating circles, blobs, 3D objects
- "Trusted by" logo bars
- Border radius >8px on most things (>12px on largest containers max)
- Drop shadows on idle elements
- Lottie animations
- Emoji in section headings
- Copy containing: *unlock, empower, transform, revolutionize, journey, seamless, ecosystem*
