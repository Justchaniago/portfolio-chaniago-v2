export const MOTION_DURATIONS = {
  instant: 0.15,
  fast: 0.3,
  footer: 0.3,
  column: 0.34,
  eclipseRise: 0.36,
  eclipseBlackout: 0.38,
  fade: 0.45,
  normal: 0.5,
  medium: 0.7,
  containerExit: 0.8,
  textReveal: 0.82,
  eclipseCover: 0.86,
  slow: 0.9,
  lineReveal: 1.0,
  cinematic: 1.2,
  crawl: 2.0,
} as const;

export const MOTION_EASES = {
  none: 'none',
  standard: 'power2.out',
  premium: 'premiumBezier',
  inOut: 'power2.inOut',
  backOut: 'back.out(1.7)',
  expoInOut: 'expo.inOut',
  power3Out: 'power3.out',
  power4Out: 'power4.out',
  power4InOut: 'power4.inOut',
} as const;

export const MOTION_STAGGERS = {
  tight: 0.025,
  textChar: 0.045,
  normal: 0.06,
  relaxed: 0.08,
  cards: 0.1,
  sections: 0.15,
} as const;

export const MOTION_DISTANCES = {
  subtle: 12,
  columnOffset: 18,
  dramatic: 24,
  moderate: 40,
  workExitOffset: 80,
  textRevealPercent: '112%',
} as const;

export const MOTION_OPACITIES = {
  hidden: 0,
  visible: 1,
} as const;

export const MOTION_SCALES = {
  eclipseStart: 0.82,
  eclipseMid: 0.9,
  eclipseCover: 1.08,
} as const;
