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
        gsap.set(ABOUT_SELECTORS.portrait, {
          clipPath: 'inset(44% 0% 44% 0%)',
          y: 0,
          opacity: 0,
          scale: 0.965,
          transformOrigin: '50% 50%',
        });
        gsap.set(ABOUT_SELECTORS.editorialText, { y: 0, opacity: 1 });
        gsap.set(ABOUT_SELECTORS.eyebrow, { opacity: 0, y: 0, filter: 'blur(8px)' });
        gsap.set(ABOUT_SELECTORS.chars, { yPercent: 18, opacity: 0, filter: 'blur(10px)' });
        gsap.set(ABOUT_SELECTORS.description, { opacity: 0, y: 0, filter: 'blur(8px)' });
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

        // --- TRIGGER 1: Intro Reveal (Unpinned) ---
        // Runs during the transition layer falloff so About content does not reveal under card entry.
        ScrollTrigger.create({
          trigger: ABOUT_SELECTORS.section,
          start: 'top 20%',
          end: 'top -5%',
          scrub: true,
          onUpdate: (self) => {
            if (!isTransitionComplete) {
              gsap.killTweensOf(aboutTl);
              aboutTl.time(0);
              return;
            }

            const targetTime = self.progress * 1.0;
            if (aboutTl.time() <= 1.0 || self.direction === -1) {
              aboutTl.time(targetTime);
            }
          }
        });

        // --- TRIGGER 2: Deep Dive Morph (Pinned) ---
        // Pins the section and drives timeline TIME from 1.3s to the end of the timeline (Phase 2 Stretched Morph)
        // Uses time (seconds) instead of progress ratio to preserve layout reveal timing perfectly
        ScrollTrigger.create({
          trigger: ABOUT_SELECTORS.section,
          start: 'top top',
          end: '+=60%',
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            if (!isTransitionComplete) {
              gsap.killTweensOf(aboutTl);
              aboutTl.time(0);
            } else {
              const maxDuration = aboutTl.duration() || 2.2;
              // Map ScrollTrigger progress [0, 1] to timeline time [1.3, maxDuration] seconds
              const targetTime = 1.3 + (self.progress * (maxDuration - 1.3));
              if (self.progress > 0) {
                gsap.to(aboutTl, { time: targetTime, duration: 0.1, overwrite: 'auto' });
              }
            }
          }
        });

        // Phase 1: Reveal About Intro (0.0 -> 1.0 seconds) - Stretched for grand cinematic pacing
        aboutTl
          .to(ABOUT_SELECTORS.portrait, {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: 'power2.out',
          }, 0.0)
          .to(ABOUT_SELECTORS.eyebrow, { opacity: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power2.out' }, 0.12)
          .to(ABOUT_SELECTORS.chars, {
            yPercent: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.024,
            duration: 0.72,
            ease: 'power3.out',
          }, 0.2)
          .to(ABOUT_SELECTORS.description, { opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }, 0.5);

        // Phase 2: Transition from Intro to Deep Dive (1.3 -> 2.2 seconds) - Pinned segment
        aboutTl
          .to(ABOUT_SELECTORS.editorialText, { opacity: 0, y: -80, duration: 0.6, ease: 'power2.inOut' }, 1.3)
          .to(ABOUT_SELECTORS.portrait, { xPercent: -50, opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 1.3)
          .to(ABOUT_SELECTORS.portraitLeft, { xPercent: 0, opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 1.3)
          .to(ABOUT_SELECTORS.subContent, { opacity: 1, pointerEvents: 'auto', duration: 0.6, ease: 'none' }, 1.4)
          .to(ABOUT_SELECTORS.subEyebrow, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.5)
          .to(ABOUT_SELECTORS.subFocus, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.6)
          .to(ABOUT_SELECTORS.subMetrics, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.7)
          .to(ABOUT_SELECTORS.subStack, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.7);

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
        // Force update all ScrollTriggers when transition is marked complete
        ScrollTrigger.refresh();
        if (introTimelineMobile) {
          introTimelineMobile.play();
        }
      } else {
        if (aboutTimeline) {
          aboutTimeline.time(0);
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
