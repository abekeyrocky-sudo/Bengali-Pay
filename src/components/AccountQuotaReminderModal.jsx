import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { ShieldCheck, ArrowRight, X, Clock } from 'lucide-react';

export const AccountQuotaReminderModal = () => {
  const { referralQuota, navigateTo, currentScreen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Live 6:00 AM reset countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      let targetMs = referralQuota?.nextResetMs;

      // Fallback: calculate next 6:00 AM BD Time (UTC+6) directly if not yet received
      if (!targetMs || targetMs <= now) {
        const cycleDate = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Dhaka',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(now - 6 * 3600 * 1000));
        const [year, month, day] = cycleDate.split('-').map(Number);
        targetMs = Date.UTC(year, month - 1, day + 1, 0, 0, 0);
      }

      const diffSec = Math.max(0, Math.floor((targetMs - now) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, referralQuota?.nextResetMs]);

  useEffect(() => {
    // 15 seconds timer after app mount
    const timer = setTimeout(() => {
      // Trigger once per app session if quota is not yet met
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        const target = referralQuota?.currentDailyQuota ?? 1;
        const done = referralQuota?.todayReferralCount ?? 0;
        
        // Show if target is pending
        if (done < target) {
          setIsOpen(true);
          try {
            sounds.playNotification();
          } catch (e) {}
        }
      }
    }, 15000); // exactly 15s

    return () => clearTimeout(timer);
  }, [referralQuota]);

  if (!isOpen) return null;

  // Don't show on top of game screen during active gameplay
  if (currentScreen === 'game') return null;

  const currentDailyQuota = referralQuota?.currentDailyQuota ?? 1;
  const todayReferralCount = referralQuota?.todayReferralCount ?? 0;
  const isWarning = referralQuota?.accountStatus === 'WARNING';

  const handleGoToStatus = () => {
    sounds.playClick();
    setIsOpen(false);
    navigateTo('account-status');
  };

  const handleClose = () => {
    sounds.playClick();
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'modalFadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '320px',
          background: '#ffffff',
          borderRadius: '26px',
          padding: '26px 20px 20px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          animation: 'modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Close Button Top-Right */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#f1f5f9',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={16} />
        </button>

        {/* Clean Icon Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: isWarning
              ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
              : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            border: '3px solid #ffffff',
            boxShadow: isWarning
              ? '0 8px 20px rgba(239, 68, 68, 0.18)'
              : '0 8px 20px rgba(37, 99, 235, 0.18)',
            color: isWarning ? '#dc2626' : '#2563eb'
          }}
        >
          <ShieldCheck size={32} />
        </div>

        {/* Title */}
        <h3
          style={{
            margin: '0 0 6px 0',
            fontSize: '18px',
            fontWeight: '900',
            color: '#0f172a',
            fontFamily: "'Noto Serif Bengali', serif"
          }}
        >
          দৈনিক মিশন বাকি আছে
        </h3>

        {/* Message */}
        <p
          style={{
            margin: '0 0 14px 0',
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#475569',
            fontFamily: "'Noto Serif Bengali', serif"
          }}
        >
          আপনার অ্যাকাউন্ট সচল ও নিরাপদ রাখতে আজকের নির্ধারিত মিশন সম্পন্ন করুন।
        </p>

        {/* Time Remaining Countdown Pill (Urgent Red) */}
        <div
          style={{
            width: '100%',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#dc2626" />
            <span
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#991b1b',
                fontFamily: "'Noto Serif Bengali', serif"
              }}
            >
              সময় বাকি:
            </span>
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '900',
              fontFamily: "'Outfit', monospace",
              color: '#dc2626',
              background: '#ffffff',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1.5px solid #fca5a5',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              letterSpacing: '0.5px'
            }}
          >
            <span>{timeLeft.hours}</span>
            <span style={{ opacity: 0.5 }}>:</span>
            <span>{timeLeft.minutes}</span>
            <span style={{ opacity: 0.5 }}>:</span>
            <span>{timeLeft.seconds}</span>
          </div>
        </div>

        {/* Primary Action Button (Navigate to Account Status) */}
        <button
          onClick={handleGoToStatus}
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(22, 163, 74, 0.28)',
            fontFamily: "'Noto Serif Bengali', serif",
            marginBottom: '8px'
          }}
        >
          <span>স্ট্যাটাস ও মিশন দেখুন</span>
          <ArrowRight size={16} />
        </button>

        {/* Secondary Dismiss Button */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#94a3b8',
            cursor: 'pointer',
            fontFamily: "'Noto Serif Bengali', serif"
          }}
        >
          পরে করব
        </button>
      </div>
    </div>
  );
};

