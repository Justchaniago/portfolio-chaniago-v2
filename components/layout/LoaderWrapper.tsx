'use client';

import { useState, useEffect } from 'react';
import Loader from '../ui/Loader';

export default function LoaderWrapper() {
  const [loaded, setLoaded] = useState(false);

  const handleComplete = () => {
    setLoaded(true);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('is-loaded');
      document.dispatchEvent(new CustomEvent('loaderComplete'));
    }
  };

  if (loaded) return null;
  return <Loader onComplete={handleComplete} />;
}
