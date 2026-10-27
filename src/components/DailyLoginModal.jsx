import React from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';
import cigaretteIcon from '../assets/cigarette-icon.png';

export const DailyLoginModal = () => {
  const { 
    showDailyLoginModal, 
    setShowDailyLoginModal, 
    loginStreak = 0,
    dailyLoginRewards = [],
    streakStatus = {},
    claimDailyLoginReward
  } = useApp();

  if (!showDailyLoginModal) return null;

  const { canClaimToday = false, currentDayToClaim = 1, activeStreak = 0 } = streakStatus;

  const currentReward = dailyLoginRewards.find(r => r.day === currentDayToClaim) || dailyLoginRewards[0];

  const handleClaim = () => {
    claimDailyLoginReward();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      animation: 'modalFadeIn 0.2s ease-out'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '92vh',
          background: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #15803d 0%, #16a34a 55%, #22c55e 100%)',
          padding: '24px 20px 18px',
          color: '#ffffff',
          position: 'relative',
          textAlign: 'center'
        }}>
          {/* Close Button (X) */}
          <button
            onClick={() => setShowDailyLoginModal(false)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.2)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            <X size={18} />
          </button>

          <h2 style={{
            fontSize: '22px',
            fontWeight: '900',
            fontFamily: "'Noto Serif Bengali', serif",
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            দৈনিক লগইন রিওয়ার্ড
          </h2>

          <p style={{
            fontSize: '13px',
            color: '#dcfce7',
            margin: 0,
            fontFamily: "'Noto Serif Bengali', serif",
            lineHeight: 1.4
          }}>
            প্রতিদিন অ্যাপে প্রবেশ করলেই নিশ্চিত পুরস্কার!
          </p>
        </div>

        {/* Scrollable 14-Day Grid Container */}
        <div style={{
          padding: '16px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Streak Progress Status Bar */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                fontWeight: '700',
                fontFamily: "'Noto Serif Bengali', serif"
              }}>
                বর্তমান অগ্রগতি
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '900',
                color: '#15803d',
                fontFamily: "'Outfit', 'Noto Serif Bengali', serif, sans-serif"
              }}>
                {canClaimToday ? activeStreak : loginStreak} / ১৪ দিন
              </div>
            </div>

            {/* Visual mini progress bar */}
            <div style={{ flex: 1, maxWidth: '160px' }}>
              <div style={{
                height: '8px',
                background: '#e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, Math.round(((canClaimToday ? activeStreak : loginStreak) / 14) * 100))}%`,
                  background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                  borderRadius: '8px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            <div style={{
              fontSize: '11px',
              fontWeight: '800',
              color: canClaimToday ? '#ca8a04' : '#16a34a',
              background: canClaimToday ? '#fef9c3' : '#dcfce7',
              padding: '4px 8px',
              borderRadius: '8px',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              {canClaimToday ? 'আজকের বাকি' : 'আজকের সংগৃহীত'}
            </div>
          </div>

          {/* 14-Day Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px'
          }}>
            {dailyLoginRewards.map((item) => {
              const isDay14 = item.day === 14;
              
              let isClaimed = false;
              let isToday = false;
              let isLocked = false;

              if (canClaimToday) {
                if (item.day < currentDayToClaim) {
                  isClaimed = true;
                } else if (item.day === currentDayToClaim) {
                  isToday = true;
                } else {
                  isLocked = true;
                }
              } else {
                if (item.day <= loginStreak) {
                  isClaimed = true;
                } else {
                  isLocked = true;
                }
              }

              // Styling per state
              let cardBg = '#ffffff';
              let cardBorder = '1.5px solid #e2e8f0';
              let textColor = '#0f172a';
              let boxShadow = '0 2px 6px rgba(0, 0, 0, 0.03)';

              if (isToday) {
                cardBg = 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)';
                cardBorder = '2px solid #eab308';
                textColor = '#854d0e';
                boxShadow = '0 0 14px rgba(234, 179, 8, 0.45)';
              } else if (isClaimed) {
                cardBg = '#f0fdf4';
                cardBorder = '1.5px solid #86efac';
                textColor = '#166534';
              } else if (isDay14) {
                cardBg = 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
                cardBorder = '1.5px solid #d8b4fe';
                textColor = '#6b21a8';
              }

              return (
                <div
                  key={item.day}
                  style={{
                    gridColumn: isDay14 ? 'span 3' : 'span 1',
                    background: cardBg,
                    border: cardBorder,
                    borderRadius: '16px',
                    padding: isDay14 ? '10px 14px' : '8px 4px',
                    display: 'flex',
                    flexDirection: isDay14 ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: isDay14 ? 'space-between' : 'center',
                    gap: isDay14 ? '10px' : '4px',
                    position: 'relative',
                    boxShadow,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Day Label */}
                  <div style={{
                    fontSize: isDay14 ? '13px' : '11px',
                    fontWeight: '800',
                    color: isToday ? '#b45309' : (isClaimed ? '#15803d' : '#64748b'),
                    fontFamily: "'Outfit', sans-serif",
                    lineHeight: 1
                  }}>
                    Day {item.day}
                  </div>

                  {/* Icon Representation */}
                  {isDay14 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      justifyContent: 'center'
                    }}>
                      <img 
                        src={cigaretteIcon} 
                        alt="Cigarette Token" 
                        style={{
                          width: '32px',
                          height: '32px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                        }}
                      />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '900',
                          color: '#7e22ce',
                          fontFamily: "'Noto Serif Bengali', serif",
                          lineHeight: 1.2
                        }}>
                          ৫০ সিগারেট টোকেন
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 70%, #ca8a04 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '900',
                      fontSize: '13px',
                      fontFamily: "'Noto Serif Bengali', serif",
                      boxShadow: '0 2px 6px rgba(234, 179, 8, 0.3)',
                      margin: '2px 0'
                    }}>
                      ৳
                    </div>
                  )}

                  {/* Reward Amount Label */}
                  {!isDay14 && (
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '900',
                      color: textColor,
                      fontFamily: "'Noto Serif Bengali', serif",
                      lineHeight: 1
                    }}>
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Area */}
        <div style={{
          padding: '14px 18px 18px',
          background: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {canClaimToday ? (
            <button
              onClick={handleClaim}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '15px',
                fontWeight: '900',
                fontFamily: "'Noto Serif Bengali', serif",
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>
                আজকের পুরস্কার নিন: {currentReward.label}
              </span>
            </button>
          ) : (
            <button
              disabled
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '18px',
                background: '#f1f5f9',
                color: '#15803d',
                border: '1.5px solid #bbf7d0',
                fontSize: '14px',
                fontWeight: '800',
                fontFamily: "'Noto Serif Bengali', serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default'
              }}
            >
              <span>আজকের রিওয়ার্ড সংগৃহীত (পরবর্তী রিওয়ার্ড আগামীকাল)</span>
            </button>
          )}

          <button
            onClick={() => setShowDailyLoginModal(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '12.5px',
              fontWeight: '700',
              fontFamily: "'Noto Serif Bengali', serif",
              padding: '4px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            পরে নেব (এখন বন্ধ করুন)
          </button>
        </div>
      </div>
    </div>
  );
};
