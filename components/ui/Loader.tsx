'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  const panel3Ref = useRef<HTMLDivElement>(null);
  
  const slide1Ref = useRef<HTMLDivElement>(null);
  const slide2Ref = useRef<HTMLDivElement>(null);
  const slide3Ref = useRef<HTMLDivElement>(null);
  const slide4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    // Pre-load the critical portrait image to browser cache
    let imageLoaded = false;
    const img = new Image();
    img.src = '/images/portrait.png';
    const checkImage = () => {
      if (img.complete) {
        imageLoaded = true;
      } else {
        img.onload = () => { imageLoaded = true; };
        img.onerror = () => { imageLoaded = true; }; // Fail-safe
      }
    };
    checkImage();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      // Set initial states
      gsap.set([slide2Ref.current, slide3Ref.current, slide4Ref.current], { opacity: 0, y: 30 });
      gsap.set(slide1Ref.current, { opacity: 1, y: 0 });
      gsap.set([panel1Ref.current, panel2Ref.current, panel3Ref.current], { yPercent: 0 });

      const progressObj = { value: 0 };

      // 1. Percentage count-up (4.5 seconds)
      tl.to(progressObj, {
        value: 100,
        duration: 4.5,
        ease: 'none',
        onUpdate: () => {
          const p = Math.round(progressObj.value);
          if (percentRef.current) {
            percentRef.current.textContent = `[ ${p.toString().padStart(2, '0')}% ]`;
          }
        }
      }, 0);

      // 2. Slide transitions
      // Slide 1 -> Slide 2 (at 1.125s)
      tl.to(slide1Ref.current, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power2.inOut'
      }, 1.125);
      
      tl.fromTo(slide2Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        1.325
      );

      // Slide 2 -> Slide 3 (at 2.25s)
      tl.to(slide2Ref.current, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power2.inOut'
      }, 2.25);
      
      tl.fromTo(slide3Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        2.45
      );

      // Slide 3 -> Slide 4 (at 3.375s)
      tl.to(slide3Ref.current, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power2.inOut'
      }, 3.375);
      
      tl.fromTo(slide4Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        3.575
      );

      // Pause at 4.5s to verify image is loaded
      tl.addPause(4.5, () => {
        const verifyAndTrigger = () => {
          if (imageLoaded) {
            tl.play();
          } else {
            requestAnimationFrame(verifyAndTrigger);
          }
        };
        verifyAndTrigger();
      });

      // 3. Fade out content
      tl.to([slide4Ref.current, topBarRef.current, bottomBarRef.current], {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      });

      // 4. Slide up panels
      tl.to([panel1Ref.current, panel2Ref.current, panel3Ref.current], {
        yPercent: -100,
        duration: 1.2,
        ease: 'power4.inOut',
        stagger: 0.1
      }, '+=0.1');

      // Fade out overlay wrapper synchronously at the very end
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power1.out',
      }, '-=0.4');

    });

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      role="progressbar"
      aria-label="Loading creative portfolio"
      className="fixed inset-0 z-[99999] overflow-hidden flex flex-col justify-between p-8 md:p-12 select-none"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Background Panels */}
      <div className="absolute inset-0 flex z-0 pointer-events-none">
        <div ref={panel1Ref} className="w-1/3 h-full bg-void border-r border-white/[0.03]" />
        <div ref={panel2Ref} className="w-1/3 h-full bg-void border-r border-white/[0.03]" />
        <div ref={panel3Ref} className="w-1/3 h-full bg-void" />
      </div>

      {/* Top Bar */}
      <div
        ref={topBarRef}
        className="w-full flex justify-between items-center z-10 font-mono text-[10px] md:text-xs tracking-widest text-ash uppercase"
      >
        <span>JUSTCHANIAGO</span>
        <span ref={percentRef}>[ 00% ]</span>
      </div>

      {/* Center Slides Container */}
      <div className="flex-1 flex items-center justify-center relative w-full z-10">
        <div className="max-w-4xl w-full mx-auto px-6 relative h-[350px] md:h-[400px] flex items-center">
          {/* Slide 1 */}
          <div ref={slide1Ref} className="absolute inset-x-6 flex flex-col gap-4 md:gap-6">
            <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-ash uppercase">
              [ 01 / CONCEPT ]
            </span>
            <h2 className="font-display text-4xl md:text-7xl text-white leading-tight italic">
              The Typographic Manifesto
            </h2>
            <p className="font-body text-sm md:text-lg text-ash max-w-xl leading-relaxed">
              A study in editorial layout, high-contrast form, and digital precision.
            </p>
          </div>

          {/* Slide 2 */}
          <div ref={slide2Ref} className="absolute inset-x-6 flex flex-col gap-4 md:gap-6">
            <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-ash uppercase">
              [ 02 / PHILOSOPHY ]
            </span>
            <h2 className="font-display text-4xl md:text-7xl text-white leading-tight">
              Uncompromising Craft
            </h2>
            <p className="font-body text-sm md:text-lg text-ash max-w-xl leading-relaxed">
              Where code is treated as a medium of art, and design is executed with mathematical rigor.
            </p>
          </div>

          {/* Slide 3 */}
          <div ref={slide3Ref} className="absolute inset-x-6 flex flex-col gap-4 md:gap-6">
            <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-ash uppercase">
              [ 03 / AESTHETIC ]
            </span>
            <h2 className="font-display text-4xl md:text-7xl text-white leading-tight italic">
              The Void & The Light
            </h2>
            <p className="font-body text-sm md:text-lg text-ash max-w-xl leading-relaxed">
              A dark-first, high-contrast canvas designed to let creative work breathe.
            </p>
          </div>

          {/* Slide 4 */}
          <div ref={slide4Ref} className="absolute inset-x-6 flex flex-col gap-4 md:gap-6">
            <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-ash uppercase">
              [ 04 / IDENTITY ]
            </span>
            <h2 className="font-display text-4xl md:text-7xl text-white leading-tight">
              JUSTCHANIAGO
            </h2>
            <p className="font-body text-sm md:text-lg text-ash max-w-xl leading-relaxed">
              Creative Developer Portfolio — Edition 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        ref={bottomBarRef}
        className="w-full flex justify-between items-center z-10 font-mono text-[10px] md:text-xs tracking-widest text-ash/50 uppercase"
      >
        <span>PORTFOLIO '26</span>
        <span>EDITORIAL EDITION</span>
      </div>
    </div>
  );
}
