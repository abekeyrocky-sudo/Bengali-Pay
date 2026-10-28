import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { saveUserToFirestore } from '../firebase';
import { ShieldCheck, AlertTriangle, ArrowRight, X, Clock, Lock } from 'lucide-react';

const MAX_DAILY_SKIPS = 2;

// Get Bangladesh 6:00 AM cycle date YYYY-MM-DD
const getCycleDateStr = () => {
  const now = Date.now();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(now - 6 * 3600 * 1000));
};

const getStoredSkipCount = () => {
  try {
    const cycle = getCycleDateStr();
    const raw = localStorage.getItem('bp_quota_modal_skip_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === cycle) {
        return typeof parsed.count === 'number' ? parsed.count : 0;
      }
    }
  } catch (e) {}
  return 0;
};

export const AccountQuotaReminderModal = () => {
  const { 
    referralQuota, 
    navigateTo, 
    userId,
    isQuotaReminderOpen,
    setIsQuotaReminderOpen
  } = useApp();
  const [skipCount, setSkipCount] = useState(getStoredSkipCount);
  const hasTriggeredRef = useRef(false);

  // Live 6:00 AM reset countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  // Sync skip count on open or cycle change
  useEffect(() => {
    setSkipCount(getStoredSkipCount());
  }, [isQuotaReminderOpen]);

  const currentDailyQuota = referralQuota?.currentDailyQuota ?? 1;
  const todayReferralCount = referralQuota?.todayReferralCount ?? 0;
  const missedDaysCount = referralQuota?.missedDaysCount ?? 0;
  const isWarning = referralQuota?.accountStatus === 'WARNING';
  
  // Real Punishment Check: If user failed yesterday's mission and has penalty, ZERO SKIPS allowed!
  const isPenalized = isWarning || missedDaysCount > 0;
  const canSkip = !isPenalized && (skipCount < MAX_DAILY_SKIPS);
  const remainingSkips = isPenalized ? 0 : Math.max(0, MAX_DAILY_SKIPS - skipCount);

  useEffect(() => {
    if (!isQuotaReminderOpen) return;

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
  }, [isQuotaReminderOpen, referralQuota?.nextResetMs]);

  useEffect(() => {
    // If penalized, trigger quickly after mount (1.2s); normal days wait 15s
    const delay = isPenalized ? 1200 : 15000;
    const timer = setTimeout(() => {
      // Trigger once per app session if quota is not yet met
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        const target = referralQuota?.currentDailyQuota ?? 1;
        const done = referralQuota?.todayReferralCount ?? 0;
        
        // Show if target is pending
        if (done < target) {
          setIsQuotaReminderOpen(true);
          try {
            sounds.playNotification();
          } catch (e) {}
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [referralQuota, isPenalized, setIsQuotaReminderOpen]);

  if (!isQuotaReminderOpen) return null;

  const handleGoToStatus = () => {
    sounds.playClick();
    setIsQuotaReminderOpen(false);
    navigateTo('account-status');
  };

  const handleSkip = () => {
    if (!canSkip) {
      try {
        sounds.playError?.();
      } catch (e) {}
      return;
    }
    sounds.playClick();
    const cycle = getCycleDateStr();
    const newCount = skipCount + 1;
    setSkipCount(newCount);
    try {
      localStorage.setItem('bp_quota_modal_skip_data', JSON.stringify({ date: cycle, count: newCount }));
      if (userId) {
        saveUserToFirestore(userId, { modalSkipDate: cycle, modalSkipCount: newCount });
      }
    } catch (e) {}
    setIsQuotaReminderOpen(false);
  };

  return (
    <div
      onClick={() => {
        // Only allow backdrop dismiss if user still has skips left
        if (canSkip) {
          handleSkip();
        }
      }}
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
          boxShadow: isPenalized
            ? '0 25px 50px -12px rgba(239, 68, 68, 0.45)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: isPenalized ? '1.5px solid #fca5a5' : '1px solid rgba(0, 0, 0, 0.05)',
          animation: 'modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Close Button Top-Right (Active only if not penalized and has skips left) */}
        {canSkip ? (
          <button
            onClick={handleSkip}
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
        ) : (
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626'
            }}
            title={isPenalized ? "পেনাল্টি সক্রিয়: স্কিপ নিষিদ্ধ" : "আজকের স্কিপ সীমা শেষ"}
          >
            <Lock size={14} />
          </div>
        )}

        {/* Clean Icon Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: isPenalized
              ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
              : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            border: '3px solid #ffffff',
            boxShadow: isPenalized
              ? '0 8px 20px rgba(239, 68, 68, 0.25)'
              : '0 8px 20px rgba(37, 99, 235, 0.18)',
            color: isPenalized ? '#dc2626' : '#2563eb'
          }}
        >
          {isPenalized ? (
            <AlertTriangle size={32} />
          ) : (
            <ShieldCheck size={32} />
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            margin: '0 0 6px 0',
            fontSize: '18px',
            fontWeight: '900',
            color: isPenalized ? '#991b1b' : '#0f172a',
            fontFamily: "'Noto Serif Bengali', serif"
          }}
        >
          {isPenalized ? 'অ্যাকাউন্ট পেনাল্টি সতর্কতা! ⚠️' : 'দৈনিক মিশন বাকি আছে'}
        </h3>

        {/* Message */}
        <p
          style={{
            margin: '0 0 14px 0',
            fontSize: '13px',
            lineHeight: '1.5',
            color: canSkip ? '#475569' : '#dc2626',
            fontFamily: "'Noto Serif Bengali', serif",
            fontWeight: canSkip ? 'normal' : '600'
          }}
        >
          {isPenalized
            ? `পূর্ববর্তী দিনে মিশন সম্পন্ন না করায় অ্যাকাউন্টে পেনাল্টি যুক্ত হয়েছে এবং উইথড্র বন্ধ রয়েছে। অ্যাকাউন্ট সচল করতে আজকের ${currentDailyQuota}টি রেফার কোটা পূরণ করা বাধ্যতামূলক (কোনো স্কিপ নেই)।`
            : canSkip
            ? 'আপনার অ্যাকাউন্ট সচল ও নিরাপদ রাখতে আজকের নির্ধারিত মিশন সম্পন্ন করুন।'
            : '⚠️ আপনার আজকের ২ বার স্কিপ করার সীমা শেষ! অ্যাকাউন্ট সচল রাখতে নিচের বাটনে ট্যাপ করে মিশন দেখুন।'}
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
            background: isPenalized
              ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isPenalized
              ? '0 6px 18px rgba(220, 38, 38, 0.35)'
              : '0 6px 18px rgba(22, 163, 74, 0.28)',
            fontFamily: "'Noto Serif Bengali', serif",
            marginBottom: '8px'
          }}
        >
          <span>{isPenalized ? 'পেনাল্টি কাটাতে মিশন দেখুন' : 'স্ট্যাটাস ও মিশন দেখুন'}</span>
          <ArrowRight size={16} />
        </button>

        {/* Secondary Dismiss Button (Only if user has skips left and not penalized) */}
        {canSkip ? (
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#94a3b8',
              cursor: 'pointer',
              fontFamily: "'Noto Serif Bengali', serif",
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>পরে করব</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>
              (আজকের বাকি: {remainingSkips} বার)
            </span>
          </button>
        ) : (
          <div
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#dc2626',
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: "'Noto Serif Bengali', serif",
              boxSizing: 'border-box'
            }}
          >
            <Lock size={13} color="#ef4444" />
            <span>
              {isPenalized
                ? 'পেনাল্টি সক্রিয়! কোনো স্কিপ নেই, কোটা পূরণ বাধ্যতামূলক'
                : 'আজকের স্কিপ শেষ! অ্যাকাউন্ট সচল রাখতে কোটা পূরণ করুন'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

