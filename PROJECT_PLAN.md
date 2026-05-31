# PROJECT_PLAN.md
# Portfolio Website — Fullstack Creative Developer
> Dark-first · Editorial · AI-assisted · Precision meets craft.

---

## 0. Identity & Positioning

```
Role        : Fullstack Developer × UI/UX Designer, AI-amplified
Tone        : Editorial. Not cold, not loud — precise and intentional.
Benchmark   : HelloMonday (storytelling + fluid transitions)
              Lusion (immersive, alive)
Theme       : Dark-first monochromatic + single phosphor accent
Motion      : Seimbang — immersive, not overwhelming
```

---

## 1. Tech Stack

| Layer | Tool | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG/SSR, image optimization, AI-agent friendly |
| Styling | Tailwind CSS v4 | Utility-first, native CSS vars, fast build |
| Animation | GSAP + ScrollTrigger | Industry standard, HelloMonday/Lusion level |
| Text anim | GSAP SplitText | Words/chars reveal, wajib untuk hero |
| Smooth scroll | Lenis v1 | Foundational — semua ScrollTrigger butuh ini |
| Page transition | Custom Canvas (Mercury) | Liquid curtain, zero dependencies |
| Components | Framer Motion | Layout transitions, gesture-based micro-interactions |
| 3D (optional) | Three.js / R3F | WebGL particles — add Phase 3 jika perlu |
| Language | TypeScript | Type safety, DX optimal untuk AI agent |
| Fonts | Google Fonts (self-hosted) | Freight Display Pro alt → Playfair Display, DM Sans, JetBrains Mono |
| IDE | VS Code + AI Agent (Cursor/Copilot) | Primary development environment |

---

## 2. Folder Structure

```
portfolio/
├── app/
│   ├── layout.tsx              # Root layout — Lenis init, cursor, transition provider
│   ├── page.tsx                # Home (Hero + Work preview + CTA)
│   ├── work/
│   │   ├── page.tsx            # Work grid — all projects
│   │   └── [slug]/
│   │       └── page.tsx        # Project detail
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Sticky, scroll-hide, minimal
│   │   ├── Footer.tsx
│   │   └── PageTransition.tsx  # Mercury liquid curtain wrapper
│   ├── ui/
│   │   ├── CustomCursor.tsx    # Magnetic, context-aware
│   │   ├── SplitText.tsx       # Reusable text animation
│   │   ├── MagneticButton.tsx  # GSAP quickTo magnetic hover
│   │   └── ScrollReveal.tsx    # Generic ScrollTrigger wrapper
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── WorkGrid.tsx
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   └── Contact.tsx
│   └── canvas/
│       └── LiquidCurtain.tsx   # Mercury transition canvas
│
├── hooks/
│   ├── useLiquidTransition.ts  # Page transition logic
│   ├── useMagnet.ts            # Magnetic hover hook
│   ├── useSmoothScroll.ts      # Lenis instance
│   └── useSplitText.ts         # Text split animation
│
├── lib/
│   ├── gsap.ts                 # GSAP + ScrollTrigger setup, Lenis sync
│   ├── motion.ts               # Motion tokens — easing, duration, stagger
│   └── transitions/
│       └── mercury.ts          # Mercury curtain draw function
│
├── styles/
│   ├── globals.css             # CSS variables, base styles
│   └── fonts.css               # @font-face declarations
│
├── public/
│   ├── fonts/                  # Self-hosted font files
│   └── images/
│
├── content/
│   └── projects/               # MDX atau JSON project data
│
├── tailwind.config.ts
├── tsconfig.json
└── PROJECT_PLAN.md             # ← this file
```

---

## 3. Design Tokens

### 3.1 Color Palette

```css
/* styles/globals.css */
:root {
  /* === BACKGROUNDS === */
  --color-void:        #0A0A0A;   /* Background utama */
  --color-carbon:      #111111;   /* Cards, panels */
  --color-onyx:        #1C1C1C;   /* Hover states, elevated surfaces */
  --color-graphite:    #2A2A2A;   /* Borders, dividers */

  /* === TEXT === */
  --color-white:       #FFFFFF;   /* Primary text */
  --color-ash:         #888888;   /* Secondary text */
  --color-smoke:       #555555;   /* Tertiary, labels */

  /* === ACCENT === */
  --color-phosphor:    #C9F0A8;   /* CTA, highlights — gunakan sparingly */
  --color-phosphor-dim:#7db865;   /* Phosphor hover state */

  /* === WARM TONES === */
  --color-linen:       #E8E0D5;   /* Warm accent, serif teks dekoratif */

  /* === SEMANTIC === */
  --color-bg:          var(--color-void);
  --color-surface:     var(--color-carbon);
  --color-surface-2:   var(--color-onyx);
  --color-border:      var(--color-graphite);
  --color-text-1:      var(--color-white);
  --color-text-2:      var(--color-ash);
  --color-text-3:      var(--color-smoke);
  --color-accent:      var(--color-phosphor);
}
```

