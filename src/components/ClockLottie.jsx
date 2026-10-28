import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light.js';
import clockAnimationData from '../assets/clock.json';

export const ClockLottie = ({ size = 20, style = {} }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: clockAnimationData,
    });

    return () => {
      anim.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
    />
  );
};
