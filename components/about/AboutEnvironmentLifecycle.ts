import { gsap } from '@/lib/gsap';

type AboutEnvironmentState = 'inactive' | 'activating' | 'active' | 'deactivating';
type AboutThemeTimeline = ReturnType<typeof gsap.timeline>;
type AboutEnvironmentActivationOptions = {
  timeline?: AboutThemeTimeline;
  position?: number;
};

const ABOUT_THEME_VARS = {
  '--color-bg': '#FFFFFF',
  '--color-text-1': '#0A0A0A',
  '--color-text-2': '#444444',
  '--color-border': 'rgba(10, 10, 10, 0.15)',
  '--color-accent': '#3F702A',
  '--text-shadow-glow': '0 2px 12px rgba(10, 10, 10, 0.02)',
  '--color-card-bg': 'rgba(255, 255, 255, 0.35)',
  '--color-card-shadow': '0 8px 32px rgba(10, 10, 10, 0.03)',
  '--color-card-shadow-hover': '0 12px 40px rgba(10, 10, 10, 0.05)',
  '--color-text-reveal-bg': 'rgba(10, 10, 10, 0.12)',
  ease: 'power2.inOut',
  duration: 0.3,
} as const;

const DEFAULT_ACTIVATION_POSITION = 0.1;

export function createAboutEnvironmentLifecycle() {
  let state: AboutEnvironmentState = 'inactive';
  let activeTween: gsap.core.Tween | null = null;

  const setActive = () => {
    state = 'active';
  };

  const setInactive = () => {
    state = 'inactive';
  };

  return {
    activate(options: AboutEnvironmentActivationOptions = {}) {
      state = 'activating';

      if (options.timeline) {
        options.timeline.to('html', {
          ...ABOUT_THEME_VARS,
        }, options.position ?? DEFAULT_ACTIVATION_POSITION);
        return;
      }

      activeTween = gsap.to('html', {
        ...ABOUT_THEME_VARS,
        onComplete: setActive,
        onReverseComplete: setInactive,
      });
    },

    deactivate() {
      state = 'deactivating';
      activeTween?.reverse();
    },

    isActive() {
      return state === 'active' || state === 'activating';
    },

    getState() {
      return state;
    },

    destroy() {
      activeTween?.kill();
      activeTween = null;
      state = 'inactive';
    },
  };
}
