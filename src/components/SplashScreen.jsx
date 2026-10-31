import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import splashMotionImg from '../assets/bengali_pay_splash_motion.jpg';

export const SplashScreen = () => {
  const { navigateTo } = useApp();

  // Auto navigate to home after 2.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigateTo('home');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      onClick={() => navigateTo('home')}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100%',
        cursor: 'pointer',
        overflow: 'hidden',
        background: '#0a1910',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="ট্যাপ করে প্রবেশ করুন"
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
    </div>
  );
};
