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

  const setState = (nextState: ContactSceneState) => {
    state = nextState;
  };

  const setHidden = () => {
    gsap.set('.contact-section-container', { opacity: 0, pointerEvents: 'none' });
    gsap.set('.contact-content-wrapper', { pointerEvents: 'none' });
    gsap.set('.contact-title-debug', { opacity: 0 });
  };

  const scene: ContactScene = {
    id: 'contact',

    prepare() {
      if (revealTimeline) return;

      gsap.set('.contact-section-container', { opacity: 0, pointerEvents: 'none' });
      gsap.set('.contact-content-wrapper', { pointerEvents: 'none' });
      gsap.set('.contact-title-debug', { opacity: 0 });
      gsap.set('.contact-title-char', { y: '112%', opacity: 0 });
      gsap.set('.contact-utility-column, .contact-footer-meta', {
        opacity: 0,
        y: 18,
        pointerEvents: 'none',
      });

      revealTimeline = gsap.timeline({
        paused: true,
        onComplete: scene.activate,
        onReverseComplete: () => {
          setState('HIDDEN');
          setHidden();
        },
      });

      revealTimeline
        .set('.contact-section-container', { opacity: 1, pointerEvents: 'auto' }, 0)
        .set('.contact-content-wrapper', { pointerEvents: 'auto' }, 0)
        .set('.contact-title-debug', { opacity: 1 }, 0.04)
        .to('.contact-title-char', {
          ...motionPresets.contactTitleReveal,
          stagger: {
            each: MOTION_STAGGERS.textChar,
            from: 'center',
          },
        }, 0.08)
        .to('.contact-utility-column:first-child', {
          ...motionPresets.contactColumnReveal,
          pointerEvents: 'auto',
        }, 0.68)
        .to('.contact-utility-column:nth-child(2)', {
          ...motionPresets.contactColumnReveal,
          pointerEvents: 'auto',
        }, 0.73)
        .to('.contact-footer-meta', motionPresets.contactFooterReveal, 0.78);

      setState('HIDDEN');
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
