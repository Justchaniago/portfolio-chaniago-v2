'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { HoverSweep } from '@/lib/interactionPresets';
import {
  usePortfolioExperience,
  type PortfolioSectionId,
} from '@/components/experience/PortfolioExperienceContext';

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
const TITLE_HOVER_RADIUS = 150;
const TITLE_HOVER_MAX_RADIUS = 320;
const TITLE_HOVER_VELOCITY_MULTIPLIER = 0.4;
const TITLE_HOVER_INTERPOLATION = 0.15;
const TITLE_HOVER_DECAY = 0.92;
const UTILITY_SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/@._-↗';
const UTILITY_SCRAMBLE_DURATION = 520;

const QUICK_JUMP_LINKS = [
  { label: 'HOME', target: 'hero' },
  { label: 'ABOUT', target: 'about' },
  { label: 'WORK', target: 'work' },
] as const;

const CONNECT_LINKS = [
  { label: 'CHANIAGOATWORK@GMAIL.COM', href: 'mailto:chaniagoatwork@gmail.com' },
  { label: 'LINKEDIN ↗', href: 'https://linkedin.com' },
  { label: 'GITHUB ↗', href: 'https://github.com/Justchaniago' },
] as const;

export default function Contact() {
  const portfolioExperience = usePortfolioExperience();
  const containerRef = useRef<HTMLDivElement>(null);
  const innerWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const charInteractionsRef = useRef<ContactCharInteraction[]>([]);
  const interactionFrameRef = useRef<number | null>(null);
  const utilityScrambleFramesRef = useRef<WeakMap<HTMLElement, number>>(new WeakMap());
  const activeUtilityScramblesRef = useRef<Set<HTMLElement>>(new Set());
  const hoverSweepRef = useRef<HoverSweep | null>(null);
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

  const getUtilityTextElement = (el: HTMLElement) => {
    return el.querySelector<HTMLElement>('.contact-link-text');
  };

  const restoreUtilityText = useCallback((el: HTMLElement) => {
    const frame = utilityScrambleFramesRef.current.get(el);
    if (frame !== undefined) {
      window.cancelAnimationFrame(frame);
      utilityScrambleFramesRef.current.delete(el);
    }

    const label = el.dataset.label ?? '';
    const textEl = getUtilityTextElement(el);
    if (textEl) {
      textEl.textContent = label;
    }

    activeUtilityScramblesRef.current.delete(el);
  }, []);

  const resetUtilityScrambles = useCallback(() => {
    activeUtilityScramblesRef.current.forEach((el) => restoreUtilityText(el));
    activeUtilityScramblesRef.current.clear();
  }, [restoreUtilityText]);

  const scrambleUtilityText = useCallback((el: HTMLElement) => {
    const label = el.dataset.label ?? '';
    const textEl = getUtilityTextElement(el);
    if (!label || !textEl) return;

    restoreUtilityText(el);

    if (
      typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      textEl.textContent = label;
      return;
    }

    activeUtilityScramblesRef.current.add(el);
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / UTILITY_SCRAMBLE_DURATION);
      const settledIndex = Math.floor(progress * label.length);

      textEl.textContent = Array.from(label).map((char, index) => {
        if (char === ' ') return ' ';
        if (index <= settledIndex) return char;
        return UTILITY_SCRAMBLE_CHARS[
          Math.floor(Math.random() * UTILITY_SCRAMBLE_CHARS.length)
        ];
      }).join('');

      if (progress >= 1) {
        restoreUtilityText(el);
        return;
      }

      utilityScrambleFramesRef.current.set(el, window.requestAnimationFrame(tick));
    };

    utilityScrambleFramesRef.current.set(el, window.requestAnimationFrame(tick));
  }, [restoreUtilityText]);

  const resetHoverField = useCallback(() => {
    pointerRef.current.active = false;
    pointerRef.current.velocity = 0;

    if (interactionFrameRef.current !== null) {
      window.cancelAnimationFrame(interactionFrameRef.current);
      interactionFrameRef.current = null;
    }

    charInteractionsRef.current.forEach((item) => {
      item.energy = 0;
      item.wrapper.style.setProperty('--contact-energy-scale', '1');
      item.char.style.setProperty('--contact-hover-stop', '0%');
      item.char.style.setProperty('--contact-hover-warm-stop', '0%');
      item.char.style.setProperty('--contact-hover-white-stop', '0%');
    });
    resetUtilityScrambles();
  }, [resetUtilityScrambles]);

  function handleTitlePointerEnter(e: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current;

    cacheTitleRects();
    if (hoverSweepRef.current) {
      const state = hoverSweepRef.current.getPointerState();
      pointer.x = state.x;
      pointer.y = state.y;
      pointer.previousX = state.x;
      pointer.previousY = state.y;
      pointer.velocity = state.velocity;
    } else {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.previousX = e.clientX;
      pointer.previousY = e.clientY;
      pointer.velocity = 0;
    }
    pointer.active = true;
    startInteractionLoop();
  }

  function handleTitlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (charInteractionsRef.current.length === 0) {
      cacheTitleRects();
    }

    const pointer = pointerRef.current;
    if (hoverSweepRef.current) {
      const state = hoverSweepRef.current.getPointerState();
      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.x = state.x;
      pointer.y = state.y;
      pointer.velocity = state.velocity;
    } else {
      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.velocity = Math.hypot(
        pointer.x - pointer.previousX,
        pointer.y - pointer.previousY
      );
    }
    pointer.active = true;

    startInteractionLoop();
  }

  function handleTitlePointerLeave() {
    pointerRef.current.active = false;
    pointerRef.current.velocity = 0;
    startInteractionLoop();
  }

  function handleQuickJump(e: MouseEvent<HTMLButtonElement>, target: PortfolioSectionId) {
    e.preventDefault();
    portfolioExperience?.navigateTo(target);
  }

  function renderUtilityText(label: string) {
    return (
      <span
        className="contact-link-text"
        style={{ minWidth: `${label.length}ch` }}
      >
        {label}
      </span>
    );
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hoverSweep = new HoverSweep({
      radius: TITLE_HOVER_RADIUS,
      maxRadius: TITLE_HOVER_MAX_RADIUS,
      velocityMultiplier: TITLE_HOVER_VELOCITY_MULTIPLIER,
      interpolation: TITLE_HOVER_INTERPOLATION,
      decay: TITLE_HOVER_DECAY,
    });

    if (titleRef.current) {
      hoverSweep.initialize({ target: titleRef.current });
      hoverSweep.activate();
    }
    hoverSweepRef.current = hoverSweep;

    const handleResize = () => cacheTitleRects();
    window.addEventListener('resize', handleResize);
    window.addEventListener('contactSceneReset', resetHoverField);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('contactSceneReset', resetHoverField);
      hoverSweep.destroy();
      hoverSweepRef.current = null;
      resetUtilityScrambles();
      if (interactionFrameRef.current !== null) {
        window.cancelAnimationFrame(interactionFrameRef.current);
        interactionFrameRef.current = null;
      }
    };
  }, [cacheTitleRects, resetHoverField, resetUtilityScrambles]);

  return (
    <section
      ref={containerRef}
      className="contact-section-container"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg, #050505)',
        zIndex: 850,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0,
        willChange: 'transform',
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
        <div className="contact-utility-layer" aria-label="Contact utility links">
          <div className="contact-utility-column">
            <p className="contact-utility-label">QUICK JUMP</p>
            <div className="contact-utility-list">
              {QUICK_JUMP_LINKS.map((link) => (
                <button
                  className="contact-utility-link"
                  data-label={link.label}
                  key={link.label}
                  aria-label={link.label}
                  onClick={(e) => handleQuickJump(e, link.target)}
                  onBlur={(e) => restoreUtilityText(e.currentTarget)}
                  onFocus={(e) => scrambleUtilityText(e.currentTarget)}
                  onMouseEnter={(e) => scrambleUtilityText(e.currentTarget)}
                  onMouseLeave={(e) => restoreUtilityText(e.currentTarget)}
                  type="button"
                >
                  {renderUtilityText(link.label)}
                </button>
              ))}
            </div>
          </div>

          <div className="contact-utility-column">
            <p className="contact-utility-label">CONNECT</p>
            <div className="contact-utility-list">
              {CONNECT_LINKS.map((link) => (
                <a
                  className="contact-utility-link"
                  data-label={link.label}
                  href={link.href}
                  key={link.label}
                  aria-label={link.label}
                  onBlur={(e) => restoreUtilityText(e.currentTarget)}
                  onFocus={(e) => scrambleUtilityText(e.currentTarget)}
                  onMouseEnter={(e) => scrambleUtilityText(e.currentTarget)}
                  onMouseLeave={(e) => restoreUtilityText(e.currentTarget)}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                >
                  {renderUtilityText(link.label)}
                </a>
              ))}
            </div>
          </div>
        </div>

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

        <div className="contact-footer-meta" aria-hidden="true">
          <span>© 2026</span>
          <span>by (Ferry Rusly Chaniago)</span>
        </div>
      </div>

      <style>{`
        .contact-utility-layer {
          position: absolute;
          top: clamp(108px, 16vh, 180px);
          left: clamp(28px, 7vw, 128px);
          right: clamp(28px, 7vw, 128px);
          z-index: 52;
          display: grid;
          grid-template-columns: minmax(120px, 1fr) minmax(220px, 1fr);
          column-gap: clamp(48px, 12vw, 220px);
          font-family: var(--font-roboto), sans-serif;
          pointer-events: auto;
        }

        .contact-content-wrapper,
        .contact-title-debug,
        .contact-title-char,
        .contact-title-char-wrap,
        .contact-utility-column,
        .contact-footer-meta {
          transition: none !important;
        }

        .contact-utility-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .contact-utility-label {
          margin: 0 0 18px;
          font-family: var(--font-roboto), sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          line-height: 1;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
        }

        .contact-utility-list {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .contact-utility-link {
          appearance: none;
          border: 0;
          background: transparent;
          margin: 0;
          padding: 0;
          font-family: var(--font-roboto), sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.02em;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.75);
          text-align: left;
          text-decoration: none;
          cursor: pointer;
          opacity: 0.75;
          transition: opacity 160ms ease, color 160ms ease;
        }

        .contact-utility-link:hover,
        .contact-utility-link:focus-visible {
          color: rgba(255, 255, 255, 0.98);
          opacity: 1;
        }

        .contact-utility-link:focus-visible {
          outline: none;
        }

        .contact-link-text {
          display: inline-block;
          align-items: baseline;
          line-height: 1.8;
          white-space: nowrap;
        }

        .contact-title-debug {
          position: absolute;
          left: 50%;
          bottom: clamp(18px, 2.1vh, 26px);
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
            var(--color-accent, #F95C4B) 0 var(--contact-hover-stop, 0%),
            rgba(249, 92, 75, 0.78) var(--contact-hover-warm-stop, 0%),
            #fff var(--contact-hover-white-stop, 0%)
          );
          background-clip: text;
          -webkit-background-clip: text;
          will-change: transform, opacity;
        }

        .contact-footer-meta {
          position: absolute;
          left: clamp(16px, 2.2vw, 32px);
          right: clamp(16px, 2.2vw, 32px);
          bottom: clamp(26px, 3vh, 36px);
          z-index: 51;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-family: var(--font-roboto), sans-serif;
          font-size: clamp(11px, 0.88vw, 14px);
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          color: rgba(255, 255, 255, 0.72);
          pointer-events: none;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .contact-utility-layer {
            top: clamp(92px, 13vh, 132px);
            left: clamp(18px, 5vw, 28px);
            right: clamp(18px, 5vw, 28px);
            grid-template-columns: 1fr 1fr;
            column-gap: 22px;
          }

          .contact-utility-label {
            margin-bottom: 14px;
            font-size: 9px;
            letter-spacing: 0.14em;
          }

          .contact-utility-link {
            font-size: clamp(10px, 2.6vw, 12px);
            line-height: 1.75;
          }

          .contact-link-text {
            line-height: 1.75;
          }

          .contact-title-debug {
            bottom: clamp(20px, 3.4vh, 30px);
            gap: 0;
            width: calc(100vw - clamp(20px, 5vw, 36px));
            max-width: calc(100vw - clamp(20px, 5vw, 36px));
            font-size: clamp(5.8rem, min(20vh, 16vw), 11rem);
          }

          .contact-footer-meta {
            left: clamp(12px, 3.5vw, 20px);
            right: clamp(12px, 3.5vw, 20px);
            bottom: clamp(24px, 3.7vh, 34px);
            font-size: clamp(9px, 2.6vw, 11px);
          }
        }
      `}</style>
    </section>
  );
}
