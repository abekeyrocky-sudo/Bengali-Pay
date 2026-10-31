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
          bottom: '44px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '68%',
          maxWidth: '240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        {/* Top Text: লোড হচ্ছে... ৬৫% */}
        <div
          style={{
            width: '100%',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '800',
            fontFamily: "'Baloo Da 2', sans-serif",
            letterSpacing: '0.3px',
            marginBottom: '5px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paintOrder: 'stroke fill',
            WebkitTextStroke: '2.5px #144d08',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))'
          }}
        >
          লোড হচ্ছে... {toBengaliNumber(progress)}%
        </div>

        {/* Outer Nature Green Carved Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '22px',
            background: 'linear-gradient(180deg, #82a330 0%, #57852a 35%, #356114 75%, #205008 100%)',
            border: '2px solid #143d08',
            borderRadius: '20px',
            padding: '2.5px 3px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 10px rgba(0,0,0,0.45), inset 0 1.5px 2px rgba(255,255,255,0.4)'
          }}
        >
          {/* Decorative leaves on top-left of the green frame */}
          <svg
            width="17"
            height="11"
            viewBox="0 0 22 14"
            fill="none"
            style={{
              position: 'absolute',
              top: '-6px',
              left: '3px',
              zIndex: 4,
              transform: 'rotate(-10deg)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))'
            }}
          >
            <path
              d="M11 13C9 7 4 3 0 5C0 10 5 13 11 13Z"
              fill="#76b82a"
              stroke="#143d08"
              strokeWidth="1.3"
            />
            <path
              d="M11 13C13 7 18 3 22 5C22 10 17 13 11 13Z"
              fill="#4c8c18"
              stroke="#143d08"
              strokeWidth="1.3"
            />
          </svg>

          {/* Inner Recessed Dark Green Groove / Track */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: '#17431e',
              borderRadius: '16px',
              boxShadow: 'inset 0 2.5px 4px rgba(0,0,0,0.7), inset 0 -1px 1px rgba(255,255,255,0.15)',
              overflow: 'visible'
            }}
          >
            {/* Inner Golden Candy Fill */}
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: '12px',
                background: 'linear-gradient(180deg, #fffbeb 0%, #fef08a 18%, #facc15 45%, #f59e0b 75%, #d97706 100%)',
                boxShadow: 'inset 0 1.5px 1.5px rgba(255,255,255,0.95), inset 0 -1.5px 2px rgba(180,83,9,0.7), 0 0 6px rgba(245,158,11,0.5)',
                border: '1px solid #b45309',
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
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))',
                transition: 'left 0.04s linear'
              }}
            >
              {/* Sprouting Green Leaves on Top of Coin */}
              <svg
                width="16"
                height="9"
                viewBox="0 0 22 12"
                fill="none"
                style={{
                  marginBottom: '-2px',
                  zIndex: 2,
                  filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.3))'
                }}
              >
                <path
                  d="M11 11C9 6 4 2 0 4C0 9 5 11 11 11Z"
                  fill="#76b82a"
                  stroke="#143d08"
                  strokeWidth="1.2"
                />
                <path
                  d="M11 11C13 6 18 2 22 4C22 9 17 11 11 11Z"
                  fill="#4c8c18"
                  stroke="#143d08"
                  strokeWidth="1.2"
                />
              </svg>

              {/* Round Golden ৳ Taka Coin */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde047 30%, #eab308 65%, #b45309 100%)',
                  border: '1.5px solid #8f7013',
                  boxShadow: '0 1.5px 4px rgba(0,0,0,0.4), inset 0 1.5px 1.5px rgba(255,255,255,0.9), inset 0 -1.5px 2px rgba(120,53,15,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    fontFamily: "'Baloo Da 2', 'Noto Serif Bengali', serif",
                    fontSize: '11px',
                    fontWeight: '900',
                    color: '#144d08',
                    marginTop: '-1px',
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
            width: '100%',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '800',
            fontFamily: "'Baloo Da 2', sans-serif",
            letterSpacing: '0.3px',
            marginTop: '6px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paintOrder: 'stroke fill',
            WebkitTextStroke: '2.5px #144d08',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))'
          }}
        >
          অপেক্ষা করুন...
        </div>
      </div>
    </div>
  );
};
