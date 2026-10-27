import React, { useState } from 'react';
import { useApp, isLegacyDummyNotification } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { 
  ArrowLeft, 
  Bell, 
  Gift, 
  Megaphone, 
  Star, 
  Clock, 
  ChevronRight, 
  Trash2, 
  CheckCircle2, 
  Users, 
  Volume2,
  Sparkles,
  X
} from 'lucide-react';
import notificationBell from '../assets/notification-bell.png';
import { EmptyState } from './EmptyState';

export const NotificationsScreen = () => {
  const { 
    navigateTo, 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    clearAllNotifications,
    notifySuccess
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'rewards', 'updates', 'offers'
  const [selectedNotif, setSelectedNotif] = useState(null);

  const tabs = [
    { id: 'all', label: 'সকল', icon: Bell },
    { id: 'rewards', label: 'রিওয়ার্ড', icon: Gift },
    { id: 'updates', label: 'আপডেট', icon: Megaphone },
    { id: 'offers', label: 'অফার', icon: Star }
  ];

  // Filter notifications by active tab and exclude legacy dummy items
  const filteredNotifications = notifications
    .filter(n => !isLegacyDummyNotification(n))
    .filter(item => {
      if (activeTab === 'all') return true;
      return item.category === activeTab;
    });

  const handleCardClick = (notif) => {
    sounds.playClick();
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    setSelectedNotif(notif);
  };

  const handleClearAll = () => {
    sounds.playClick();
    clearAllNotifications();
    notifySuccess('নোটিফিকেশন ক্লিয়ার হয়েছে!', 'সবগুলো নোটিফিকেশন সফলভাবে ক্লিয়ার করা হয়েছে।');
  };

  // Helper to render customized category icon
  const renderNotifIcon = (type, category, size = 46) => {
    const isBig = size > 50;
    const boxStyle = {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: isBig ? '20px' : '14px',
      fontSize: isBig ? '30px' : '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    };

    switch (type) {
      case 'reward':
        return (
          <div style={{
            ...boxStyle,
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            border: '1px solid #86efac',
            color: '#16a34a',
          }}>
            🎁
          </div>
        );
      case 'update':
        return (
          <div style={{
            ...boxStyle,
            background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
            border: '1px solid #fde047',
            color: '#ca8a04',
          }}>
            📢
          </div>
        );
      case 'withdraw':
        return (
          <div style={{
            ...boxStyle,
            background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
            border: '1px solid #4ade80',
            color: '#15803d',
          }}>
            <CheckCircle2 size={isBig ? 32 : 24} color="#15803d" strokeWidth={2.5} />
          </div>
        );
      case 'offer':
        return (
          <div style={{
            ...boxStyle,
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '1px solid #7dd3fc',
            color: '#0284c7',
          }}>
            🎁
          </div>
        );
      case 'referral':
        return (
          <div style={{
            ...boxStyle,
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            border: '1px solid #c4b5fd',
            color: '#7c3aed',
          }}>
            <Users size={isBig ? 30 : 22} color="#7c3aed" strokeWidth={2.2} />
          </div>
        );
      case 'system':
      default:
        return (
          <div style={{
            ...boxStyle,
            background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
            border: '1px solid #5eead4',
            color: '#0d9488',
          }}>
            <Volume2 size={isBig ? 30 : 22} color="#0d9488" strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div style={{
      padding: '12px 16px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      background: '#f8fafc',
      minHeight: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 1. Header with Back Button, Title & 3D Bell */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '4px',
        flexShrink: 0
      }}>
        {/* Left: Back Button & Titles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              sounds.playClick();
              navigateTo('home');
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1e293b',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              flexShrink: 0
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '900',
              color: '#0f172a',
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.15
            }}>
              Notifications
            </h1>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '600',
              marginTop: '2px',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              নতুন সকল আপডেট ও রিওয়ার্ডের তথ্য!
            </p>
          </div>
        </div>

        {/* Right: 3D Bell Illustration */}
        <div style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={notificationBell} 
            alt="Notification Bell" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </div>
      </div>

      {/* 2. Horizontal Filter Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0 6px',
        minHeight: '44px',
        flexShrink: 0,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '24px',
                border: isActive ? 'none' : '1px solid #e2e8f0',
                background: isActive ? '#16a34a' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                fontWeight: isActive ? '800' : '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
              }}
            >
              <Icon size={14} color={isActive ? '#ffffff' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Notifications Cards List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {filteredNotifications.length === 0 ? (
          <EmptyState 
            title="কোনো নোটিফিকেশন নেই"
            subtitle="নতুন আপডেট ও রিওয়ার্ডের জন্য সাথে থাকুন!"
            animationSize={170}
            style={{ marginTop: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}
          />
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleCardClick(notif)}
              style={{
                position: 'relative',
                background: notif.read ? '#ffffff' : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                border: notif.read ? '1.5px solid #e2e8f0' : '1.5px solid #86efac',
                borderRadius: '18px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: notif.read ? '0 2px 6px rgba(0,0,0,0.02)' : '0 4px 12px rgba(22, 163, 74, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {/* Unread indicator green dot */}
              {!notif.read && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)'
                }} />
              )}

              {/* Icon Box */}
              {renderNotifIcon(notif.type, notif.category)}

              {/* Middle content text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#0f172a',
                  fontFamily: "'Noto Serif Bengali', serif"
                }}>
                  {notif.title}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#475569',
                  marginTop: '2px',
                  lineHeight: '1.35',
                  fontWeight: '500',
                  fontFamily: "'Noto Serif Bengali', serif"
                }}>
                  {notif.message}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginTop: '4px',
                  fontWeight: '600'
                }}>
                  <Clock size={11} color="#94a3b8" />
                  <span>{notif.time}</span>
                </div>
              </div>

              {/* Right Chevron Green */}
              <div style={{ flexShrink: 0, paddingLeft: '4px' }}>
                <ChevronRight size={18} color="#16a34a" strokeWidth={2.5} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Bottom "Clear All" Button */}
      {filteredNotifications.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '6px',
          paddingBottom: '20px',
          flexShrink: 0
        }}>
          <button
            onClick={handleClearAll}
            style={{
              background: '#ffffff',
              border: '1.5px solid #86efac',
              borderRadius: '24px',
              padding: '9px 24px',
              color: '#16a34a',
              fontSize: '13px',
              fontWeight: '800',
              fontFamily: "'Outfit', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
              transition: 'all 0.2s ease'
            }}
          >
            <Trash2 size={15} color="#16a34a" />
            <span>সব মুছুন</span>
          </button>
        </div>
      )}

      {/* 5. Notification Details Popup Modal */}
      {selectedNotif && (
        <div 
          onClick={() => setSelectedNotif(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '340px',
              background: '#ffffff',
              borderRadius: '26px',
              padding: '24px 20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            {/* Close Button (X) */}
            <button
              onClick={() => setSelectedNotif(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
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

            {/* Notification Icon */}
            <div style={{ marginBottom: '14px' }}>
              {renderNotifIcon(selectedNotif.type, selectedNotif.category, 62)}
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '17px',
              fontWeight: '900',
              color: '#0f172a',
              margin: '0 0 8px 0',
              fontFamily: "'Noto Serif Bengali', serif",
              lineHeight: 1.3
            }}>
              {selectedNotif.title}
            </h3>

            {/* Time Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              <Clock size={12} color="#64748b" />
              <span>{selectedNotif.time}</span>
            </div>

            {/* Message Body Card */}
            <div style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #edf2f7',
              borderRadius: '18px',
              padding: '14px 16px',
              marginBottom: '20px',
              boxSizing: 'border-box'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#334155',
                lineHeight: '1.55',
                margin: 0,
                fontWeight: '500',
                fontFamily: "'Noto Serif Bengali', serif"
              }}>
                {selectedNotif.message}
              </p>
            </div>

            {/* Confirm / Close Button */}
            <button
              onClick={() => setSelectedNotif(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: '800',
                fontFamily: "'Noto Serif Bengali', serif",
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
              }}
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
