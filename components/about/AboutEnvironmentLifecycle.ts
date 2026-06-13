import { gsap } from '@/lib/gsap';
import { getSectionTheme } from '@/lib/theme/sectionThemes';

type AboutEnvironmentState = 'inactive' | 'activating' | 'active' | 'deactivating';
type AboutThemeTimeline = ReturnType<typeof gsap.timeline>;
type AboutEnvironmentActivationOptions = {
  timeline?: AboutThemeTimeline;
  position?: number;
};

const ABOUT_THEME_VARS = {
  ...getSectionTheme('about'),
  '--text-shadow-glow': '0 2px 12px rgba(10, 10, 10, 0.02)',
  '--color-card-bg': 'rgba(228, 222, 210, 0.35)',
  '--color-card-shadow': '0 8px 32px rgba(10, 10, 10, 0.03)',
  '--color-card-shadow-hover': '0 12px 40px rgba(10, 10, 10, 0.05)',
  '--color-text-reveal-bg': 'rgba(10, 10, 10, 0.12)',
  '--about-env-opacity': '1',
  ease: 'power2.inOut',
  duration: 0.3,
} as const;

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
      if (options.timeline) {
        // Gated: only consume activation when handoff is received from transition card
        return;
      }

      if (state === 'active' || state === 'activating') {
        return;
      }

      state = 'activating';
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
