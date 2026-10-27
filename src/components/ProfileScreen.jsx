import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { useApp } from '../context/AppContext';
import profilePageImg from '../assets/profile-page-img.jpg';
import { 
  Settings, 
  CheckSquare, 
  History, 
  UserPlus, 
  HelpCircle, 
  Sliders, 
  ChevronRight, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  Heart
} from 'lucide-react';

// Pure solid-fill SVG icons (100% reliable across all phones & browsers)
const FilledTasksIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h7v2H7v-2zm0 4h10v2H7v-2z"/>
  </svg>
);

const FilledPaidIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-1.1c-1.16-.27-2-1.07-2.18-2.31h1.72c.14.53.58.91 1.46.91.86 0 1.35-.45 1.35-1.04 0-.6-.35-.91-1.46-1.19-1.57-.4-2.57-.96-2.57-2.26 0-1.18.94-2.02 2.18-2.28V6h2v1.12c1.07.25 1.76.99 1.93 2.06h-1.68c-.14-.5-.54-.81-1.25-.81-.71 0-1.21.37-1.21.94 0 .52.36.83 1.44 1.1 1.63.4 2.6 1.01 2.6 2.37 0 1.25-.97 2.07-2.22 2.34V16z"/>
  </svg>
);

const FilledGroupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const FilledHelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.66z"/>
  </svg>
);

const FilledSettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

export const ProfileScreen = () => {
  const { 
    userId,
    userTelegramId,
    userName,
    userUsername,
    userPhoto,
    userLevel, 
    userXp, 
    navigateTo, 
    balance, 
    tokens,
    transactions 
  } = useApp();

  const [activeModal, setActiveModal] = useState(null);

  const menuItems = [
    { id: 'tasks', label: 'My Tasks', icon: FilledTasksIcon, action: () => navigateTo('tasks') },
    { id: 'history', label: 'Withdraw History', icon: FilledPaidIcon, action: () => setActiveModal('history') },
    { id: 'invite', label: 'Invite Friends', icon: FilledGroupIcon, action: () => navigateTo('invite') },
    { id: 'help', label: 'Help & Support', icon: FilledHelpIcon, action: () => setActiveModal('help') },
    { id: 'settings', label: 'Settings', icon: FilledSettingsIcon, action: () => setActiveModal('settings') }
  ];

  return (
    <div style={{
      padding: '16px 18px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: '#f8fafc',
      minHeight: '100%'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: '6px'
      }}>
        <button
          onClick={() => setActiveModal('settings')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Settings size={18} color="#475569" />
        </button>
      </div>

      {/* User Info Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid #22c55e',
          boxShadow: '0 8px 20px rgba(34, 197, 94, 0.25)',
          background: '#fff'
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

        <h2 style={{
          fontSize: '20px',
          fontWeight: '900',
          color: '#0f172a',
          marginTop: '10px',
          fontFamily: "'Outfit', sans-serif"
        }}>
          {userName || 'Rocky'}
        </h2>
        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#64748b',
          fontFamily: "'Outfit', monospace",
          marginTop: '4px'
        }}>
          ID: {userTelegramId || userId}
        </span>
      </div>

      {/* Level Progress Bar Card (Pixel-Perfect Mockup Match) */}
      <div style={{
        background: 'linear-gradient(135deg, #e6f9ed 0%, #dcfce7 100%)',
        borderRadius: '20px',
        padding: '14px 18px',
        border: '1px solid #bbf7d0',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        {/* Left Side: Green Level Shield Badge */}
        <div style={{
          width: '38px',
          height: '42px',
          flexShrink: 0,
          filter: 'drop-shadow(0 3px 6px rgba(22, 163, 74, 0.25))'
        }}>
          <svg viewBox="0 0 100 115" width="100%" height="100%">
            <defs>
              <linearGradient id="levelShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            {/* Shield Body */}
            <path 
              d="M 50 6 L 88 20 C 88 64 50 106 50 106 C 50 106 12 64 12 20 Z" 
              fill="url(#levelShieldGrad)" 
              stroke="#86efac" 
              strokeWidth="3.5"
            />
            {/* Inner White ৳ / Currency Emblem */}
            <text 
              x="50" 
              y="68" 
              fontSize="40" 
              fontFamily="'Noto Serif Bengali', serif" 
              fontWeight="900" 
              fill="#ffffff" 
              textAnchor="middle"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
            >
              ৳
            </text>
          </svg>
        </div>

        {/* Right Side: Level Label + Progress Row */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '800',
            color: '#064e3b',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: '6px',
            lineHeight: '1'
          }}>
            Level {userLevel}
          </h4>

          {/* Progress Row: [=== Progress Bar ===] [25 / 50] */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              flex: 1,
              height: '7px',
              background: '#bbf7d0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(userXp / 50) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                borderRadius: '10px'
              }} />
            </div>

            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#047857',
              fontFamily: "'Outfit', sans-serif",
              flexShrink: 0
            }}>
              {userXp} / 50
            </span>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '6px 12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            onClick={item.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 10px',
              borderBottom: index !== menuItems.length - 1 ? '1px solid #f8fafc' : 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span 
                style={{ 
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  flexShrink: 0
                }}
              >
                <item.icon />
              </span>
              <span style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#1e293b',
                fontFamily: "'Outfit', sans-serif"
              }}>
                {item.label}
              </span>
            </div>

            <ChevronRight size={18} color="#94a3b8" />
          </div>
        ))}
      </div>

      {/* Bottom Promo Banner: profile-page-img.jpg */}
      <div 
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          lineHeight: 0,
          marginTop: '10px',
          cursor: 'pointer',
          transition: 'transform 0.15s ease'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src={profilePageImg} 
          alt="Profile Banner" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            objectFit: 'cover'
          }} 
        />
      </div>

      {/* Withdraw History Modal */}
      {activeModal === 'history' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>
              উইথড্র হিস্ট্রি
            </h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {transactions.filter(t => t.title.includes('Withdraw')).length > 0 ? (
                transactions.filter(t => t.title.includes('Withdraw')).map((tx) => (
                  <div key={tx.id} style={{
                    padding: '10px',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px'
                  }}>
                    <span>{tx.title}</span>
                    <span style={{ fontWeight: '800', color: '#16a34a' }}>{tx.amount}</span>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="কোনো হিস্ট্রি নেই"
                  subtitle="এখনো কোনো উইথড্র করা হয়নি।"
                  animationSize={130}
                  style={{ padding: '8px 4px', background: 'transparent' }}
                />
              )}
            </div>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '12px',
                background: '#16a34a',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>
              Bengali Pay হেল্পলাইন
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
              যেকোনো সমস্যায় আমাদের অফিশিয়াল টেলিগ্রাম চ্যানেল ও ফেসবুক গ্রুপে যুক্ত হোন। ২৪/৭ সাপোর্ট টিম প্রস্তুত আছে।
            </p>
            <div style={{
              background: '#f0fdf4',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '13px',
              color: '#15803d',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              ইমেইল: support@bengalipay.com
            </div>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#16a34a',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px' }}>
              অ্যাপ সেটিংস
            </h3>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>সাউন্ড এফেক্টস</span>
                <span style={{ fontWeight: '700', color: '#16a34a' }}>চালু</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ভাষা (Language)</span>
                <span style={{ fontWeight: '700', color: '#16a34a' }}>বাংলা (Bengali)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ভার্সন</span>
                <span style={{ fontWeight: '700', color: '#64748b' }}>v2.4.0 (2026 Edition)</span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                background: '#16a34a',
                border: 'none',
                borderRadius: '14px',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
