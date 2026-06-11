import { gsap } from '@/lib/gsap';
import { motionPresets } from '@/lib/motionPresets';
import { MOTION_STAGGERS } from '@/lib/motionSystem';

export type ContactSceneState =
  | 'UNPREPARED'
  | 'HIDDEN'
  | 'ENTERING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'EXITING'
  | 'DESTROYED';

export type ContactScene = {
  id: 'contact';
  prepare(): void;
  setProgress(progress: number): void;
  enter(): void;
  activate(): void;
  pause(): void;
  resume(): void;
  exit(): void;
  destroy(): void;
  getState(): ContactSceneState;
  isActive(): boolean;
};

export function createContactScene(): ContactScene {
  let state: ContactSceneState = 'UNPREPARED';
  let previousState: ContactSceneState = 'HIDDEN';
  let revealTimeline: gsap.core.Timeline | null = null;
  const panelEase = gsap.parseEase('power3.out');
  const CONTENT_REVEAL_START = 0.42;
  const CONTENT_REVEAL_DEADZONE = 0.2;
  let contentVisible = false;
  let releaseFrame: number | null = null;
  let contactBackdropActive = false;
  const contactResetTargets = [
    '.contact-content-wrapper',
    '.contact-utility-link',
    '.contact-link-char',
  ];

  const setState = (nextState: ContactSceneState) => {
    state = nextState;
  };

  const setContactBackdrop = (active: boolean) => {
    if (!active && contactBackdropActive === active) return;

    contactBackdropActive = active;
    if (typeof document !== 'undefined') {
      gsap.killTweensOf(document.body, 'backgroundColor');
      if (active) {
        // If we are currently transitioning via navigation menu, do not touch the HTML styles
        // as the transition useEffect is applying the target theme variables.
        if (typeof window !== 'undefined' && (window as any).__isTransitioning) {
          return;
        }
        document.documentElement.style.setProperty('--color-bg', '#050505');
        document.body.style.backgroundColor = '#050505';
      } else {
        // If we are currently transitioning, do not touch the HTML style properties
        // as the transition useEffect is applying the target theme variables.
        if (typeof window !== 'undefined' && (window as any).__isTransitioning) {
          document.body.style.backgroundColor = '';
          return;
        }

        const activeSection = typeof window !== 'undefined' ? (window as any).__activeSection : undefined;
        if (activeSection === 'about' || activeSection === 'work') {
          document.documentElement.style.setProperty('--color-bg', '#FFFFFF');
        } else if (activeSection === 'hero') {
          document.documentElement.style.setProperty('--color-bg', '#0A0A0A');
        } else {
          document.documentElement.style.removeProperty('--color-bg');
        }
        document.body.style.backgroundColor = '';
      }
    }
  };

  const resetContent = (options: { force?: boolean; notify?: boolean } = {}) => {
    if (!options.force && !contentVisible) return;

    contentVisible = false;

    revealTimeline?.pause(0, true);
    gsap.killTweensOf(contactResetTargets);

    gsap.set('.contact-content-wrapper', {
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
      overwrite: true,
    });
    gsap.set('.contact-title-debug', {
      opacity: 0,
    });
    gsap.set('.contact-title-char', {
      y: '112%',
      opacity: 0,
    });
    gsap.set('.contact-utility-column, .contact-footer-meta', {
      opacity: 0,
      y: 18,
      pointerEvents: 'none',
    });

    if (typeof document !== 'undefined') {
      document.querySelectorAll<HTMLElement>('.contact-title-char').forEach((el) => {
        el.style.setProperty('--contact-hover-stop', '0%');
        el.style.setProperty('--contact-hover-warm-stop', '0%');
        el.style.setProperty('--contact-hover-white-stop', '0%');
      });
      document.querySelectorAll<HTMLElement>('.contact-title-char-wrap').forEach((el) => {
        el.style.setProperty('--contact-energy-scale', '1');
      });
    }

    setContactBackdrop(false);

    if (options.notify !== false && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contactSceneReset'));
    }
  };

  const cancelReleaseFrame = () => {
    if (releaseFrame === null || typeof window === 'undefined') return;

    window.cancelAnimationFrame(releaseFrame);
    releaseFrame = null;
  };

  const setHidden = () => {
    cancelReleaseFrame();
    gsap.set('.contact-transition-underlay', {
      opacity: 0,
      visibility: 'hidden',
    });
    gsap.set('.contact-section-container', {
      opacity: 1,
      visibility: 'visible',
      yPercent: 100,
      pointerEvents: 'none',
    });
    resetContent({ force: true });

    if (typeof window === 'undefined') {
      gsap.set('.contact-section-container', {
        opacity: 0,
        visibility: 'hidden',
      });
      gsap.set('.contact-transition-underlay', {
        opacity: 0,
        visibility: 'hidden',
      });
      setContactBackdrop(false);
      return;
    }

    releaseFrame = window.requestAnimationFrame(() => {
      releaseFrame = null;
      gsap.set('.contact-section-container', {
        opacity: 0,
        visibility: 'hidden',
      });
      gsap.set('.contact-transition-underlay', {
        opacity: 0,
        visibility: 'hidden',
      });
      setContactBackdrop(false);
    });
  };

  const syncInteractivity = (progress: number, contentProgress: number) => {
    gsap.set('.contact-section-container', {
      pointerEvents: contentProgress > 0 ? 'auto' : 'none',
    });
    gsap.set('.contact-content-wrapper', {
      pointerEvents: progress > 0.62 ? 'auto' : 'none',
    });
  };

  const scene: ContactScene = {
    id: 'contact',

    prepare() {
      if (revealTimeline) return;

      gsap.set('.contact-section-container', {
        opacity: 1,
        visibility: 'visible',
        yPercent: 100,
        pointerEvents: 'none',
      });
      gsap.set('.contact-transition-underlay', {
        opacity: 0,
        visibility: 'hidden',
      });
      resetContent({ force: true, notify: false });

      revealTimeline = gsap.timeline({
        paused: true,
        onComplete: scene.activate,
        onReverseComplete: () => {
          setState('HIDDEN');
          setHidden();
        },
      });

      revealTimeline
        .set('.contact-title-debug', { opacity: 1 }, 0)
        .to('.contact-title-char', {
          ...motionPresets.contactTitleReveal,
          stagger: {
            each: MOTION_STAGGERS.textChar,
            from: 'center',
          },
        }, 0.05)
        .to('.contact-utility-column:first-child', {
          ...motionPresets.contactColumnReveal,
          pointerEvents: 'auto',
        }, 0.56)
        .to('.contact-utility-column:nth-child(2)', {
          ...motionPresets.contactColumnReveal,
          pointerEvents: 'auto',
        }, 0.61)
        .to('.contact-footer-meta', motionPresets.contactFooterReveal, 0.66);

      setState('HIDDEN');
    },

    setProgress(progress: number) {
      if (!revealTimeline) scene.prepare();
      cancelReleaseFrame();

      const clampedProgress = gsap.utils.clamp(0, 1, progress);
      const panelProgress = gsap.utils.clamp(0, 1, clampedProgress / CONTENT_REVEAL_START);
      const easedPanelProgress = panelEase(panelProgress);
      const rawContentProgress = gsap.utils.clamp(0, 1, (clampedProgress - CONTENT_REVEAL_START) / (1 - CONTENT_REVEAL_START));
      const contentProgress = rawContentProgress <= CONTENT_REVEAL_DEADZONE
        ? 0
        : gsap.utils.clamp(0, 1, (rawContentProgress - CONTENT_REVEAL_DEADZONE) / (1 - CONTENT_REVEAL_DEADZONE));
      const underlayVisible = panelProgress >= 1;

      gsap.set('.contact-transition-underlay', {
        opacity: underlayVisible ? 1 : 0,
        visibility: underlayVisible ? 'visible' : 'hidden',
      });
      gsap.set('.contact-section-container', {
        yPercent: contentProgress > 0 ? 0 : (1 - easedPanelProgress) * 100,
        opacity: 1,
        visibility: 'visible',
      });

      if (contentProgress <= 0) {
        revealTimeline?.progress(0).pause();
        resetContent();
        syncInteractivity(clampedProgress, contentProgress);

        if (clampedProgress <= 0) {
          setState('HIDDEN');
          setHidden();
          return;
        }

        setState('ENTERING');
        return;
      }

      contentVisible = true;
      setContactBackdrop(true);
      gsap.set('.contact-content-wrapper', {
        opacity: 1,
        visibility: 'visible',
      });
      gsap.set('.contact-title-debug', { opacity: 1 });
      revealTimeline?.progress(contentProgress).pause();
      syncInteractivity(clampedProgress, contentProgress);

      if (clampedProgress <= 0) {
        setState('HIDDEN');
        setHidden();
        return;
      }

      if (clampedProgress >= 1) {
        scene.activate();
        return;
      }

      setState('ENTERING');
    },

    enter() {
      if (!revealTimeline) scene.prepare();
      if (state === 'ENTERING' || state === 'ACTIVE') return;

      setState('ENTERING');
      revealTimeline?.play();
    },

    activate() {
      setState('ACTIVE');
    },

    pause() {
      if (state === 'PAUSED' || state === 'HIDDEN' || state === 'DESTROYED') return;

      previousState = state;
      setState('PAUSED');
      gsap.set('.contact-content-wrapper', { pointerEvents: 'none' });
    },

    resume() {
      if (state !== 'PAUSED') return;

      setState(previousState === 'PAUSED' ? 'ACTIVE' : previousState);
      gsap.set('.contact-content-wrapper', { pointerEvents: 'auto' });
    },

    exit() {
      if (!revealTimeline || state === 'HIDDEN' || state === 'UNPREPARED') return;

      setState('EXITING');
      revealTimeline.reverse();
    },

    destroy() {
      cancelReleaseFrame();
      revealTimeline?.kill();
      revealTimeline = null;
      setState('DESTROYED');
    },

    getState() {
      return state;
    },

    isActive() {
      return state === 'ENTERING'
        || state === 'ACTIVE'
        || state === 'PAUSED'
        || state === 'EXITING';
    },
  };

  return scene;
}