### 3.2 Typography Scale

```css
/* Fluid type scale — clamp(min, preferred, max) */
:root {
  /* Display — Playfair Display (serif) */
  --font-display:      'Playfair Display', Georgia, serif;

  /* Body + UI — DM Sans (geometric sans) */
  --font-body:         'DM Sans', system-ui, sans-serif;

  /* Mono — labels, code, technical */
  --font-mono:         'JetBrains Mono', monospace;

  /* === TYPE SCALE === */
  --text-hero:         clamp(52px, 9vw, 128px);    /* Hero H1 */
  --text-display:      clamp(36px, 5.5vw, 80px);   /* Section titles */
  --text-h2:           clamp(28px, 4vw, 56px);      /* Sub-sections */
  --text-h3:           clamp(20px, 2.5vw, 32px);    /* Cards, items */
  --text-body-lg:      clamp(17px, 1.5vw, 20px);    /* Body large */
  --text-body:         16px;                         /* Body default */
  --text-small:        14px;                         /* Captions */
  --text-label:        11px;                         /* Labels, tags */

  /* === LINE HEIGHT === */
  --leading-tight:     1.1;
  --leading-snug:      1.25;
  --leading-normal:    1.6;
  --leading-relaxed:   1.75;

  /* === LETTER SPACING === */
  --tracking-tight:    -0.04em;   /* Hero, display */
  --tracking-normal:   -0.01em;   /* Body */
  --tracking-wide:     0.08em;    /* Labels, mono */
  --tracking-widest:   0.14em;    /* Uppercase tags */
}
```

### 3.3 Spacing System (4px base grid)

```css
:root {
  --s-1:   4px;
  --s-2:   8px;
  --s-3:   12px;
  --s-4:   16px;
  --s-5:   20px;
  --s-6:   24px;
  --s-8:   32px;
  --s-10:  40px;
  --s-12:  48px;
  --s-16:  64px;
  --s-20:  80px;
  --s-24:  96px;    /* Section padding mobile */
  --s-32:  128px;   /* Section padding desktop */
  --s-40:  160px;   /* Large section gaps */
  --s-48:  192px;   /* Hero padding top */
}
```

### 3.4 Border Radius

```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   20px;
  --radius-full: 999px;
}
```

---

## 4. Motion Tokens

```ts
// lib/motion.ts
export const motion = {

  // === EASING ===
  easing: {
    // Default untuk semua entrance & reveal
    expoOut:       'expo.out',               // cubic-bezier(0.16, 1, 0.3, 1)
    // Page transitions, curtain
    expoInOut:     'expo.inOut',             // cubic-bezier(0.87, 0, 0.13, 1)
    // Spring, magnetic hover, elastic
    backOut:       'back.out(1.7)',          // cubic-bezier(0.34, 1.56, 0.64, 1)
    // Scroll scrub — proportional, tidak agresif
    power2InOut:   'power2.inOut',
    // Subtle ambient, background elements
    sineOut:       'sine.out',
    // JANGAN pakai linear sendirian
  },

  // === DURATION (ms) ===
  duration: {
    instant:    150,    // Micro-interactions: hover state, tooltip
    fast:       300,    // Button hover, small UI response
    normal:     500,    // Card reveal, small entrance
    medium:     700,    // Headline reveal, section entrance
    slow:       900,    // Hero animations, dramatic reveals
    cinematic:  1200,   // Page transitions, full-screen effects
    crawl:      2000,   // Ambient, background parallax
  },

  // === STAGGER (delay antar item, detik) ===
  stagger: {
    tight:      0.03,   // Char-by-char text reveal
    normal:     0.06,   // Word reveal
    relaxed:    0.08,   // Line reveal
    cards:      0.10,   // Grid card entrance
    sections:   0.15,   // Large section items
  },

  // === SCROLL TRIGGER ===
  scrollTrigger: {
    start:      'top 80%',      // Element mulai animate saat 80% dari top viewport
    end:        'top 20%',      // Selesai di 20%
    scrubFactor: 1.2,           // Lag factor Lenis-GSAP sync (smooth feel)
    once:       true,           // Animasi hanya trigger sekali (performance)
  },

  // === TEXT ANIMATION DEFAULTS ===
  text: {
    wordsReveal: {
      y: 40, opacity: 0,
      duration: 0.7, ease: 'expo.out', stagger: 0.06,
    },
    charsReveal: {
      y: 20, opacity: 0, rotateX: 90,
      duration: 0.5, ease: 'back.out', stagger: 0.025,
    },
    clipReveal: {
      yPercent: 110,
      duration: 0.8, ease: 'expo.out', stagger: 0.08,
    },
  },
} as const;
```

