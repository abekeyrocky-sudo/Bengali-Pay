import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import splashMotionImg from '../assets/bengali_pay_splash_motion.jpg';

// Helper to convert standard digits to Bengali numerals
const toBengaliNumber = (num) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bengaliDigits[Number(d)]);
};

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
        }, 150);
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

      {/* Custom Game-Style Nature Green Process Bar Container */}
      <div
        style={{
          position: 'absolute',
          bottom: '38px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '84%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        {/* Top Text: লোড হচ্ছে... ৬৫% */}
        <div
          style={{
            color: '#ffffff',
            fontSize: '21px',
            fontWeight: '900',
            fontFamily: "'Noto Serif Bengali', 'Baloo Da 2', serif",
            letterSpacing: '0.5px',
            marginBottom: '6px',
            WebkitTextStroke: '1.4px #0a3314',
            textShadow: '-2px -2px 0 #0a3314, 2px -2px 0 #0a3314, -2px 2px 0 #0a3314, 2px 2px 0 #0a3314, 0 4px 10px rgba(0,0,0,0.85)'
          }}
        >
          লোড হচ্ছে... {toBengaliNumber(progress)}%
        </div>

        {/* Outer Nature Green Carved Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '28px',
            background: 'linear-gradient(180deg, #388e3c 0%, #2e7d32 45%, #1b5e20 100%)',
            border: '3px solid #0d3817',
            borderRadius: '26px',
            padding: '3px 4px',
            boxSizing: 'border-box',
            boxShadow: '0 6px 18px rgba(0,0,0,0.7), inset 0 2px 3px rgba(255,255,255,0.35)'
          }}
        >
          {/* Decorative leaves on top-left of the green frame */}
          <svg
            width="22"
            height="14"
            viewBox="0 0 22 14"
            fill="none"
            style={{
              position: 'absolute',
              top: '-8px',
              left: '4px',
              zIndex: 4,
              transform: 'rotate(-10deg)',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
            }}
          >
            <path
              d="M11 13C9 7 4 3 0 5C0 10 5 13 11 13Z"
              fill="#86efac"
              stroke="#0d3817"
              strokeWidth="1.3"
            />
            <path
              d="M11 13C13 7 18 3 22 5C22 10 17 13 11 13Z"
              fill="#22c55e"
              stroke="#0d3817"
              strokeWidth="1.3"
            />
          </svg>

          {/* Inner Recessed Dark Green Groove / Track */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: '#082310',
              borderRadius: '20px',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(255,255,255,0.12)',
              overflow: 'visible'
            }}
          >
            {/* Inner Golden Candy Fill */}
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: '18px',
                background: 'linear-gradient(180deg, #fffbeb 0%, #fde047 25%, #f59e0b 60%, #b45309 100%)',
                boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(180,83,9,0.7), 0 0 10px rgba(245,158,11,0.6)',
                border: '1px solid #78350f',
                boxSizing: 'border-box',
                transition: 'width 0.04s linear'
              }}
            />

            {/* Traveling ৳ Taka Golden Coin with Sprouting Leaves Indicator */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.min(99, Math.max(1, progress))}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))',
                transition: 'left 0.04s linear'
              }}
            >
              {/* Sprouting Green Leaves on Top of Coin */}
              <svg
                width="22"
                height="12"
                viewBox="0 0 22 12"
                fill="none"
                style={{
                  marginBottom: '-3px',
                  zIndex: 2,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}
              >
                <path
                  d="M11 11C9 6 4 2 0 4C0 9 5 11 11 11Z"
                  fill="#86efac"
                  stroke="#0f3d1b"
                  strokeWidth="1.2"
                />
                <path
                  d="M11 11C13 6 18 2 22 4C22 9 17 11 11 11Z"
                  fill="#22c55e"
                  stroke="#0f3d1b"
                  strokeWidth="1.2"
                />
              </svg>

              {/* Round Golden ৳ Taka Coin */}
              <div
                style={{
                  width: '27px',
                  height: '27px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde047 30%, #eab308 65%, #b45309 100%)',
                  border: '2px solid #78350f',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.85), inset 0 -2px 3px rgba(120,53,15,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    fontFamily: "'Noto Serif Bengali', serif",
                    fontSize: '15px',
                    fontWeight: '900',
                    color: '#0f3d1b',
                    marginTop: '-2px',
                    textShadow: '0 1px 1px rgba(255,255,255,0.7)'
                  }}
                >
                  ৳
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text: অপেক্ষা করুন... */}
        <div
          style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '900',
            fontFamily: "'Noto Serif Bengali', 'Baloo Da 2', serif",
            letterSpacing: '0.5px',
            marginTop: '8px',
            WebkitTextStroke: '1.4px #0a3314',
            textShadow: '-2px -2px 0 #0a3314, 2px -2px 0 #0a3314, -2px 2px 0 #0a3314, 2px 2px 0 #0a3314, 0 4px 10px rgba(0,0,0,0.85)'
          }}
        >
          অপেক্ষা করুন...
        </div>
      </div>
    </div>
  );
};
