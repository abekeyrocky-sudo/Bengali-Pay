import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Gift, 
  Trophy, 
  Sparkles,
  Send,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import cigaretteIcon from '../assets/cigarette-icon.png';

export const InviteScreen = () => {
  const { userId, tokens, navigateTo, notifySuccess } = useApp();
  const [copied, setCopied] = useState(false);

  // Generate Referral Link and Code
  const cleanCode = (userId || 'user123').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  const referralLink = `https://t.me/BengaliPay_bot?start=ref_${cleanCode}`;
  const shareMessage = `🔥 Bengali Pay তে প্রতিদিন কামলা দিয়ে, গেম খেলে আর টাস্ক করে বিকাশ ও নগদে টাকা আয় করুন! আমার ইনভাইট লিঙ্কে জয়েন করলেই পাবেন ফ্রি বোনাস টোকেন! ৳`;

  // Copy referral link to clipboard
  const handleCopyLink = () => {
    sounds.playClick();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopied(true);
    notifySuccess('লিঙ্ক কপি হয়েছে!', 'রেফারেল লিঙ্ক কপি করা হয়েছে। বন্ধুদের পাঠিয়ে বোনাস জিতুন!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Share directly to Telegram
  const handleTelegramShare = () => {
    sounds.playWin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`;
    
    // Check if running in Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg && typeof tg.openTelegramLink === 'function') {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div style={{
      padding: '16px 18px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: '#f8fafc',
      minHeight: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '6px'
      }}>
        {/* Back Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => navigateTo('home')}
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
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <ArrowLeft size={19} color="#334155" />
          </button>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Invite Friends
          </h2>
        </div>

        {/* Token Balance Counter Pill Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #fffdf5 0%, #fef3c7 100%)',
          border: '1.5px solid #fde047',
          borderRadius: '20px',
          padding: '4px 14px 4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 10px rgba(234, 179, 8, 0.16)'
        }}>
          <img 
            src={cigaretteIcon} 
            alt="Token" 
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '900',
              color: '#854d0e',
              fontFamily: "'Outfit', sans-serif",
              lineHeight: '1'
            }}>
              {tokens}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#a16207',
              letterSpacing: '0.2px'
            }}>
              Tokens
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner Card: Vibrant Blue/Sky Gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
        borderRadius: '24px',
        padding: '22px 20px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -4px rgba(2, 132, 199, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Background glow circle */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Top Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(10px)',
          padding: '4px 12px',
          borderRadius: '20px',
          width: 'fit-content',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.3px',
          border: '1px solid rgba(255,255,255,0.25)'
        }}>
          <Sparkles size={13} color="#fde047" />
          <span>রেফারেল প্রোগ্রাম</span>
        </div>

        {/* Big Reward Title */}
        <div>
          <h3 style={{
            fontSize: '22px',
            fontWeight: '900',
            lineHeight: '1.25',
            fontFamily: "'Outfit', sans-serif",
            textShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            প্রতি রেফারে পান <span style={{ color: '#facc15' }}>+১০ ৳ টোকেন!</span>
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#e0f2fe',
            marginTop: '6px',
            lineHeight: '1.4',
            fontWeight: '500'
          }}>
            আপনার বন্ধুদের ইনভাইট করুন। তারা জয়েন করলেই সাথে সাথে আপনার একাউন্টে বোনাস জমা হবে!
          </p>
        </div>
      </div>

      {/* Referral Link & Share Section */}
      <div style={{
        background: '#ffffff',
        borderRadius: '22px',
        padding: '18px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#334155'
          }}>
            আপনার ইনভাইট লিঙ্ক:
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            background: '#f1f5f9',
            color: '#0284c7',
            padding: '3px 8px',
            borderRadius: '8px'
          }}>
            কোড: {cleanCode}
          </span>
        </div>

        {/* Link Box with Copy Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1.5px dashed #cbd5e1',
          borderRadius: '14px',
          padding: '8px 10px',
          gap: '8px'
        }}>
          <div style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            color: '#475569',
            fontFamily: 'monospace',
            fontWeight: '600'
          }}>
            {referralLink}
          </div>

          <button
            onClick={handleCopyLink}
            style={{
              background: copied ? '#22c55e' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
          </button>
        </div>

        {/* Big Telegram Share Button */}
        <button
          onClick={handleTelegramShare}
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(34, 197, 94, 0.35)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Send size={18} />
          <span>টেলিগ্রামে বন্ধুদের পাঠান</span>
        </button>
      </div>

      {/* Referral Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {/* Card 1: Total Friends */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={18} />
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
            মোট আমন্ত্রিত বন্ধু
          </span>
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            ০ জন
          </span>
        </div>

        {/* Card 2: Bonus Earned */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gift size={18} />
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
            অর্জিত বোনাস
          </span>
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
            +০ টোকেন
          </span>
        </div>
      </div>

      {/* Milestone Rewards Section */}
      <div style={{
        background: '#ffffff',
        borderRadius: '22px',
        padding: '18px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} color="#d97706" />
          <h4 style={{
            fontSize: '14px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}>
            ইনভাইট মাইলস্টোন রিওয়ার্ড
          </h4>
        </div>

        {/* Milestone Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Item 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px solid #edf2f7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '12px'
              }}>
                ৩
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>৩ জন বন্ধু</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>ইনভাইট কমপ্লিট করুন</div>
              </div>
            </div>
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              +৩০ ৳ টোকেন
            </span>
          </div>

          {/* Item 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px solid #edf2f7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '12px'
              }}>
                ১০
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>১০ জন বন্ধু</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>স্পেশাল রিওয়ার্ড</div>
              </div>
            </div>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              +১০০ ৳ টোকেন
            </span>
          </div>

          {/* Item 3 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px solid #edf2f7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '12px'
              }}>
                ২৫
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>২৫ জন বন্ধু</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>ভিআইপি বোনাস</div>
              </div>
            </div>
            <span style={{
              background: '#fef3c7',
              color: '#b45309',
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              +৩০০ ৳ টোকেন
            </span>
          </div>
        </div>
      </div>

      {/* How it works info */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
          <HelpCircle size={16} />
          <span style={{ fontSize: '13px', fontWeight: '700' }}>রেফারেল নিয়মাবলী:</span>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
          ১. আপনার রেফারেল লিঙ্ক কপি করে বন্ধুদের শেয়ার করুন।<br />
          ২. বন্ধু লিঙ্কে ক্লিক করে টেলিগ্রাম বটের মাধ্যমে মিনি অ্যাপ ওপেন করলেই টোকেন আপনার অ্যাকাউন্টে জমা হবে।<br />
          ৩. অর্জিত টোকেন দিয়ে সরাসরি বিকাশ ও নগদ অ্যাকাউন্টে উইথড্র রিকোয়েস্ট করতে পারবেন।
        </p>
      </div>
    </div>
  );
};
