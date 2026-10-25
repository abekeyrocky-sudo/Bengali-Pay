import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
    { id: 'tasks', label: 'My Tasks', iconName: 'event_note', action: () => navigateTo('tasks') },
    { id: 'history', label: 'Withdraw History', iconName: 'paid', action: () => setActiveModal('history') },
    { id: 'invite', label: 'Invite Friends', iconName: 'group', action: () => navigateTo('invite') },
    { id: 'help', label: 'Help & Support', iconName: 'help', action: () => setActiveModal('help') },
    { id: 'settings', label: 'Settings', iconName: 'settings', action: () => setActiveModal('settings') }
  ];

  return (
    <div style={{
      padding: '16px 18px',
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
        {userUsername && (
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#16a34a',
            fontFamily: "'Outfit', sans-serif",
            marginTop: '2px'
          }}>
            @{userUsername}
          </span>
        )}
        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#64748b',
          fontFamily: "'Outfit', monospace",
          marginTop: '4px'
        }}>
          ID: {userTelegramId ? `TG-${userTelegramId}` : userId}
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
                className="material-symbols-rounded" 
                style={{ 
                  fontSize: '24px', 
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  flexShrink: 0
                }}
              >
                {item.iconName}
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

      {/* Bottom Cheerful Banner: "ভালো কিছু সবার জন্য আসছে... ❤️" */}
      <div style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        borderRadius: '20px',
        padding: '14px 18px',
        border: '1.5px solid #fecdd3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #fda4af',
          flexShrink: 0
        }}>
          <img 
            src="/assets/mascot_boy.jpg" 
            alt="Cartoon Boy" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>

        <div style={{ flex: 1, paddingLeft: '12px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '800',
            color: '#be123c',
            fontFamily: "'Noto Serif Bengali', serif"
          }}>
            ভালো কিছু সবার জন্য আসছে... ❤️
          </h4>
          <p style={{
            fontSize: '11px',
            color: '#e11d48',
            marginTop: '2px'
          }}>
            নতুন মেগা টুর্নামেন্ট ও উইকলি জ্যাকপট শীঘ্রই!
          </p>
        </div>
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
                <p style={{ fontSize: '13px', color: '#64748b', padding: '20px 0' }}>
                  এখনো কোনো উইথড্র করা হয়নি।
                </p>
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
