import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Tv, 
  CheckCircle,
  Play
} from 'lucide-react';
import cigaretteIcon from '../assets/cigarette-icon.png';
import balanceCardBg from '../assets/balance-card-bg.png';

export const WalletScreen = () => {
  const { 
    balance, 
    tokens, 
    navigateTo 
  } = useApp();

  return (
    <div style={{
      padding: '16px 18px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      background: '#f8fafc',
      minHeight: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Header: Back Arrow + Wallet */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '4px',
        flexShrink: 0
      }}>
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
          <ArrowLeft size={18} color="#0f172a" />
        </button>

        <h2 style={{
          fontSize: '22px',
          fontWeight: '800',
          color: '#0f172a',
          fontFamily: "'Outfit', sans-serif"
        }}>
          Wallet
        </h2>
      </div>

      {/* 1. Available Balance Card (Using balance-card-bg.png from assets) */}
      <div 
        onClick={() => navigateTo('withdraw')}
        style={{
          backgroundImage: `url(${balanceCardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '22px',
          padding: '22px 24px',
          color: '#ffffff',
          boxShadow: '0 8px 24px -2px rgba(22, 163, 74, 0.32)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '110px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          zIndex: 1
        }}>
          <span style={{
            fontSize: '30px',
            fontWeight: '800',
            color: '#facc15',
            fontFamily: "'Noto Serif Bengali', serif",
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

        <p style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#dcfce7',
          marginTop: '6px',
          letterSpacing: '0.2px',
          zIndex: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}>
          Available Balance
        </p>
      </div>

      {/* 2. Token Balance Card (Mockup Match: Icon on Left, 12 on Right) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '22px',
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9',
        flexShrink: 0
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#1e293b',
          display: 'block'
        }}>
          Token Balance
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '8px'
        }}>
          {/* Cigarette Icon in Soft Pastel Circle (Balanced Size) */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #e0e7ff 0%, #ede9fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src={cigaretteIcon} 
              alt="Cigarette Token" 
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain',
                transform: 'scale(1.35)',
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.14))'
              }}
            />
          </div>

          <div>
            <div style={{
              fontSize: '32px',
              fontWeight: '900',
              fontFamily: "'Outfit', sans-serif",
              color: '#0f172a',
              lineHeight: '1.1'
            }}>
              {tokens}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Minimum Withdraw Card (Mint Green Card, Balanced Size) */}
      <div 
        onClick={() => navigateTo('withdraw')}
        style={{
          background: 'linear-gradient(135deg, #e6f9ed 0%, #dcfce7 100%)',
          borderRadius: '22px',
          padding: '16px 20px',
          border: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
          flexShrink: 0
        }}
      >
        {/* Soft Mint Squircle Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #a7f3d0 0%, #86efac 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <img 
            src={cigaretteIcon} 
            alt="Cigarette Token" 
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'contain',
              transform: 'scale(1.32)',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.12))'
            }}
          />
        </div>

        <div>
          <span style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#065f46'
          }}>
            Minimum Withdraw
          </span>
          <div style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#064e3b',
            fontFamily: "'Outfit', sans-serif",
            lineHeight: '1.2'
          }}>
            ৳ 500
          </div>
          <div style={{
            fontSize: '11.5px',
            fontWeight: '700',
            color: '#047857',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>Require 50</span>
            <img src={cigaretteIcon} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions Section (Card Container Matching Mockup) */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '800',
          color: '#0f172a',
          fontFamily: "'Outfit', sans-serif",
          marginBottom: '10px'
        }}>
          Recent Transactions
        </h3>

        <div style={{
          background: '#ffffff',
          borderRadius: '22px',
          padding: '6px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          border: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Item 1: Watch Video */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid #f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Tv size={18} color="#d97706" />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Watch Video
                </h4>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  2m ago
                </span>
              </div>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '800',
              color: '#16a34a',
              fontFamily: "'Outfit', sans-serif"
            }}>
              +1 ৳
            </span>
          </div>

          {/* Item 2: Daily Bonus */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid #f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src={cigaretteIcon} 
                  alt="Daily Bonus" 
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    objectFit: 'contain',
                    transform: 'scale(1.22)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
                  }} 
                />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Daily Bonus
                </h4>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  1h ago
                </span>
              </div>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '800',
              color: '#16a34a',
              fontFamily: "'Outfit', sans-serif"
            }}>
              +5 ৳
            </span>
          </div>

          {/* Item 3: Task Completed */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#ffe4e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={18} color="#e11d48" />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  Task Completed
                </h4>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  3h ago
                </span>
              </div>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '800',
              color: '#16a34a',
              fontFamily: "'Outfit', sans-serif"
            }}>
              +2 ৳
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
