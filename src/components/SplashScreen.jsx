import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import splashMotionImg from '../assets/bengali_pay_splash_motion.jpg';

export const SplashScreen = () => {
  const { navigateTo } = useApp();
  const [progress, setProgress] = useState(1);

  // Smooth 5-second progress bar animation (1% to 100%)
  useEffect(() => {
    const duration = 5000; // 5 seconds
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const current = Math.min(100, Math.max(1, Math.round((elapsed / duration) * 100)));
      setProgress(current);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          navigateTo('home');
        }, 120);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [navigateTo]);

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        overflow: 'hidden',
        background: '#0a1910',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Full-Bleed Splash Artwork */}
      <img
        src={splashMotionImg}
        alt="Bengali Pay Splash"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />

      {/* Custom Green Theme Process / Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '46px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '78%',
          maxWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          zIndex: 10
        }}
      >
        {/* Loading status & percentage text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
            fontSize: '12px',
            fontWeight: '800',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(34, 197, 94, 0.7)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.3px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 8px #4ade80',
                display: 'inline-block'
              }}
            />
            Loading...
          </span>

          <span
            style={{
              fontWeight: '900',
              color: '#86efac',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '13px'
            }}
          >
            {progress}%
          </span>
        </div>

        {/* Progress Bar Outer Track */}
        <div
          style={{
            width: '100%',
            height: '14px',
            background: 'rgba(5, 38, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            border: '1.5px solid rgba(74, 222, 128, 0.55)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.6), inset 0 2px 4px rgba(0,0,0,0.6)',
            padding: '2px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Progress Bar Inner Fill */}
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #15803d 0%, #22c55e 50%, #86efac 100%)',
              boxShadow: '0 0 10px rgba(74, 222, 128, 0.85)',
              transition: 'width 0.04s linear'
            }}
          />
        </div>
      </div>
    </div>
  );
};