---

## 5. Page Transition — Mercury Liquid Curtain

```
Type        : Mercury (metallic, high-frequency ripple)
Color       : #0A0A0A (Void) — selaras dark-first palette
Duration    : 800ms phase-in + 800ms phase-out = 1600ms total
Trigger     : Next.js router navigation (useRouter hook)
Canvas      : Full-screen absolute, z-index 9999
```

### Implementasi

```ts
// lib/transitions/mercury.ts

function easeInOutExpo(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

export function drawMercuryCurtain(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  progress: number,        // 0 = hidden, 1 = full coverage
  amplitude: number = 1    // 0.5–2.0 untuk tweak karakter
): void {
  const eased = easeInOutExpo(progress);
  ctx.clearRect(0, 0, W, H);
  if (progress <= 0) return;

  ctx.fillStyle = '#0A0A0A';
  ctx.beginPath();
  ctx.moveTo(0, 0);

  const segments = 18;
  for (let i = 0; i <= segments; i++) {
    const y = (i / segments) * H;
    const frac = i / segments;
    // High-frequency ripple — frekuensi 4x dari viscous
    const ripple =
      Math.sin(frac * Math.PI * 4 + progress * 14)
      * amplitude * 18
      * Math.sin(Math.PI * progress * 1.2); // amplitude max di midpoint
    ctx.lineTo(W * eased + ripple, y);
  }

  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}
```

```tsx
// hooks/useLiquidTransition.ts
import { useCallback, useRef } from 'react';
import { drawMercuryCurtain } from '@/lib/transitions/mercury';

function animateProgress(
  from: number,
  to: number,
  duration: number,
  onUpdate: (val: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      onUpdate(from + (to - from) * t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

export function useLiquidTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const trigger = useCallback(async (onMidpoint: () => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    // Phase 1: curtain masuk
    await animateProgress(0, 1, 800, (p) => drawMercuryCurtain(ctx, W, H, p));

    onMidpoint(); // ← router.push() / swap konten di sini

    // Phase 2: curtain keluar
    await animateProgress(1, 0, 800, (p) => drawMercuryCurtain(ctx, W, H, p));
    ctx.clearRect(0, 0, W, H);
  }, []);

  return { canvasRef, trigger };
}
```

```tsx
// components/layout/PageTransition.tsx
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useLiquidTransition } from '@/hooks/useLiquidTransition';
import { createContext, useContext, useCallback, useEffect, useRef } from 'react';

const TransitionContext = createContext<{
  navigate: (href: string) => void;
}>({ navigate: () => {} });

export function useNavigate() {
  return useContext(TransitionContext);
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { canvasRef, trigger } = useLiquidTransition();

  const navigate = useCallback(async (href: string) => {
    await trigger(() => router.push(href));
  }, [trigger, router]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          pointerEvents: 'none', width: '100%', height: '100%',
        }}
      />
    </TransitionContext.Provider>
  );
}
```

---

## 6. Lenis + GSAP Setup

```ts
// lib/gsap.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initLenis(): Lenis {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });

  // Sync Lenis RAF dengan GSAP ticker — WAJIB
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Sync Lenis scroll position ke ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  return lenis;
}
```

```tsx
// app/layout.tsx (excerpt)
'use client';
import { useEffect } from 'react';
import { initLenis } from '@/lib/gsap';

export default function RootLayout({ children }) {
  useEffect(() => {
    const lenis = initLenis();
    return () => lenis.destroy();
  }, []);

  return (
    <html lang="en">
      <body>
        <PageTransition>
          <CustomCursor />
          <Navbar />
          {children}
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
```

---

## 7. Custom Cursor

```
States:
  default   → dot 12px solid #FFFFFF
  hover-link → ring 40px border #FFFFFF
  hover-project → circle 60px fill #C9F0A8, label "VIEW"
  hover-text → ring 24px border #888
  input → caret line 2px × 40px

Implementasi: GSAP quickTo untuk zero-latency smooth tracking
Magnetic range: 80px dari center elemen
Magnetic pull: 30% dari jarak cursor ke center
```

```tsx
// components/ui/CustomCursor.tsx (struktur)
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const xTo = gsap.quickTo(dotRef.current, 'x', { duration: 0.1, ease: 'power3' });
    const yTo = gsap.quickTo(dotRef.current, 'y', { duration: 0.1, ease: 'power3' });
    const xRing = gsap.quickTo(ringRef.current, 'x', { duration: 0.4, ease: 'power3' });
    const yRing = gsap.quickTo(ringRef.current, 'y', { duration: 0.4, ease: 'power3' });

    const move = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY); xRing(e.clientX); yRing(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  // ... state management untuk hover types
}
```

---

## 8. Build Order — Section per Section

