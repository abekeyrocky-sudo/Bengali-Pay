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
  HelpCircle, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { ReferralQuotaCard } from './ReferralQuotaCard';

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

  const handleBack = () => {
    sounds.playClick();
    navigateTo('profile');
  };

  return (
    <div
      style={{
        padding: '16px 18px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: '#f8fafc',
        minHeight: '100%'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '4px'
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

      {/* Hero Status Banner */}
      <div
        style={{
          background: isWarning
            ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          borderRadius: '24px',
          padding: '22px 18px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: isWarning
            ? '0 10px 25px rgba(239, 68, 68, 0.35)'
            : '0 10px 25px rgba(22, 163, 74, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1.5px solid rgba(255, 255, 255, 0.35)'
          }}
        >
          {isWarning ? (
            <AlertTriangle size={30} color="#ffffff" />
          ) : (
            <ShieldCheck size={32} color="#ffffff" />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              background: 'rgba(255, 255, 255, 0.25)',
              padding: '2px 8px',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '4px'
            }}
          >
            {isWarning ? 'পেনাল্টি সতর্কবার্তা' : 'অ্যাকাউন্ট সুরক্ষিত'}
          </span>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '900',
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            {isWarning ? 'Warning: Quota Pending' : 'Status: Active & Verified'}
          </h3>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '12px',
              opacity: 0.9,
              fontFamily: "'Noto Serif Bengali', serif"
            }}
          >
            {isWarning
              ? 'অ্যাকাউন্ট ও উইথড্র সচল করতে আজকের কোটা সম্পন্ন করুন'
              : 'আপনার অ্যাকাউন্ট সম্পূর্ণ সক্রিয় ও উইথড্র সুবিধা চালু আছে'}
          </p>
        </div>
      </div>

      {/* The Live Quota Progress Card */}
      <ReferralQuotaCard />

      {/* 4-Item Quick Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}
      >
        {/* 1. Daily Target */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={16} color="#3b82f6" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
              আজকের কোটা
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            {currentDailyQuota} জন
          </div>
        </div>

        {/* 2. Today's Done */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
              আজকের সম্পন্ন
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
            {todayReferralCount} জন
          </div>
        </div>

        {/* 3. Missed Days */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Calendar size={16} color="#f59e0b" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
              মিস হওয়া দিন
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: missedDaysCount > 0 ? '#ef4444' : '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            {missedDaysCount} দিন
          </div>
        </div>

        {/* 4. Withdrawal Status */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Wallet size={16} color={canWithdraw ? '#16a34a' : '#ef4444'} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
              উইথড্র সুবিধা
            </span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: canWithdraw ? '#16a34a' : '#ef4444', fontFamily: "'Outfit', sans-serif" }}>
            {canWithdraw ? 'সচল (Eligible)' : 'স্থগিত (Locked)'}
          </div>
        </div>
      </div>

      {/* Rules & Policy Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '16px 18px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Info size={18} color="#2563eb" />
          <h4
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: '800',
              color: '#0f172a',
              fontFamily: "'Noto Serif Bengali', serif"
            }}
          >
            অ্যাকাউন্ট সচল রাখার নিয়মাবলী
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#334155' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontWeight: '900', color: '#2563eb' }}>১.</span>
            <span>
              <strong>প্রতিদিন ১টি রেফার:</strong> অ্যাকাউন্ট সার্বক্ষণিক অ্যাক্টিভ ও সুরক্ষিত রাখতে প্রতিদিন অন্তত ১ জন বন্ধুকে রেফার করতে হবে।
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontWeight: '900', color: '#f59e0b' }}>২.</span>
            <span>
              <strong>মিস করলে কোটা বৃদ্ধি:</strong> কোনো দিন রেফার না করলে বা অফলাইনে থাকলে পরবর্তী দিন কোটা বৃদ্ধি পাবে (যেমন: ১ দিন মিস হলে কোটা হবে ২টি, ২ দিন মিস হলে ৩টি)।
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontWeight: '900', color: '#16a34a' }}>৩.</span>
            <span>
              <strong>কোটা পূরণে স্বয়ংক্রিয় রিকভারি:</strong> বর্ধিত কোটা পূরণ করা মাত্র অ্যাকাউন্ট সাথে সাথে Active হবে এবং পূর্ববর্তী সব পেনাল্টি মাফ হয়ে উইথড্র চালু হবে।
            </span>
          </div>
        </div>
      </div>

      {/* Invite Friends Shortcut Button */}
      <button
        onClick={() => {
          sounds.playClick();
          navigateTo('invite');
        }}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '16px',
          border: 'none',
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '800',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 6px 18px rgba(22, 163, 74, 0.3)',
          fontFamily: "'Noto Serif Bengali', serif"
        }}
      >
        <span>রেফার করে কোটা পূরণ করুন</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
