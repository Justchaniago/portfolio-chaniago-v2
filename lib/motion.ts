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
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'expo.out',
      stagger: 0.06,
    },
    charsReveal: {
      y: 20,
      opacity: 0,
      rotateX: 90,
      duration: 0.5,
      ease: 'back.out',
      stagger: 0.025,
    },
    clipReveal: {
      yPercent: 110,
      duration: 0.8,
      ease: 'expo.out',
      stagger: 0.08,
    },
  },
} as const;
