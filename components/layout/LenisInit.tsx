'use client';

import { useEffect } from 'react';
import { initLenis } from '@/lib/gsap';

export default function LenisInit() {
  useEffect(() => {
    const lenis = initLenis();
    if (typeof window !== 'undefined') {
      (window as any).lenis = lenis;
    }
    return () => {
      lenis.destroy();
      if (typeof window !== 'undefined') {
        delete (window as any).lenis;
      }
    };
  }, []);

  return null;
}
