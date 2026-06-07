import { gsap, ScrollTrigger } from '@/lib/gsap';

import {
  createAboutEnvironmentLifecycle,
} from './AboutEnvironmentLifecycle';
import { ABOUT_SELECTORS } from './aboutSelectors';

type AboutControllerDependencies = {
  environment?: ReturnType<typeof createAboutEnvironmentLifecycle>;
};

export function createAboutController({
  environment = createAboutEnvironmentLifecycle(),
}: AboutControllerDependencies = {}) {
  const mm = gsap.matchMedia();
  let isTransitionComplete = false;
  let aboutTimeline: gsap.core.Timeline | null = null;
  let introTimelineMobile: gsap.core.Timeline | null = null;

  return {
    prepare() {
      // Desktop: Pinned details morph
      mm.add('(min-width: 769px)', () => {
        gsap.set(ABOUT_SELECTORS.portrait, { clipPath: 'inset(100% 0% 0% 0%)', y: 120, opacity: 0 });
        gsap.set(ABOUT_SELECTORS.eyebrow, { opacity: 0, y: 15 });
        gsap.set(ABOUT_SELECTORS.chars, { yPercent: 100, opacity: 0 });
        gsap.set(ABOUT_SELECTORS.description, { opacity: 0, y: 20 });
        gsap.set(ABOUT_SELECTORS.portraitLeft, { xPercent: 50, opacity: 0 });
        gsap.set(ABOUT_SELECTORS.subContent, { opacity: 0 });
        gsap.set(ABOUT_SELECTORS.subEyebrow, { opacity: 0, y: 15 });
        gsap.set(ABOUT_SELECTORS.subFocus, { opacity: 0, y: 20 });
        gsap.set(ABOUT_SELECTORS.subMetrics, { opacity: 0, y: 20 });
        gsap.set(ABOUT_SELECTORS.subStack, { opacity: 0, y: 20 });

        const aboutTl = gsap.timeline({
          paused: true,
        });
        aboutTimeline = aboutTl;

        ScrollTrigger.create({
          trigger: ABOUT_SELECTORS.section,
          start: 'top top',
          end: '+=60%',
          pin: true,
          onUpdate: (self) => {
            if (!isTransitionComplete) {
              gsap.killTweensOf(aboutTl);
              aboutTl.progress(0);
            } else {
              // Scale progress from [0.02, 1.0] of scroll trigger to [0.0, 1.0] of timeline progress
              const p = Math.max(0, (self.progress - 0.02) / 0.98);
              gsap.to(aboutTl, { progress: p, duration: 0.15, overwrite: 'auto' });
            }
          }
        });

        // Phase 1: Reveal About Intro (0.0 -> 0.35)
        aboutTl
          .to(ABOUT_SELECTORS.portrait, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1, duration: 0.4 }, 0.0)
          .to(ABOUT_SELECTORS.eyebrow, { opacity: 1, y: 0, duration: 0.2 }, 0.02)
          .to(ABOUT_SELECTORS.chars, { yPercent: 0, opacity: 1, stagger: 0.015, duration: 0.4 }, 0.05)
          .to(ABOUT_SELECTORS.description, { opacity: 1, y: 0, duration: 0.2 }, 0.10);

        // Phase 2: Transition from Intro to Deep Dive (0.55 -> 1.0)
        aboutTl
          .to(ABOUT_SELECTORS.editorialText, { opacity: 0, y: -80, duration: 0.35, ease: 'power2.inOut' }, 0.55)
          .to(ABOUT_SELECTORS.portrait, { xPercent: -50, opacity: 0, duration: 0.35, ease: 'power2.inOut' }, 0.55)
          .to(ABOUT_SELECTORS.portraitLeft, { xPercent: 0, opacity: 1, duration: 0.35, ease: 'power2.inOut' }, 0.55)
          .to(ABOUT_SELECTORS.subContent, { opacity: 1, pointerEvents: 'auto', duration: 0.35, ease: 'none' }, 0.6)
          .to(ABOUT_SELECTORS.subEyebrow, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.65)
          .to(ABOUT_SELECTORS.subFocus, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.7)
          .to(ABOUT_SELECTORS.subMetrics, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.75)
          .to(ABOUT_SELECTORS.subStack, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.75);

        environment.activate({ timeline: aboutTl, position: 0.1 });
      });

      // Mobile: Flowing vertical layout with simple reveals
      mm.add('(max-width: 768px)', () => {
        gsap.set(ABOUT_SELECTORS.portrait, { opacity: 0, y: 60 });
        gsap.set(`${ABOUT_SELECTORS.eyebrow}, ${ABOUT_SELECTORS.description}`, { opacity: 0, y: 20 });
        gsap.set(ABOUT_SELECTORS.chars, { opacity: 0, yPercent: 100 });
        gsap.set(ABOUT_SELECTORS.subContent, { opacity: 0, y: 40 });

        const introTl = gsap.timeline({ paused: true });
        introTimelineMobile = introTl;

        ScrollTrigger.create({
          trigger: ABOUT_SELECTORS.section,
          start: 'top 75%',
          onEnter: () => {
            if (isTransitionComplete) {
              introTl.play();
            }
          },
          onLeaveBack: () => {
            introTl.reverse();
          }
        });

        introTl
          .to(ABOUT_SELECTORS.portrait, { opacity: 1, y: 0, duration: 0.6 })
          .to(ABOUT_SELECTORS.eyebrow, { opacity: 1, y: 0, duration: 0.3 }, 0.2)
          .to(ABOUT_SELECTORS.chars, { opacity: 1, yPercent: 0, stagger: 0.01, duration: 0.5 }, 0.3)
          .to(ABOUT_SELECTORS.description, { opacity: 1, y: 0, duration: 0.3 }, 0.4);

        gsap.to(ABOUT_SELECTORS.subContent, {
          scrollTrigger: {
            trigger: ABOUT_SELECTORS.subContent,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          opacity: 1,
          y: 0,
          pointerEvents: 'auto',
          duration: 0.5,
        });
      });
    },

    setTransitionComplete(complete: boolean) {
      isTransitionComplete = complete;
      if (isTransitionComplete) {
        if (aboutTimeline?.scrollTrigger) {
          aboutTimeline.scrollTrigger.update();
        }
        if (introTimelineMobile) {
          introTimelineMobile.play();
        }
      } else {
        if (aboutTimeline) {
          aboutTimeline.progress(0);
        }
        if (introTimelineMobile) {
          introTimelineMobile.pause(0);
        }
      }
    },

    destroy() {
      mm.revert();
      environment.destroy();
      aboutTimeline = null;
      introTimelineMobile = null;
    },
  };
}
