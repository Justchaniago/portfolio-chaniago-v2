'use client';

import { useEffect } from 'react';
import { initLenis } from '@/lib/gsap';

export default function LenisInit() {
  useEffect(() => {
    const lenis = initLenis();
    return () => lenis.destroy();
  }, []);

  return null;
}
