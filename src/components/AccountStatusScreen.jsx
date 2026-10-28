import React from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Wallet, 
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export const AccountStatusScreen = () => {
  const { referralQuota, navigateTo } = useApp();

  const {
    currentDailyQuota = 1,
    todayReferralCount = 0,
    missedDaysCount = 0,
    accountStatus = 'ACTIVE',
    canWithdraw = true
  } = referralQuota || {};

  const isWarning = accountStatus === 'WARNING' && todayReferralCount < currentDailyQuota;
  const isGoalMet = todayReferralCount >= currentDailyQuota;
  const progressPercent = Math.min(100, Math.round((todayReferralCount / Math.max(1, currentDailyQuota)) * 100));

  const handleBack = () => {
    sounds.playClick();
    navigateTo('profile');
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        padding: '12px 16px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#f8fafc',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          paddingTop: '2px'
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          <ArrowLeft size={18} color="#0f172a" />
        </button>

        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '900',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          Account Status
        </h2>

        <div style={{ width: '38px' }} />
      </div>

      {/* Unified Master Account Status & Quota Card (Mobile-First, Zero Squeeze) */}
      <div
        style={{
          flexShrink: 0,
          background: '#ffffff',
          borderRadius: '24px',
          padding: '18px 16px',
          border: isWarning
            ? '1.5px solid #fecaca'
            : isGoalMet
            ? '1.5px solid #bbf7d0'
            : '1.5px solid #e2e8f0',
          boxShadow: isWarning
            ? '0 6px 20px rgba(239, 68, 68, 0.08)'
            : isGoalMet
            ? '0 6px 20px rgba(22, 163, 74, 0.08)'
            : '0 4px 18px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Card Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: isWarning
                  ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                  : isGoalMet
                  ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                  : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: isWarning ? '#dc2626' : isGoalMet ? '#16a34a' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: isWarning
                  ? '0 3px 10px rgba(239, 68, 68, 0.15)'
                  : isGoalMet
                  ? '0 3px 10px rgba(22, 163, 74, 0.15)'
                  : '0 3px 10px rgba(37, 99, 235, 0.15)'
              }}
            >
              {isWarning ? (
                <AlertTriangle size={22} />
              ) : isGoalMet ? (
                <ShieldCheck size={24} />
              ) : (
                <Users size={22} />
              )}
            </div>

            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  color: isWarning ? '#dc2626' : isGoalMet ? '#16a34a' : '#2563eb'
                }}
              >
                {isWarning
                  ? 'পেনাল্টি সতর্কতা'
                  : isGoalMet
                  ? 'ভেরিফাইড ও সক্রিয়'
                  : 'দৈনিক অ্যাকাউন্ট কোটা'}
              </span>
              <h3
                style={{
                  margin: '1px 0 0',
                  fontSize: '16px',
                  fontWeight: '900',
                  color: isWarning ? '#991b1b' : '#0f172a',
                  fontFamily: "'Noto Serif Bengali', serif"
                }}
              >
                {isWarning
                  ? `আজ ${currentDailyQuota} জন রেফার আবশ্যক!`
                  : isGoalMet
                  ? 'আজকের কোটা সফলভাবে সম্পন্ন!'
                  : 'প্রতিদিন ১টি সক্রিয় রেফার আবশ্যক'}
              </h3>
            </div>
          </div>

          {/* Quota Numbers Badge */}
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              background: isWarning ? '#fee2e2' : isGoalMet ? '#dcfce7' : '#eff6ff',
              color: isWarning ? '#b91c1c' : isGoalMet ? '#15803d' : '#1d4ed8',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: '900',
              flexShrink: 0
            }}
          >
            {todayReferralCount} / {currentDailyQuota}
          </div>
        </div>

        {/* Informative Subtext */}
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            lineHeight: '1.5',
            color: '#64748b',
            fontFamily: "'Noto Serif Bengali', serif"
          }}
        >
          {isWarning
            ? `পূর্ববর্তী দিনে সক্রিয় না থাকায় আজ আপনার কোটা বৃদ্ধি পেয়ে ${currentDailyQuota} টি হয়েছে। অ্যাকাউন্ট সচল ও উইথড্র সুবিধা বহাল রাখতে আজকের কোটা পূরণ করুন।`
            : isGoalMet
            ? 'অভিনন্দন! আপনার অ্যাকাউন্ট আজ সম্পূর্ণ সচল ও নিরাপদ রয়েছে। আপনার উইথড্র সুবিধা পুরোপুরি চালু আছে।'
            : 'অ্যাকাউন্ট স্থায়ীভাবে সক্রিয় রাখতে প্রতিদিন অন্তত ১ জন বন্ধুকে আপনার রেফারেল লিংকের মাধ্যমে সফলভাবে যুক্ত করুন।'}
        </p>

        {/* Progress Bar & Label */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: '700',
              color: '#64748b',
              marginBottom: '6px',
              fontFamily: "'Noto Serif Bengali', serif"
            }}
          >
            <span>দৈনিক অগ্রগতি</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '800' }}>
              {progressPercent}% সম্পন্ন
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#f1f5f9',
              borderRadius: '999px',
              overflow: 'hidden'
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
        </div>

        {/* Quick Action Button (If Goal is not met) */}
        {!isGoalMet && (
          <button
            onClick={() => {
              sounds.playClick();
              navigateTo('invite');
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '14px',
              border: 'none',
              background: isWarning
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: isWarning
                ? '0 4px 14px rgba(239, 68, 68, 0.25)'
                : '0 4px 14px rgba(22, 163, 74, 0.25)',
              fontFamily: "'Noto Serif Bengali', serif",
              marginTop: '2px'
            }}
          >
            <span>রেফার করে কোটা পূরণ করুন</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* 4-Item Quick Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          flexShrink: 0
        }}
      >
        {/* 1. Daily Target */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '12px 14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Users size={15} color="#2563eb" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', fontFamily: "'Noto Serif Bengali', serif" }}>
              আজকের কোটা
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            {currentDailyQuota} জন
          </div>
        </div>

        {/* 2. Today's Done */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '12px 14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <CheckCircle2 size={15} color="#16a34a" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', fontFamily: "'Noto Serif Bengali', serif" }}>
              আজকের সম্পন্ন
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: '900', color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
            {todayReferralCount} জন
          </div>
        </div>

        {/* 3. Missed Days */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '12px 14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Calendar size={15} color="#f59e0b" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', fontFamily: "'Noto Serif Bengali', serif" }}>
              মিস হওয়া দিন
            </span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: '900', color: missedDaysCount > 0 ? '#ef4444' : '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            {missedDaysCount} দিন
          </div>
        </div>

        {/* 4. Withdrawal Status */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '12px 14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Wallet size={15} color={canWithdraw ? '#16a34a' : '#ef4444'} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', fontFamily: "'Noto Serif Bengali', serif" }}>
              উইথড্র সুবিধা
            </span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: '900', color: canWithdraw ? '#16a34a' : '#ef4444', fontFamily: "'Outfit', sans-serif" }}>
            {canWithdraw ? 'সচল (Eligible)' : 'স্থগিত (Locked)'}
          </div>
        </div>
      </div>

      {/* Rules & Policy Explainer Card */}
      <div
        style={{
          flexShrink: 0,
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px 16px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Info size={17} color="#2563eb" />
          <h4
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '800',
              color: '#0f172a',
              fontFamily: "'Noto Serif Bengali', serif"
            }}
          >
            অ্যাকাউন্ট সচল রাখার নিয়মাবলী
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#334155', fontFamily: "'Noto Serif Bengali', serif" }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontWeight: '900', color: '#2563eb', flexShrink: 0 }}>১.</span>
            <span>
              <strong>প্রতিদিন ১টি রেফার:</strong> অ্যাকাউন্ট সার্বক্ষণিক অ্যাক্টিভ ও সুরক্ষিত রাখতে প্রতিদিন অন্তত ১ জন বন্ধুকে রেফার করতে হবে।
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontWeight: '900', color: '#f59e0b', flexShrink: 0 }}>২.</span>
            <span>
              <strong>মিস করলে কোটা বৃদ্ধি:</strong> কোনো দিন রেফার না করলে বা অফলাইনে থাকলে পরবর্তী দিন কোটা বৃদ্ধি পাবে (যেমন: ১ দিন মিস হলে কোটা হবে ২টি, ২ দিন মিস হলে ৩টি)।
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontWeight: '900', color: '#16a34a', flexShrink: 0 }}>৩.</span>
            <span>
              <strong>কোটা পূরণে রিকভারি:</strong> বর্ধিত কোটা পূরণ করা মাত্র অ্যাকাউন্ট সাথে সাথে Active হবে এবং পূর্ববর্তী সব পেনাল্টি মাফ হয়ে উইথড্র চালু হবে।
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
