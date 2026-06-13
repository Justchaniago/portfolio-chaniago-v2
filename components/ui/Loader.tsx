'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const overlayRef       = useRef<HTMLDivElement>(null);
  const textRef          = useRef<HTMLDivElement>(null);
  const percentRef       = useRef<HTMLSpanElement>(null);
  
  const risingGroupRef   = useRef<SVGGElement>(null);
  const pullGroupRef     = useRef<SVGGElement>(null);
  
  const risePhosphorRef  = useRef<SVGPathElement>(null);
  const riseWhiteRef     = useRef<SVGPathElement>(null);
  
  const pullPhosphorRef  = useRef<SVGPathElement>(null);
  const pullWhiteRef     = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    // Pre-load the critical portrait image to browser cache
    // This ensures it is instantly available for rendering the moment the curtain lifts
    let imageLoaded = false;
    const img = new Image();
    img.src = '/images/portrait.png';
    const checkImage = () => {
      if (img.complete) {
        imageLoaded = true;
      } else {
        img.onload = () => { imageLoaded = true; };
        img.onerror = () => { imageLoaded = true; }; // Fail-safe to avoid loading freeze
      }
    };
    checkImage();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      const progressObj = { value: 0 };

      // 1. Technical Percentage count-up (synced with liquid rise)
      gsap.to(progressObj, {
        value: 100,
        duration: 4.0, // Slow, heavy liquid rise pacing
        ease: 'power1.inOut',
        onUpdate: () => {
          const p = Math.round(progressObj.value);
          if (percentRef.current) {
            percentRef.current.textContent = `[ ${p.toString().padStart(2, '0')}% ]`;
          }
        },
        onComplete: () => {
          // Wait for assets to be 100% loaded before starting the curtain pull-up!
          // This guarantees a completely seamless, pop-in-free transition reveal.
          const verifyAndTrigger = () => {
            if (imageLoaded) {
              triggerShutterTransition();
            } else {
              requestAnimationFrame(verifyAndTrigger);
            }
          };
          verifyAndTrigger();
        }
      });

      // === PHASE 1: RISING FLUID LIQUID ===
      // Set initial visibility states
      gsap.set(risingGroupRef.current, { display: 'block' });
      gsap.set(pullGroupRef.current, { display: 'none' });
      
      // Initialize pull-up positions immediately to cover the screen when displayed
      gsap.set(pullPhosphorRef.current, { y: 110 });
      gsap.set(pullWhiteRef.current, { y: 110 });

      // Horizontal wave current loops (undulating in opposite directions)
      gsap.to(risePhosphorRef.current, { x: 100, duration: 2.8, ease: 'none', repeat: -1 });
      gsap.to(riseWhiteRef.current, { x: -100, duration: 3.4, ease: 'none', repeat: -1 });

      // Vertical liquid rise from y:110 (hidden below screen) to y:-15 (fully covering screen)
      // Phosphor liquid rises slightly ahead to create organic volumetric color layering
      tl.fromTo(risePhosphorRef.current,
        { y: 110 },
        { y: -15, duration: 4.0, ease: 'power1.inOut' }
      );
      
      tl.fromTo(riseWhiteRef.current,
        { y: 110 },
        { y: -15, duration: 4.2, ease: 'power1.inOut' },
        '-=3.8' // White wave trails slightly behind, submerging typography
      );

      // Settle hold at full white coverage
      tl.to({}, { duration: 0.3 });

      // === PHASE 2: CHROMATIC LIQUID CURTAIN PULL-UP ===
      function triggerShutterTransition() {
        // Swap groups instantly while the screen is fully filled with white
        gsap.set(risingGroupRef.current, { display: 'none' });
        gsap.set(pullGroupRef.current, { display: 'block' });
        
        // Capture current playhead time and add a label to anchor immediate animations
        const currentTime = tl.time();
        tl.addLabel('trigger', currentTime);

        // Smoothly fade out the counter text instead of instantly hiding it
        tl.to(textRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.out'
        }, 'trigger');
        
        // Start infinite horizontal wave undulations on the pull-up curtains
        gsap.to(pullPhosphorRef.current, { x: -100, duration: 2.6, ease: 'none', repeat: -1 });
        gsap.to(pullWhiteRef.current, { x: 100, duration: 3.2, ease: 'none', repeat: -1 });

        // Pull up (Phosphor green curtain rises first, followed immediately by white curtain)
        // This offset creates a mind-blowing chromatic liquid tear-away edge revealing the home page!
        tl.fromTo(pullPhosphorRef.current,
          { y: 110 },
          { y: -15, duration: 1.6, ease: 'power3.inOut' },
          'trigger'
        );

        tl.fromTo(pullWhiteRef.current,
          { y: 110 },
          { y: -15, duration: 1.7, ease: 'power3.inOut' },
          'trigger+=0.15' // Sucks up and reveals the dark main screen underneath with high fluid tension
        );

        // Fade out overlay wrapper synchronously at the very end
        tl.to(overlayRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: 'power1.out',
        }, 'trigger+=1.35');
      }

    });

    return () => ctx.revert();
  }, [onComplete]);

  // ── Polish notes ──
  // - Responsive percentage-based SVG coords (0 to 100) ensure zero layout shifts on any screen.
  // - SVG uses preserveAspectRatio="none" to stretch and cover the full viewport like a liquid sheet.
  // - Dual wave offsets create a high-contrast chromatic tearing effect (coral leading white).

  return (
    <div
      ref={overlayRef}
      role="progressbar"
      aria-label="Loading creative portfolio"
      style={{
        position:       'fixed',
        inset:          0,
        backgroundColor:'#060606', // Void base color
        zIndex:         99999,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        pointerEvents:  'all',
      }}
    >
      {/* Centered Minimal Brand Typography (Inverted dynamically by rising fluid) */}
      <div
        ref={textRef}
        style={{
          position:      'absolute',
          zIndex:        3, // On top of the SVG liquid layers
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          gap:           '10px',
          fontFamily:    'var(--font-mono, monospace)',
          pointerEvents: 'none',
          willChange:    'transform, opacity',
          mixBlendMode:  'difference', // Dynamic color-inversion masking
        }}
      >
        <span
          style={{
            fontSize:      '13px',
            fontWeight:    700,
            letterSpacing: '0.22em',
            color:         '#FFFFFF',
            textTransform: 'uppercase',
            opacity:       0.9,
          }}
        >
          JUSTCHANIAGO
        </span>
        <span
          ref={percentRef}
          style={{
            fontSize:      '10px',
            color:         'rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.1em',
          }}
        >
          [ 00% ]
        </span>
      </div>

      {/* SVG Canvas for Full-Screen Liquid Physics */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none" // Stretches vector paths to cover full screen responsive
        style={{
          position:      'absolute',
          inset:         0,
          width:         '100vw',
          height:        '100vh',
          zIndex:        2, // On top of typography
          pointerEvents: 'none',
          overflow:      'visible',
        }}
      >
        {/* === GROUP 1: RISING FLUID (Top wavy block) === */}
        <g ref={risingGroupRef}>
          {/* Translucent Phosphor Wave */}
          <path
            ref={risePhosphorRef}
            d="M -100 0 C -70 -5 -30 5 0 0 C 30 -5 70 5 100 0 C 130 -5 170 5 200 0 L 200 115 L -100 115 Z"
            fill="rgba(249, 92, 75, 0.9)" // Coral
          />
          {/* Solid White Wave */}
          <path
            ref={riseWhiteRef}
            d="M -100 0 C -75 -6 -25 6 0 0 C 25 -6 75 6 100 0 C 125 -6 175 6 200 0 L 200 115 L -100 115 Z"
            fill="#FFFFFF" // Solid White
          />
        </g>

        {/* === GROUP 2: PULL-UP CURTAIN (Bottom wavy block) === */}
        <g ref={pullGroupRef}>
          {/* Translucent Phosphor Curtain */}
          <path
            ref={pullPhosphorRef}
            d="M -100 -115 L 200 -115 L 200 0 C 170 6 130 -6 100 0 C 70 6 30 -6 0 0 C -30 6 -70 -6 -100 0 Z"
            fill="rgba(249, 92, 75, 0.9)" // Coral
          />
          {/* Solid White Curtain */}
          <path
            ref={pullWhiteRef}
            d="M -100 -115 L 200 -115 L 200 0 C 175 5 125 -5 100 0 C 75 5 25 -5 0 0 C -25 5 -75 -5 -100 0 Z"
            fill="#FFFFFF" // Solid White
          />
        </g>
      </svg>
    </div>
  );
}
