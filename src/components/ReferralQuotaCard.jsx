import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Users, CheckCircle2, ChevronRight } from 'lucide-react';

export const ReferralQuotaCard = () => {
  const { referralQuota, navigateTo } = useApp();

  if (!referralQuota) return null;

  const {
    currentDailyQuota = 1,
    todayReferralCount = 0,
    missedDaysCount = 0,
    accountStatus = 'ACTIVE'
  } = referralQuota;

  const isWarning = accountStatus === 'WARNING' && todayReferralCount < currentDailyQuota;
  const isGoalMet = todayReferralCount >= currentDailyQuota;
  const progressPercent = Math.min(100, Math.round((todayReferralCount / Math.max(1, currentDailyQuota)) * 100));

  return (
    <div
      style={{
        flexShrink: 0,
        borderRadius: '20px',
        padding: '16px',
        background: isWarning
          ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
          : isGoalMet
          ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
          : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: isWarning
          ? '1.5px solid #fca5a5'
          : isGoalMet
          ? '1.5px solid #86efac'
          : '1.5px solid #bfdbfe',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Header Badge & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isWarning ? '#ef4444' : isGoalMet ? '#16a34a' : '#2563eb',
              color: '#ffffff',
              boxShadow: isWarning
                ? '0 2px 8px rgba(239, 68, 68, 0.35)'
                : isGoalMet
                ? '0 2px 8px rgba(22, 163, 74, 0.35)'
                : '0 2px 8px rgba(37, 99, 235, 0.35)'
            }}
          >
            {isWarning ? (
              <AlertTriangle size={18} />
            ) : isGoalMet ? (
              <CheckCircle2 size={18} />
            ) : (
              <Users size={18} />
            )}
          </div>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                color: isWarning ? '#b91c1c' : isGoalMet ? '#15803d' : '#1d4ed8'
              }}
            >
              {isWarning ? 'অ্যাকাউন্ট ভেরিফিকেশন পেনাল্টি' : isGoalMet ? 'অ্যাকাউন্ট ভেরিফাইড' : 'দৈনিক অ্যাকাউন্ট কোটা'}
            </span>
            <h4
              style={{
                margin: '1px 0 0',
                fontSize: '14px',
                fontWeight: '900',
                color: isWarning ? '#991b1b' : isGoalMet ? '#14532d' : '#1e3a8a',
                fontFamily: "'Noto Serif Bengali', serif"
              }}
            >
              {isWarning
                ? `আজ ${currentDailyQuota} জন রেফার আবশ্যক!`
                : isGoalMet
                ? 'আজকের কোটা সফলভাবে সম্পন্ন!'
                : 'প্রতিদিন ১টি সক্রিয় রেফার আবশ্যক'}
            </h4>
          </div>
        </div>

        <span
          style={{
            fontSize: '13px',
            fontWeight: '900',
            fontFamily: "'Outfit', sans-serif",
            color: isWarning ? '#dc2626' : isGoalMet ? '#16a34a' : '#2563eb',
            background: '#ffffff',
            padding: '3px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          {todayReferralCount} / {currentDailyQuota}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: '4px 0 10px',
          fontSize: '12px',
          lineHeight: '1.45',
          color: isWarning ? '#7f1d1d' : isGoalMet ? '#166534' : '#1e40af',
          fontFamily: "'Noto Serif Bengali', serif"
        }}
      >
        {isWarning
          ? `পূর্ববর্তী দিনে সক্রিয় না থাকায় আজ আপনার কোটা বৃদ্ধি পেয়ে ${currentDailyQuota} টি হয়েছে। অ্যাকাউন্ট সচল ও উইথড্র চালু রাখতে আজকের কোটা পূরণ করুন।`
          : isGoalMet
          ? 'অভিনন্দন! আপনার অ্যাকাউন্ট আজ সম্পূর্ণ নিরাপদ ও সক্রিয় রয়েছে। উইথড্র সুবিধা চালু আছে।'
          : 'অ্যাকাউন্ট স্থায়ীভাবে সক্রিয় রাখতে প্রতিদিন অন্তত ১ জন বন্ধুকে সফলভাবে যুক্ত করুন।'}
      </p>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(0, 0, 0, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: isWarning
              ? 'linear-gradient(90deg, #f87171, #ef4444)'
              : isGoalMet
              ? 'linear-gradient(90deg, #4ade80, #16a34a)'
              : 'linear-gradient(90deg, #60a5fa, #2563eb)',
            borderRadius: '999px',
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      {/* Call to action button */}
      {!isGoalMet && (
        <button
          onClick={() => navigateTo('invite')}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '12px',
            border: 'none',
            background: isWarning
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: isWarning
              ? '0 4px 12px rgba(239, 68, 68, 0.28)'
              : '0 4px 12px rgba(37, 99, 235, 0.28)',
            transition: 'transform 0.15s ease',
            fontFamily: "'Noto Serif Bengali', serif"
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span>রেফার করে কোটা পূরণ করুন</span>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

