import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Link2, 
  Send, 
  Users, 
  User, 
  Star, 
  ChevronRight 
} from 'lucide-react';
import { getActiveTelegramUserId } from '../utils/telegram';
import inviteHeroBanner from '../assets/invite-hero-banner.png';
import inviteBottomBanner from '../assets/invite-bottom-banner.png';
import inviteTeamArt from '../assets/invite-team-art.png';
import inviteGiftArt from '../assets/invite-gift-art.png';

export const InviteScreen = () => {
  const { userId, userTelegramId, balance = 0, referralCount = 0, referralBonus = 0, navigateTo, notifySuccess, addNotification, isQuotaLocked } = useApp();
  const [copied, setCopied] = useState(false);

  const displayBonus = referralBonus || (referralCount * 50);

  // Guarantee Referral Code is always the pure numeric Telegram User ID
  const activeTgId = getActiveTelegramUserId() || userTelegramId || (userId?.startsWith('tg_') ? userId.replace('tg_', '') : '');
  const referralCode = activeTgId || '7639899614';
  const referralLink = `https://t.me/BengaliPay_bot/App?startapp=${referralCode}`;
  const shareMessage = `🔥 Bengali Pay তে বন্ধুদের আমন্ত্রণ জানিয়ে প্রতি রেফারে ৫০৳ বোনাস আয় করুন! বিকাশ ও নগদে সরাসরি উত্তোলনের সুযোগ। জয়েন করতে ক্লিক করুন: ৳`;

  // Copy referral link
  const handleCopyLink = () => {
    sounds.playClick();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    notifySuccess('লিঙ্ক কপি হয়েছে!', 'রেফারেল লিঙ্ক কপি করা হয়েছে। বন্ধুদের পাঠিয়ে বোনাস জিতুন!');
  };

  // Share directly to Telegram
  const handleTelegramShare = () => {
    sounds.playWin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (typeof addNotification === 'function') {
      addNotification({
        category: 'offers',
        type: 'offer',
        title: 'বন্ধুদের ইনভাইট করুন!',
        message: 'প্রতিটি সফল রেফারে ৫০ ৳ ক্যাশ বোনাস জিতে নিন।'
      });
    }

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`;
    
    const tg = window.Telegram?.WebApp;
    if (tg && typeof tg.openTelegramLink === 'function') {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div style={{
      padding: '12px 14px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: '#f8fafc',
      minHeight: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 1. Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2px 0 4px'
      }}>
        {/* Back Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigateTo(isQuotaLocked?.() ? 'account-status' : 'home')}
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeft size={18} color="#1e293b" />
          </button>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Invite Friends
          </h2>
        </div>

        {/* Cash Balance Pill Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #86efac',
          borderRadius: '24px',
          padding: '4px 12px 4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)'
        }}>
          {/* Green circular coin badge with ৳ */}
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: '1.5px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '900',
            boxShadow: '0 2px 5px rgba(22, 163, 74, 0.3)'
          }}>
            ৳
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '800',
            color: '#166534',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {Number(balance || 0).toFixed(2)} <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: "'Noto Serif Bengali', serif" }}>৳</span>
          </span>
        </div>
      </div>

      {/* 2. Top Hero Banner Card (1600x1000 Ratio) */}
      <div style={{
        width: '100%',
        aspectRatio: '1600 / 1000',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(22, 163, 74, 0.1)',
        border: '1.5px solid #dcfce7',
        background: '#ffffff',
        position: 'relative'
      }}>
        <img 
          src={inviteHeroBanner} 
          alt="Invite Friends Banner" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }} 
        />
      </div>



      {/* 4. 2 Stats Cards (Grid 1fr 1fr) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        {/* Left: মোট রেফারেল */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          border: '1.5px solid #dcfce7',
          borderRadius: '18px',
          padding: '14px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '94px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* User Group Icon Circle */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}>
            <Users size={16} />
          </div>

          <div>
            <span style={{
              fontSize: '11px',
              color: '#64748b',
              fontWeight: '700',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              মোট রেফারেল
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
              marginTop: '2px'
            }}>
              <span style={{
                fontSize: '22px',
                fontWeight: '900',
                color: '#0f172a',
                fontFamily: "'Outfit', sans-serif"
              }}>
                {referralCount}
              </span>
              <span style={{
                fontSize: '11px',
                color: '#64748b',
                fontWeight: '700',
                fontFamily: "'Noto Serif Bengali', serif"
              }}>
                জন বন্ধু
              </span>
            </div>
          </div>

          {/* Right Team Illustration */}
          <img 
            src={inviteTeamArt} 
            alt="Friends Illustration" 
            style={{
              position: 'absolute',
              right: '4px',
              bottom: '4px',
              width: '54px',
              height: 'auto',
              pointerEvents: 'none'
            }} 
          />
        </div>

        {/* Right: পাওয়া বোনাস */}
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #ffffff 100%)',
          border: '1.5px solid #fef08a',
          borderRadius: '18px',
          padding: '14px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '94px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Gold Coin Icon Circle */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#fef3c7',
            border: '1.5px solid #fde047',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b45309',
            fontSize: '14px',
            fontWeight: '900'
          }}>
            ৳
          </div>

          <div>
            <span style={{
              fontSize: '11px',
              color: '#64748b',
              fontWeight: '700',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              পাওয়া বোনাস
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
              marginTop: '2px'
            }}>
              <span style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#16a34a',
                fontFamily: "'Outfit', sans-serif"
              }}>
                + {displayBonus}
              </span>
              <span style={{
                fontSize: '15px',
                color: '#16a34a',
                fontWeight: '800',
                fontFamily: "'Noto Serif Bengali', serif"
              }}>
                ৳
              </span>
            </div>
          </div>

          {/* Right Gift Illustration */}
          <img 
            src={inviteGiftArt} 
            alt="Gift Illustration" 
            style={{
              position: 'absolute',
              right: '4px',
              bottom: '4px',
              width: '52px',
              height: 'auto',
              pointerEvents: 'none'
            }} 
          />
        </div>
      </div>

      {/* 5. Share Card (আপনার রেফারেল লিংক শেয়ার করুন) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '14px',
        border: '1.5px solid #e0f2fe',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}>
            <Link2 size={14} />
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Noto Serif Bengali', serif"
          }}>
            আপনার রেফারেল লিংক শেয়ার করুন
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            flex: 1,
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '9px 12px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#475569',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: "'Outfit', monospace"
          }}>
            {referralLink}
          </div>

          <button
            onClick={handleCopyLink}
            style={{
              background: copied ? '#15803d' : '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '9px 14px',
              fontSize: '12px',
              fontWeight: '800',
              fontFamily: "'Noto Serif Bengali', serif",
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
          </button>
        </div>

        {/* Big Vibrant Green Telegram Share Button */}
        <button
          onClick={handleTelegramShare}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '11px 16px',
            fontSize: '14px',
            fontWeight: '800',
            fontFamily: "'Noto Serif Bengali', serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            transition: 'all 0.2s ease',
            marginTop: '2px'
          }}
        >
          <Send size={16} fill="#ffffff" />
          <span>টেলিগ্রামে বন্ধুদের পাঠান</span>
        </button>
      </div>

      {/* 6. Referral Milestone Rewards Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '14px',
        border: '1.5px solid #e0f2fe',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🏆</span>
          <span style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Noto Serif Bengali', serif"
          }}>
            রেফারেল মিলস্টোন রিওয়ার্ড
          </span>
        </div>

        {/* 3 Step Tiers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px'
        }}>
          {/* Tier 1: 5 Friends */}
          <div style={{
            flex: 1,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '8px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <User size={13} />
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#166534', fontFamily: "'Noto Serif Bengali', serif" }}>
                5 জন বন্ধু
              </div>
              <div style={{ fontSize: '11px', fontWeight: '900', color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
                +20 <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: "'Noto Serif Bengali', serif" }}>৳</span>
              </div>
            </div>
          </div>

          <ChevronRight size={14} color="#94a3b8" />

          {/* Tier 2: 10 Friends */}
          <div style={{
            flex: 1,
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '14px',
            padding: '8px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Users size={13} />
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#075985', fontFamily: "'Noto Serif Bengali', serif" }}>
                10 জন বন্ধু
              </div>
              <div style={{ fontSize: '11px', fontWeight: '900', color: '#0284c7', fontFamily: "'Outfit', sans-serif" }}>
                +50 <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: "'Noto Serif Bengali', serif" }}>৳</span>
              </div>
            </div>
          </div>

          <ChevronRight size={14} color="#94a3b8" />

          {/* Tier 3: 20 Friends */}
          <div style={{
            flex: 1,
            background: '#fefce8',
            border: '1px solid #fef08a',
            borderRadius: '14px',
            padding: '8px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Star size={13} fill="#ffffff" />
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#854d0e', fontFamily: "'Noto Serif Bengali', serif" }}>
                20 জন বন্ধু
              </div>
              <div style={{ fontSize: '11px', fontWeight: '900', color: '#ca8a04', fontFamily: "'Outfit', sans-serif" }}>
                +100 <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: "'Noto Serif Bengali', serif" }}>৳</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom Mini Banner Card */}
      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1.5px solid #dcfce7',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        background: '#ffffff'
      }}>
        <img 
          src={inviteBottomBanner} 
          alt="বেশি বন্ধু আনুন, বেশি আয় করুন" 
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }} 
        />
      </div>
    </div>
  );
};