```
Phase 0  [Done]       PROJECT_PLAN.md
Phase 1  [Done]       Project init, folder structure, tokens, fonts, Lenis
Phase 2  [Sekarang]   Section per section — urutan di bawah (Ready for Navbar & Header!)
Phase 3  [Polish]     Performance, accessibility, lighthouse audit
Phase 4  [Launch]     Vercel deploy, domain, analytics
```

### Build Order Detail

```
01  Navbar & Header
    ├── Sticky, scroll-hide behavior (threshold 80px)
    ├── Transparent → frosted on scroll (backdrop-filter)
    ├── Nav links dengan magnetic hover
    └── Mobile: hamburger dengan full-screen overlay

02  Hero
    ├── Full viewport height
    ├── Display headline — Playfair Display, words reveal (600ms, expo.out)
    ├── Sub-copy — DM Sans, fade up after headline (delay 400ms)
    ├── CTA button — MagneticButton dengan Phosphor fill
    ├── Scroll indicator — animated arrow, lenis-sync opacity
    └── Background — subtle noise texture atau dark gradient mesh

03  Work / Projects Grid
    ├── 2-column asymmetric grid (featured project larger)
    ├── Card hover: image scale 1.05, overlay dengan project info
    ├── Stagger entrance: ScrollTrigger, 100ms per card
    ├── Clip-path hover reveal untuk project title
    └── "View all" link dengan magnetic effect

04  About (Storytelling layout)
    ├── Large serif pull-quote — Playfair italic
    ├── Parallax: text scroll lebih lambat dari background
    ├── Skills/stack list — stagger reveal
    └── Foto/avatar dengan subtle parallax

05  Services / Stack
    ├── Horizontal scrolling list atau vertical accordion
    ├── Number counter (01, 02, 03) — JetBrains Mono
    └── Hover expand per service

06  Contact
    ├── Large "Let's talk" heading — words reveal
    ├── Email link — magnetic, Phosphor underline on hover
    ├── Social links dengan stagger entrance
    └── Minimal form (nama, email, pesan) — optional

07  Footer
    ├── Copyright, tahun (auto-update JS)
    ├── Back to top — smooth scroll ke #hero
    └── Easter egg: Konami code atau cursor trail

+   Custom Cursor (implement di Phase 1, refine per section)
+   Page Transitions (mercury curtain — implement Phase 1)
```

---

## 9. Performance Targets

```
Lighthouse score  : ≥ 90 semua kategori
LCP               : < 2.5s
CLS               : < 0.1
FID               : < 100ms
Bundle size       : < 200KB JS (excluding Three.js)
Fonts             : Self-hosted, font-display: swap
Images            : next/image, WebP, lazy load
Animations        : will-change: transform (hanya elemen aktif)
                    prefers-reduced-motion media query — wajib
```

---

## 10. Environment Setup

```bash
# Init project
npx create-next-app@latest portfolio \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd portfolio

# Dependencies
npm install gsap lenis framer-motion

# Dev dependencies
npm install -D @types/node

# GSAP SplitText — butuh GSAP Club membership
# Alternatif open source: split-type
npm install split-type
```

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:     '#0A0A0A',
        carbon:   '#111111',
        onyx:     '#1C1C1C',
        graphite: '#2A2A2A',
        ash:      '#888888',
        smoke:    '#555555',
        phosphor: '#C9F0A8',
        linen:    '#E8E0D5',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        'expo-out':     'cubic-bezier(0.16, 1, 0.3, 1)',
        'expo-in-out':  'cubic-bezier(0.87, 0, 0.13, 1)',
        'back-out':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
} satisfies Config;
```

---

## 11. Accessibility Checklist

```
[ ] prefers-reduced-motion — semua animasi GSAP wrapped di matchMedia check
[ ] Focus visible — custom outline untuk keyboard nav (Phosphor ring)
[ ] Alt text — semua gambar project punya meaningful alt
[ ] Semantic HTML — section, nav, main, article, h1-h6 hierarchy benar
[ ] Color contrast — text on Void bg: #888 minimum (4.5:1 ratio)
[ ] ARIA labels — CustomCursor hidden dari screen reader (aria-hidden)
[ ] Skip to content link — tersembunyi, muncul saat focus
```

---

## 12. Catatan AI Agent Workflow

```
- Setiap session mulai dengan baca PROJECT_PLAN.md ini
- Build section-by-section, satu file selesai sebelum lanjut
- Semua motion value SELALU ambil dari lib/motion.ts (tidak hardcode)
- Semua warna SELALU pakai CSS variables (tidak hardcode hex di komponen)
- Commit per section: feat(hero): add split text reveal animation
- Test di mobile setiap section selesai (375px breakpoint)
```

---

*Last updated: Phase 1 — Setup complete*
*Next: Build Navbar & Header*
