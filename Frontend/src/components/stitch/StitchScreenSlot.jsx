'use client';

import { useEffect, useState } from 'react';
import StitchScreenFrame from './StitchScreenFrame';

export function StitchScreenSlot({ title, src, fallbackImage, height, children }) {
  const [available, setAvailable] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkScreen() {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        if (!cancelled) {
          setAvailable(response.ok);
        }
      } catch {
        if (!cancelled) {
          setAvailable(false);
        }
      } finally {
        if (!cancelled) {
          setChecked(true);
        }
      }
    }

    checkScreen();

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!checked) {
    return <main className="min-h-screen bg-[#fbf9f9]" />;
  }

  if (available) {
    return (
      <StitchScreenFrame
        title={title}
        src={src}
        fallbackImage={fallbackImage}
        height={height}
      />
    );
  }

  return children;
}

export default StitchScreenSlot;
