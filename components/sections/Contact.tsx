'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { PointerEvent } from 'react';
import { gsap } from '@/lib/gsap';

type ContactWindow = Window & {
  __scrollTriggerProgress?: number;
};

type ContactCharRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type ContactCharInteraction = {
  wrapper: HTMLElement;
  char: HTMLElement;
  rect: ContactCharRect;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  energy: number;
};

const CONTACT_TITLE = 'JUSTCHANIAGO';
const CONTACT_TITLE_PROGRESS = 0.971;
const TITLE_HOVER_RADIUS = 150;
const TITLE_HOVER_MAX_RADIUS = 320;
const TITLE_HOVER_VELOCITY_MULTIPLIER = 0.4;
const TITLE_HOVER_INTERPOLATION = 0.15;
const TITLE_HOVER_DECAY = 0.92;

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const charInteractionsRef = useRef<ContactCharInteraction[]>([]);
  const interactionFrameRef = useRef<number | null>(null);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    velocity: 0,
    active: false,
  });

  const cacheTitleRects = useCallback(() => {
    const title = titleRef.current;
    if (!title) return;

    const previous = new Map(
      charInteractionsRef.current.map((item) => [item.char, item])
    );

    charInteractionsRef.current = Array.from(
      title.querySelectorAll<HTMLElement>('.contact-title-char-wrap')
    ).flatMap((wrapper) => {
      const char = wrapper.querySelector<HTMLElement>('.contact-title-char');
      if (!char) return [];

      const rect = char.getBoundingClientRect();
      const cached = previous.get(char);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      return [{
        wrapper,
        char,
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        x: cached?.x ?? centerX,
        y: cached?.y ?? centerY,
        targetX: cached?.targetX ?? centerX,
        targetY: cached?.targetY ?? centerY,
        energy: cached?.energy ?? 0,
      }];
    });
  }, []);

  function runInteractionFrame() {
    const pointer = pointerRef.current;
    const items = charInteractionsRef.current;
    const effectiveRadius = Math.min(
      TITLE_HOVER_MAX_RADIUS,
      Math.max(
        TITLE_HOVER_RADIUS,
        TITLE_HOVER_RADIUS + pointer.velocity * TITLE_HOVER_VELOCITY_MULTIPLIER
      )
    );
    let maxEnergy = 0;

    items.forEach((item) => {
      let incomingEnergy = 0;

      if (pointer.active) {
        const centerX = item.rect.left + item.rect.width / 2;
        const centerY = item.rect.top + item.rect.height / 2;
        const distance = Math.hypot(pointer.x - centerX, pointer.y - centerY);

        incomingEnergy = Math.max(0, 1 - distance / effectiveRadius);
        item.targetX = pointer.x - item.rect.left;
        item.targetY = pointer.y - item.rect.top;
      }

      item.x += (item.targetX - item.x) * TITLE_HOVER_INTERPOLATION;
      item.y += (item.targetY - item.y) * TITLE_HOVER_INTERPOLATION;
      item.energy = Math.max(incomingEnergy, item.energy * TITLE_HOVER_DECAY);

      const hoverStop = Math.round(item.energy * 68);
      const warmStop = item.energy > 0.001 ? hoverStop + 14 : 0;
      const whiteStop = item.energy > 0.001 ? hoverStop + 38 : 0;
      const scale = 1 + Math.min(item.energy * 0.035, 0.05);

      item.char.style.setProperty('--contact-hover-x', `${item.x}px`);
      item.char.style.setProperty('--contact-hover-y', `${item.y}px`);
      item.char.style.setProperty('--contact-hover-stop', `${hoverStop}%`);
      item.char.style.setProperty('--contact-hover-warm-stop', `${warmStop}%`);
      item.char.style.setProperty('--contact-hover-white-stop', `${whiteStop}%`);
      item.wrapper.style.setProperty('--contact-energy-scale', scale.toFixed(3));

      maxEnergy = Math.max(maxEnergy, item.energy);
    });

    if (pointer.active || maxEnergy > 0.01) {
      interactionFrameRef.current = window.requestAnimationFrame(runInteractionFrame);
      return;
    }

    items.forEach((item) => {
      item.char.style.setProperty('--contact-hover-stop', '0%');
      item.char.style.setProperty('--contact-hover-warm-stop', '0%');
      item.char.style.setProperty('--contact-hover-white-stop', '0%');
      item.wrapper.style.setProperty('--contact-energy-scale', '1');
    });
    interactionFrameRef.current = null;
  }

  function startInteractionLoop() {
    if (interactionFrameRef.current !== null) return;
    interactionFrameRef.current = window.requestAnimationFrame(runInteractionFrame);
  }

  function handleTitlePointerEnter(e: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;

    cacheTitleRects();
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.previousX = e.clientX;
    pointer.previousY = e.clientY;
    pointer.velocity = 0;
    pointer.active = true;
    startInteractionLoop();
  }

  function handleTitlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (charInteractionsRef.current.length === 0) {
      cacheTitleRects();
    }

    const pointer = pointerRef.current;
    pointer.previousX = pointer.x;
    pointer.previousY = pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.velocity = Math.hypot(
      pointer.x - pointer.previousX,
      pointer.y - pointer.previousY
    );
    pointer.active = true;

    startInteractionLoop();
  }

  function handleTitlePointerLeave() {
    pointerRef.current.active = false;
    pointerRef.current.velocity = 0;
    startInteractionLoop();
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => cacheTitleRects();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactionFrameRef.current !== null) {
        window.cancelAnimationFrame(interactionFrameRef.current);
        interactionFrameRef.current = null;
      }
    };
  }, [cacheTitleRects]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let revealTween: gsap.core.Tween | null = null;

    const handleProgress = (e: Event) => {
      const progress = (e as CustomEvent).detail?.progress ?? 0;
      const isActive = progress >= CONTACT_TITLE_PROGRESS;
      const val = isActive ? 'auto' : 'none';

      if (innerWrapperRef.current) {
        innerWrapperRef.current.style.pointerEvents = val;
      }

      if (isActive && titleRef.current && !revealedRef.current) {
        revealedRef.current = true;
        if (revealTween) revealTween.kill();

        const chars = titleRef.current.querySelectorAll<HTMLElement>('.contact-title-char');
        gsap.set(titleRef.current, { opacity: 1 });

        revealTween = gsap.fromTo(
          chars,
          {
            y: '112%',
            opacity: 0,
          },
          {
            y: '0%',
            opacity: 1,
            duration: 0.82,
            stagger: {
              each: 0.045,
              from: 'center',
            },
            ease: 'power4.out',
          }
        );
      }

      if (!isActive && titleRef.current && revealedRef.current) {
        revealedRef.current = false;
        if (revealTween) revealTween.kill();
        const chars = titleRef.current.querySelectorAll<HTMLElement>('.contact-title-char');

        revealTween = gsap.to(chars, {
          y: '112%',
          opacity: 0,
          duration: 0.82,
          stagger: {
            each: 0.045,
            from: 'center',
          },
          ease: 'power4.in',
          onComplete: () => {
            if (titleRef.current) {
              gsap.set(titleRef.current, { opacity: 0 });
            }
          },
        });
      }
    };

    window.addEventListener('scrollTriggerProgress', handleProgress);
    const initialProgress = (window as ContactWindow).__scrollTriggerProgress ?? 0;
    handleProgress(new CustomEvent('scrollTriggerProgress', { detail: { progress: initialProgress } }));

    return () => {
      window.removeEventListener('scrollTriggerProgress', handleProgress);
      if (revealTween) revealTween.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="contact-section-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        backgroundColor: '#050505',
        zIndex: 3,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0,
      }}
    >
      <div
        ref={innerWrapperRef}
        className="contact-content-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        <div
          ref={titleRef}
          className="contact-title-debug"
          aria-label={CONTACT_TITLE}
          onPointerEnter={handleTitlePointerEnter}
          onPointerMove={handleTitlePointerMove}
          onPointerLeave={handleTitlePointerLeave}
        >
          {CONTACT_TITLE.split('').map((char, charIndex) => (
            <span
              className="contact-title-char-wrap"
              key={`${char}-${charIndex}`}
              aria-hidden="true"
            >
              <span className="contact-title-char">{char}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .contact-title-debug {
          position: absolute;
          left: 50%;
          bottom: 3vh;
          transform: translateX(-50%);
          opacity: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0;
          width: calc(100vw - clamp(24px, 4vw, 72px));
          max-width: calc(100vw - clamp(24px, 4vw, 72px));
          font-size: clamp(14rem, min(32vh, 15vw), 26rem);
          font-family: var(--font-bitcount), sans-serif;
          font-weight: 400;
          letter-spacing: -0.06em;
          color: #fff;
          z-index: 50;
          white-space: nowrap;
          line-height: 1;
          pointer-events: auto;
          will-change: opacity;
        }

        .contact-title-char-wrap {
          display: inline-block;
          overflow: hidden;
          line-height: 1;
          transform: scale(var(--contact-energy-scale, 1));
          transform-origin: center bottom;
          vertical-align: bottom;
          will-change: transform;
        }

        .contact-title-char {
          display: inline-block;
          transform: translateY(112%);
          opacity: 0;
          color: transparent;
          background-image: radial-gradient(
            circle 112px at var(--contact-hover-x, 50%) var(--contact-hover-y, 50%),
            #ff3b30 0 var(--contact-hover-stop, 0%),
            rgba(255, 92, 70, 0.78) var(--contact-hover-warm-stop, 0%),
            #fff var(--contact-hover-white-stop, 0%)
          );
          background-clip: text;
          -webkit-background-clip: text;
          will-change: transform, opacity;
        }

        @media (max-width: 768px) {
          .contact-title-debug {
            bottom: 3vh;
            gap: 0;
            width: calc(100vw - clamp(20px, 5vw, 36px));
            max-width: calc(100vw - clamp(20px, 5vw, 36px));
            font-size: clamp(5.8rem, min(20vh, 16vw), 11rem);
          }
        }
      `}</style>
    </section>
  );
}
