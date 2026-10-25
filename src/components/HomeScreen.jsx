import React from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { 
  Bell, 
  Tv, 
  CalendarCheck, 
  Gamepad2, 
  UserPlus, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import secondImgBanner from '../assets/2nd-img-banner.jpg';
import homeBanner3rd from '../assets/home-banner-3rd.jpg';
import balanceCardBg from '../assets/balance-card-bg.png';

export const HomeScreen = () => {
  const { 
    balance, 
    tokens, 
    userName,
    userFirstName,
    userPhoto,
    navigateTo, 
    earnReward,
    dailyClaimed,
    setDailyClaimed,
    notifySuccess,
    notifyWarn,
    unreadNotificationsCount = 0
  } = useApp();

  const handleDailyCheckin = () => {
    if (!dailyClaimed) {
      setDailyClaimed(true);
      earnReward(5, 5, 'Daily Check-in Bonus');
      notifySuccess('দৈনিক বোনাস সফল!', '+৫ ৳ ও +৫টি টোকেন আপনার একাউন্টে যোগ হয়েছে!');
    } else {
      notifyWarn('ইতিমধ্যে ক্লেইম করেছেন!', 'আজকের ডেইলি বোনাস আপনি ইতিমধ্যে নিয়ে নিয়েছেন। আগামীকাল আবার চেষ্টা করুন!');
    }
  };

  return (
    <div style={{
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: '#f8fafc',
      minHeight: '100%'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '6px'
      }}>
        {/* User Info */}
        <div 
          onClick={() => navigateTo('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            position: 'relative',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #22c55e',
            boxShadow: '0 4px 10px rgba(34, 197, 94, 0.25)',
            background: '#ffffff'
          }}>
            <img 
              src={userPhoto || "/assets/mascot_boy.jpg"} 
              alt={userName || "User Avatar"} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/mascot_boy.jpg";
              }}
            />
          </div>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#0f172a',
                fontFamily: "'Outfit', sans-serif"
              }}>
                Hi, {userFirstName || userName || 'Rocky'}
              </h2>
              <span style={{ fontSize: '14px' }}>👋</span>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Welcome Back!
            </p>
          </div>
        </div>

        {/* Notification Bell */}
        <button 
          id="btn-home-notifications"
          onClick={() => {
            sounds.playClick();
            navigateTo('notifications');
          }}
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e293b',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.15s ease'
          }}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadNotificationsCount > 0 && (
            <span 
              className="bell-notification-dot"
              style={{
                position: 'absolute',
                top: '5px',
                right: '6px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                display: 'block'
              }}
              title={`${unreadNotificationsCount} unread notification${unreadNotificationsCount > 1 ? 's' : ''}`}
            />
          )}
        </button>
      </div>

      {/* Balance Card (Using balance-card-bg.png from assets) */}
      <div 
        onClick={() => navigateTo('withdraw')}
        style={{
          backgroundImage: `url(${balanceCardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '22px',
          padding: '20px 22px',
          color: '#ffffff',
          boxShadow: '0 8px 24px -2px rgba(22, 163, 74, 0.32)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '106px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side: Currency & Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '28px',
              fontWeight: '800',
              fontFamily: "'Noto Serif Bengali', serif",
              color: '#facc15',
              textShadow: '0 2px 4px rgba(0,0,0,0.25)'
            }}>
              ৳
            </span>
            <span style={{
              fontSize: '36px',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              fontFamily: "'Outfit', sans-serif",
              lineHeight: '1.1',
              textShadow: '0 2px 6px rgba(0,0,0,0.25)'
            }}>
              {balance.toFixed(2)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '6px'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#dcfce7',
              letterSpacing: '0.2px',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              Your Balance
            </span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              উইথড্র &gt;
            </span>
          </div>
        </div>

        {/* Space on right side to clearly reveal the BD flag 3D splash embedded in balance-card-bg.png */}
        <div style={{ width: '80px', height: '60px', flexShrink: 0 }} />
      </div>

      {/* Promo Banner: "আজকে কাজ করুন আর বেশি টোকেন জিতুন!" (2nd-img-banner.png) */}
      <div 
        onClick={() => navigateTo('tasks')}
        style={{
          cursor: 'pointer',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(234, 179, 8, 0.16)',
          lineHeight: 0,
          transition: 'transform 0.15s ease'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src={secondImgBanner} 
          alt="আজকে কাজ করুন আর বেশি টোকেন জিতুন!" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            objectFit: 'cover'
          }} 
        />
      </div>

      {/* 4 Action Icons Grid (Watch Ads, Daily Task, Games, Invite Friends) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px'
      }}>
        {/* 1. Watch Ads */}
        <button
          onClick={() => navigateTo('tasks')}
          style={{
            background: '#ffffff',
            border: '1px solid #fee2e2',
            borderRadius: '18px',
            padding: '14px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <Tv size={24} />
          </div>
        </button>

        {/* 2. Daily Task */}
        <button
          onClick={() => navigateTo('tasks')}
          style={{
            background: '#ffffff',
            border: '1px solid #dcfce7',
            borderRadius: '18px',
            padding: '14px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}>
            <CalendarCheck size={24} />
          </div>
        </button>

        {/* 3. Games */}
        <button
          onClick={() => navigateTo('game')}
          style={{
            background: '#ffffff',
            border: '1px solid #ede9fe',
            borderRadius: '18px',
            padding: '14px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <Gamepad2 size={24} />
          </div>
        </button>

        {/* 4. Invite Friends */}
        <button
          onClick={() => navigateTo('invite')}
          style={{
            background: '#ffffff',
            border: '1px solid #e0f2fe',
            borderRadius: '18px',
            padding: '14px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
          }}>
            <UserPlus size={24} />
          </div>
        </button>
      </div>

      {/* Today's Reward Progress Card (Pixel-Perfect Mockup Match) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '14px 18px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Left Side: Title + Progress Row */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '13px',
            fontWeight: '800',
            color: '#1e293b',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '8px',
            lineHeight: '1'
          }}>
            Today's Reward
          </h4>

          {/* Progress Row: [Small Coin Icon] [=== Progress Bar ===] [2/10] */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Small Gold Coin Icon on Left */}
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 70%, #ca8a04 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '11px',
              fontFamily: "'Noto Serif Bengali', serif",
              boxShadow: '0 2px 4px rgba(234, 179, 8, 0.3)',
              flexShrink: 0
            }}>
              ৳
            </div>

            {/* Progress Bar */}
            <div style={{
              flex: 1,
              height: '7px',
              background: '#e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '20%',
                height: '100%',
                background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                borderRadius: '10px'
              }} />
            </div>

            {/* Counter: 2/10 */}
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#64748b',
              fontFamily: "'Outfit', sans-serif",
              flexShrink: 0
            }}>
              2/10
            </span>
          </div>
        </div>

        {/* Right Side: Bengali Pay 3D Coin Badge (Green Ring + Gold ৳ Coin) */}
        <div style={{
          width: '44px',
          height: '44px',
          flexShrink: 0,
          filter: 'drop-shadow(0 4px 10px rgba(22, 163, 74, 0.28))'
        }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id="rewardGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <radialGradient id="rewardGoldCoin" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="45%" stopColor="#facc15" />
                <stop offset="85%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </radialGradient>
            </defs>
            {/* Outer Green Ring */}
            <circle cx="50" cy="50" r="48" fill="url(#rewardGreenGrad)" stroke="#fde047" strokeWidth="3" />
            {/* Inner Gold Coin */}
            <circle cx="50" cy="50" r="35" fill="url(#rewardGoldCoin)" stroke="#fef08a" strokeWidth="1.5" />
            {/* ৳ Symbol */}
            <text 
              x="50" 
              y="62" 
              fontSize="34" 
              fontFamily="'Noto Serif Bengali', serif" 
              fontWeight="900" 
              fill="#ffffff" 
              textAnchor="middle"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"
            >
              ৳
            </text>
          </svg>
        </div>
      </div>

      {/* Bottom Village Banner: "বাংলার মাঠের পথে আর টোকেনের আনন্দ!" (home-banner-3rd.png) */}
      <div 
        onClick={() => navigateTo('game')}
        style={{
          cursor: 'pointer',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(22, 163, 74, 0.16)',
          lineHeight: 0,
          transition: 'transform 0.15s ease'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src={homeBanner3rd} 
          alt="বাংলার মাঠের পথে আর টোকেনের আনন্দ!" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            objectFit: 'cover'
          }} 
        />
      </div>
    </div>
  );
};
