'use client';

import { useLayoutEffect, useState } from 'react';
import { createContactScene } from '@/components/scenes/ContactScene';

export function useContactSceneLifecycle() {
  const [contactScene, setContactScene] =
    useState<ReturnType<typeof createContactScene> | null>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const contactSceneInstance = createContactScene();
    contactSceneInstance.prepare();
    contactSceneInstance.setProgress(0);
    setContactScene(contactSceneInstance);

    return () => {
      contactSceneInstance.destroy();
      setContactScene(null);
    };
  }, []);

  return contactScene;
}
