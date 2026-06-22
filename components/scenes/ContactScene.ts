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
  const PANEL_REVEAL_END = 0.68;
  const CONTENT_REVEAL_START = 0.68;
  let contentVisible = false;
  let releaseFrame: number | null = null;
  let contactBackdropActive = false;
  let previousProgress = 0;
  let isSheetExitMode = false;
  const contactResetTargets = [
    '.contact-content-wrapper',
    '.contact-utility-link',
    '.contact-link-char',
  ];

  const setState = (nextState: ContactSceneState) => {
    state = nextState;
  };

  const setContactBackdrop = (active: boolean) => {
    contactBackdropActive = active;
  };

  const resetContent = (
    options: { force?: boolean; notify?: boolean; resetBackdrop?: boolean } = {}
  ) => {
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

    if (options.resetBackdrop !== false) {
      setContactBackdrop(false);
    }

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
    previousProgress = 0;
    isSheetExitMode = false;
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
      setContactBackdrop(false);
      return;
    }

    releaseFrame = window.requestAnimationFrame(() => {
      releaseFrame = null;
      gsap.set('.contact-section-container', {
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
      isSheetExitMode = false;

      gsap.set('.contact-section-container', {
        opacity: 1,
        visibility: 'visible',
        yPercent: 100,
        pointerEvents: 'none',
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
      const panelProgress = gsap.utils.clamp(0, 1, clampedProgress / PANEL_REVEAL_END);
      const easedPanelProgress = panelEase(panelProgress);
      const contentProgress = gsap.utils.clamp(
        0,
        1,
        (clampedProgress - CONTENT_REVEAL_START) / (1 - CONTENT_REVEAL_START)
      );
      const isReverseExit = previousProgress > 0 && clampedProgress < previousProgress;
      const shouldHoldPanel = contactBackdropActive && clampedProgress > 0;

      if (isReverseExit) {
        isSheetExitMode = true;
      }

      if (isSheetExitMode) {
        if (clampedProgress <= 0) {
          previousProgress = clampedProgress;
          setState('HIDDEN');
          setHidden();
          return;
        }

        if (clampedProgress >= 1) {
          isSheetExitMode = false;
        }

        setContactBackdrop(true);
        gsap.set('.contact-section-container', {
          yPercent: (1 - clampedProgress) * 100,
          opacity: 1,
          visibility: 'visible',
        });

        if (contentProgress <= 0) {
          revealTimeline?.progress(0).pause();
          resetContent({ resetBackdrop: false });
          syncInteractivity(clampedProgress, 0);
        } else {
          contentVisible = true;
          gsap.set('.contact-content-wrapper', {
            opacity: 1,
            visibility: 'visible',
          });
          gsap.set('.contact-title-debug', { opacity: 1 });
          revealTimeline?.progress(contentProgress).pause();
          syncInteractivity(clampedProgress, contentProgress);
        }

        setState(isSheetExitMode ? 'EXITING' : 'ACTIVE');
        previousProgress = clampedProgress;
        return;
      }

      gsap.set('.contact-section-container', {
        yPercent: shouldHoldPanel || contentProgress > 0
          ? 0
          : (1 - easedPanelProgress) * 100,
        opacity: 1,
        visibility: 'visible',
      });

      if (contentProgress <= 0) {
        revealTimeline?.progress(0).pause();
        resetContent({ resetBackdrop: clampedProgress <= 0 });
        syncInteractivity(clampedProgress, contentProgress);

        if (clampedProgress <= 0) {
          previousProgress = clampedProgress;
          setState('HIDDEN');
          setHidden();
          return;
        }

        setState('ENTERING');
        previousProgress = clampedProgress;
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
        previousProgress = clampedProgress;
        setState('HIDDEN');
        setHidden();
        return;
      }

      if (clampedProgress >= 1) {
        previousProgress = clampedProgress;
        scene.activate();
        return;
      }

      setState('ENTERING');
      previousProgress = clampedProgress;
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
