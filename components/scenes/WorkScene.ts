import { gsap } from '@/lib/gsap';

export type WorkSceneState =
  | 'UNPREPARED'
  | 'HIDDEN'
  | 'ENTERING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'RESTORING'
  | 'EXITING'
  | 'DESTROYED';

export type WorkScene = {
  id: 'work';
  prepare(): void;
  attachToTimeline(timeline: gsap.core.Timeline): void;
  enter(): void;
  activate(): void;
  pause(): void;
  resume(): void;
  exit(): void;
  destroy(): void;
  getState(): WorkSceneState;
  isActive(): boolean;
};

export function createWorkScene(): WorkScene {
  let state: WorkSceneState = 'UNPREPARED';
  let timelineAttached = false;

  const setState = (nextState: WorkSceneState) => {
    state = nextState;
  };

  const showRoot = () => {
    gsap.set('.work-section-container', { opacity: 1, pointerEvents: 'auto' });
  };

  const hideRoot = () => {
    gsap.set('.work-section-container', { opacity: 0, pointerEvents: 'none' });
  };

  const scene: WorkScene = {
    id: 'work',

    prepare() {
      if (state !== 'UNPREPARED' && state !== 'DESTROYED') return;

      hideRoot();
      gsap.set('.work-intro-container', { opacity: 1, y: '0px' });
      gsap.set('.work-intro-line-1, .work-intro-line-2', {
        yPercent: 100,
        opacity: 0,
      });
      setState('HIDDEN');
    },

    attachToTimeline(timeline) {
      if (timelineAttached) return;
      timelineAttached = true;

      timeline.set('.work-section-container', { opacity: 0, pointerEvents: 'none' }, 0);
      timeline.set('.work-intro-container', { opacity: 1, y: '0px' }, 0);
      timeline.set('.work-intro-line-1, .work-intro-line-2', {
        yPercent: 100,
        opacity: 0,
      }, 0);

      timeline.to('.work-section-container', {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.45,
        ease: 'none',
        onStart: scene.enter,
        onComplete: scene.activate,
        onReverseComplete: scene.exit,
      }, 4.85);

      timeline.to('.work-intro-line-1', {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'premiumBezier',
      }, 5.0);

      timeline.to('.work-intro-line-2', {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'premiumBezier',
      }, 5.15);

      timeline.to('.work-intro-container', {
        y: '-80px',
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      }, 7.2);
    },

    enter() {
      if (state === 'ACTIVE' || state === 'ENTERING') return;

      setState('ENTERING');
      showRoot();
    },

    activate() {
      setState('ACTIVE');
      showRoot();
    },

    pause() {
      if (state === 'HIDDEN' || state === 'DESTROYED') return;

      setState('PAUSED');
      gsap.set('.work-section-container', { pointerEvents: 'none' });
    },

    resume() {
      if (state === 'DESTROYED') return;

      setState('RESTORING');
      showRoot();
      setState('ACTIVE');
    },

    exit() {
      if (state === 'HIDDEN' || state === 'UNPREPARED') return;

      setState('EXITING');
      hideRoot();
      setState('HIDDEN');
    },

    destroy() {
      timelineAttached = false;
      setState('DESTROYED');
    },

    getState() {
      return state;
    },

    isActive() {
      return state === 'ENTERING'
        || state === 'ACTIVE'
        || state === 'PAUSED'
        || state === 'RESTORING'
        || state === 'EXITING';
    },
  };

  return scene;
}
