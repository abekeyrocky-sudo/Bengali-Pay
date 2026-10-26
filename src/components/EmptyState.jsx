import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light.js';
import emptyAnimationData from '../assets/empty-page.json';

export const EmptyState = ({
  title = 'কোনো তথ্য পাওয়া যায়নি',
  subtitle = 'নতুন আপডেট ও রিওয়ার্ডের জন্য সাথে থাকুন!',
  actionText,
  onAction,
  animationSize = 170,
  style = {}
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: emptyAnimationData,
    });

    return () => {
      anim.destroy();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px 16px',
        background: '#ffffff',
        borderRadius: '24px',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Lottie Animation Container */}
      <div
        ref={containerRef}
        style={{
          width: `${animationSize}px`,
          height: `${animationSize}px`,
          maxWidth: '100%',
          margin: '0 auto'
        }}
      />

      {/* Title */}
      {title && (
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '6px 0 4px 0',
            fontFamily: "'Outfit', 'Noto Serif Bengali', sans-serif"
          }}
        >
          {title}
        </h3>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: '12.5px',
            fontWeight: '500',
            color: '#64748b',
            margin: 0,
            maxWidth: '260px',
            lineHeight: '1.45',
            fontFamily: "'Outfit', 'Noto Serif Bengali', sans-serif"
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Optional CTA Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '16px',
            padding: '8px 20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            fontFamily: "'Outfit', 'Noto Serif Bengali', sans-serif",
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
