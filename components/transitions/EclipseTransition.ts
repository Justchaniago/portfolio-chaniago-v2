import { gsap } from '@/lib/gsap';

export type EclipseTransitionState =
  | 'IDLE'
  | 'ENTERING'
  | 'COVERING'
  | 'EXITING'
  | 'COMPLETE';

export const ECLIPSE_TRANSITION_TIMING = {
  arcStart: 35.72,
  riseStart: 36.08,
  fullCover: 36.94,
  blackoutEnd: 37.32,
} as const;

type EclipseTransitionOptions = {
  target?: string;
};

export type EclipseTransition = {
  id: 'eclipse';
  prepare(timeline: gsap.core.Timeline): void;
  enter(): void;
  cover(): void;
  exit(): void;
  complete(): void;
  reset(): void;
  covered(): boolean;
  getState(): EclipseTransitionState;
  destroy(): void;
};

export function createEclipseTransition(
  options: EclipseTransitionOptions = {}
): EclipseTransition {
  const target = options.target ?? '.debug-circle';
  let state: EclipseTransitionState = 'IDLE';
  let prepared = false;

  const setState = (nextState: EclipseTransitionState) => {
    state = nextState;
  };

  const transition: EclipseTransition = {
    id: 'eclipse',

    prepare(timeline) {
      if (prepared) return;
      prepared = true;

      timeline.set(target, {
        opacity: 0,
        y: '8vmax',
        scale: 0.82,
      }, 0);

      timeline.to(target, {
        opacity: 1,
        y: '-18vmax',
        scale: 0.9,
        ease: 'power4.inOut',
        duration: ECLIPSE_TRANSITION_TIMING.riseStart - ECLIPSE_TRANSITION_TIMING.arcStart,
        onStart: transition.enter,
        onReverseComplete: transition.reset,
      }, ECLIPSE_TRANSITION_TIMING.arcStart);

      timeline.to(target, {
        y: '-230vmax',
        scale: 1.08,
        ease: 'expo.inOut',
        duration: ECLIPSE_TRANSITION_TIMING.fullCover - ECLIPSE_TRANSITION_TIMING.riseStart,
        onStart: transition.enter,
        onComplete: transition.cover,
        onReverseComplete: transition.enter,
      }, ECLIPSE_TRANSITION_TIMING.riseStart);

      timeline.to(target, {
        opacity: 1,
        duration: ECLIPSE_TRANSITION_TIMING.blackoutEnd - ECLIPSE_TRANSITION_TIMING.fullCover,
        ease: 'none',
        onStart: transition.cover,
        onComplete: transition.complete,
        onReverseComplete: transition.cover,
      }, ECLIPSE_TRANSITION_TIMING.fullCover);
    },

    enter() {
      setState('ENTERING');
    },

    cover() {
      setState('COVERING');
    },

    exit() {
      setState('EXITING');
    },

    complete() {
      setState('COMPLETE');
    },

    reset() {
      setState('IDLE');
    },

    covered() {
      return state === 'COVERING' || state === 'COMPLETE' || state === 'EXITING';
    },

    getState() {
      return state;
    },

    destroy() {
      prepared = false;
      setState('IDLE');
    },
  };

  return transition;
}
