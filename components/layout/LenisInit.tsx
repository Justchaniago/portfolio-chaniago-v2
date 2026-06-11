'use client';

import { useEffect } from 'react';
import { initLenis } from '@/lib/gsap';

type WindowWithLenis = Window & {
  lenis?: ReturnType<typeof initLenis>;
};

export default function LenisInit() {
  useEffect(() => {
    const lenis = initLenis();
    if (typeof window !== 'undefined') {
      (window as unknown as WindowWithLenis).lenis = lenis;
    }
    return () => {
      lenis.destroy();
      if (typeof window !== 'undefined') {
        Reflect.deleteProperty(window, 'lenis');
      }
    };
  }, []);

  return null;
}
