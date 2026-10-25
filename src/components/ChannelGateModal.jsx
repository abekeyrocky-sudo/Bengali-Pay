import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { checkChannelMembershipAPI, saveUserToFirestore } from '../firebase';
import { 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw,
  Megaphone
} from 'lucide-react';
import warnPopupImage from '../assets/warn-popup-image.png';
import mikeIcon from '../assets/mike-icon.png';

export const ChannelGateModal = () => {
  const { userId, userTelegramId, currentScreen } = useApp();

  const [isJoined, setIsJoined] = useState(() => {
    return localStorage.getItem('bp_channel_verified') === 'true';
  });

  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasClickedJoin, setHasClickedJoin] = useState(false);

  const CHANNEL_URL = 'https://t.me/BengaliPay';
  const CHANNEL_HANDLE = '@BengaliPay';

  // Effective Telegram User ID
  const effectiveTgId = userTelegramId || (userId?.startsWith('tg_') ? userId.replace('tg_', '') : '');

  // Perform membership verification
  const verifyMembership = useCallback(async (isSilent = false) => {
    if (localStorage.getItem('bp_channel_verified') === 'true') {
      setIsJoined(true);
      return true;
    }

    if (!isSilent) {
      setIsChecking(true);
      setErrorMsg('');
    }

    try {
      const res = await checkChannelMembershipAPI(effectiveTgId);

      if (res && res.isMember) {
        sounds.playWin();
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.5 }
        });

        setIsJoined(true);
        localStorage.setItem('bp_channel_verified', 'true');
        saveUserToFirestore(userId, { channelJoined: true });
        return true;
      } else {
        if (!isSilent) {
          sounds.playError?.();
          setErrorMsg('⚠️ আপনি এখনো @BengaliPay চ্যানেলে জয়েন করেননি! অনুগ্রহ করে আগে জয়েন করুন, তারপর যাচাই করুন।');
        }
        return false;
      }
    } catch (err) {
      if (!isSilent) {
        setErrorMsg('যাচাই করার সময় নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
      return false;
    } finally {
      if (!isSilent) {
        setIsChecking(false);
      }
    }
  }, [effectiveTgId, userId]);

  // Initial check on mount
  useEffect(() => {
    if (localStorage.getItem('bp_channel_verified') === 'true') {
      setIsJoined(true);
      return;
    }

    if (effectiveTgId) {
      verifyMembership(true);
    }
  }, [effectiveTgId, verifyMembership]);

  // Auto-verify when user returns to app after visiting Telegram
  useEffect(() => {
    if (isJoined) return;

    const handleWindowFocus = () => {
      if (hasClickedJoin) {
        verifyMembership(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasClickedJoin) {
        verifyMembership(true);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasClickedJoin, isJoined, verifyMembership]);

  // Open Telegram Channel
  const handleOpenChannel = () => {
    sounds.playClick();
    setHasClickedJoin(true);
    setErrorMsg('');

    const tg = window.Telegram?.WebApp;
    if (tg && typeof tg.openTelegramLink === 'function') {
      tg.openTelegramLink(CHANNEL_URL);
    } else {
      window.open(CHANNEL_URL, '_blank');
    }
  };

  // Do not show on splash screen or if already verified
  if (currentScreen === 'splash' || isJoined) {
    return null;
  }

  return (
    <div 
      id="channel-gate-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Modal Card Matching Exact Mockup Design */}
      <div 
        style={{
          width: '100%',
          maxWidth: '350px',
          background: '#ffffff',
          borderRadius: '32px',
          padding: '28px 20px 24px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top 3D Warning Illustration */}
        <div style={{
          position: 'relative',
          width: '135px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px'
        }}>
          <img 
            src={warnPopupImage} 
            alt="Warning Sign" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </div>

        {/* Title: বাঙালি পে BD */}
        <h2 style={{
          fontSize: '26px',
          fontWeight: '900',
          color: '#0f172a',
          margin: '4px 0 16px 0',
          fontFamily: "'Outfit', 'Noto Serif Bengali', sans-serif",
          letterSpacing: '-0.3px'
        }}>
          বাঙালি পে BD
        </h2>

        {/* Notice Info Box */}
        <div style={{
          width: '100%',
          background: '#eff6ff',
          borderRadius: '18px',
          padding: '12px 14px',
          border: '1px solid #bfdbfe',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxSizing: 'border-box'
        }}>
          {/* Left Loudspeaker Icon from mike-icon.png */}
          <div style={{
            width: '38px',
            height: '38px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={mikeIcon} 
              alt="Megaphone" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </div>

          {/* Thin Vertical Divider */}
          <div style={{
            width: '1px',
            height: '32px',
            background: '#cbd5e1',
            flexShrink: 0
          }} />

          {/* Right Text */}
          <p style={{
            fontSize: '12.5px',
            color: '#1e293b',
            lineHeight: '1.45',
            fontWeight: '600',
            textAlign: 'left',
            margin: 0,
            fontFamily: "'Outfit', 'Noto Serif Bengali', sans-serif"
          }}>
            আপডেট ও গুরুত্বপূর্ণ ঘোষণার জন্য আমাদের <span style={{ color: '#0284c7', fontWeight: '800' }}>টেলিগ্রাম চ্যানেলটি</span> জয়েন করুন।
          </p>
        </div>

        {/* Error Alert Message (if user checks without joining) */}
        {errorMsg && (
          <div style={{
            width: '100%',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '14px',
            padding: '9px 12px',
            color: '#dc2626',
            fontSize: '11.5px',
            fontWeight: '700',
            lineHeight: '1.4',
            marginBottom: '12px',
            boxSizing: 'border-box',
            animation: 'shake 0.3s ease-in-out'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Action Buttons Section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Primary Action Button: চ্যানেল জয়েন করুন */}
          <button
            onClick={handleOpenChannel}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0088cc 0%, #0077b5 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '800',
              fontFamily: "'Outfit', 'Noto Serif Bengali', sans-serif",
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              boxShadow: '0 8px 20px rgba(0, 136, 204, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            {/* Left Send Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Send size={18} />
              <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.4)' }} />
            </div>

            {/* Center Text */}
            <span style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
              চ্যানেল জয়েন করুন
            </span>

            {/* Right External Link Icon */}
            <ExternalLink size={17} />
          </button>

          {/* Verification Button (Replaces "পরে দেখবো" - No Skip Allowed) */}
          <button
            onClick={() => verifyMembership(false)}
            disabled={isChecking}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '18px',
              background: isChecking 
                ? '#94a3b8' 
                : (hasClickedJoin 
                  ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' 
                  : '#f1f5f9'),
              color: isChecking 
                ? '#ffffff' 
                : (hasClickedJoin ? '#ffffff' : '#475569'),
              border: hasClickedJoin ? 'none' : '1.5px solid #e2e8f0',
              fontSize: '13.5px',
              fontWeight: '800',
              fontFamily: "'Outfit', 'Noto Serif Bengali', sans-serif",
              cursor: isChecking ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: hasClickedJoin && !isChecking ? '0 4px 14px rgba(22, 163, 74, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {isChecking ? (
              <>
                <RefreshCw size={15} className="spin-animation" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} color={hasClickedJoin ? '#ffffff' : '#16a34a'} />
                <span>জয়েন করেছি, আনলক করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
