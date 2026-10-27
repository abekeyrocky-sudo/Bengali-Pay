import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import gamePageBg from '../assets/game-page-bg.png';
import cigaretteIcon from '../assets/cigarette-icon.png';
import takaNoteIcon from '../assets/৳-currency-note-icon.png';

export const GameScreen = () => {
  const { 
    balance, 
    spinsLeft, 
    setSpinsLeft, 
    earnReward, 
    navigateTo, 
    soundOn, 
    toggleSound,
    notifyWarn,
    notifySuccess,
    addNotification
  } = useApp();

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winPrize, setWinPrize] = useState(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [boardPressed, setBoardPressed] = useState(false);

  // 8 segments matching the user's slot price list
  const segments = [
    { label: '10৳', amount: '10', value: 10, type: 'taka', isToken: false, color: '#f59e0b', textColor: '#78350f' },
    { label: '20৳', amount: '20', value: 20, type: 'taka', isToken: false, color: '#ec4899', textColor: '#831843' },
    { label: '50৳', amount: '50', value: 50, type: 'taka', isToken: false, color: '#3b82f6', textColor: '#1e3a8a' },
    { label: '50 Cigarette Token', amount: '50', value: 50, type: 'token', isToken: true, color: '#a855f7', textColor: '#581c87' },
    { label: '100 Cigarette Token', amount: '100', value: 100, type: 'token', isToken: true, color: '#6366f1', textColor: '#312e81' },
    { label: '10৳', amount: '10', value: 10, type: 'taka', isToken: false, color: '#10b981', textColor: '#064e3b' },
    { label: '20৳', amount: '20', value: 20, type: 'taka', isToken: false, color: '#f97316', textColor: '#7c2d12' },
    { label: '50৳', amount: '50', value: 50, type: 'taka', isToken: false, color: '#eab308', textColor: '#713f12' },
  ];

  const segAngle = 360 / segments.length;

  // Weighted winning index:
  // - 50 & 100 cigarette tokens: 0% chance
  // - 10৳: High chance (70% total: 35% on slot 0, 35% on slot 5)
  // - 20৳: Medium chance (22% total: 11% on slot 1, 11% on slot 6)
  // - 50৳: Low chance (8% total: 4% on slot 2, 4% on slot 7)
  const getWeightedWinningIndex = () => {
    const weights = [35, 11, 4, 0, 0, 35, 11, 4];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const rand = Math.random() * totalWeight;
    let accumulated = 0;
    for (let i = 0; i < weights.length; i++) {
      accumulated += weights[i];
      if (rand < accumulated) {
        return i;
      }
    }
    return 0;
  };

  const spinWheel = () => {
    if (spinning) return;
    if (spinsLeft <= 0) {
      notifyWarn(
        'ফ্রি স্পিন শেষ!',
        'আজকের সব ফ্রি স্পিন ব্যবহার করা হয়ে গেছে। নতুন স্পিন পেতে টাস্ক সম্পন্ন করুন!',
        {
          confirmText: 'টাস্ক দেখুন',
          onConfirm: () => navigateTo('tasks'),
          cancelText: 'বন্ধ করুন'
        }
      );
      return;
    }

    setSpinning(true);
    setWinPrize(null);
    sounds.playClick();

    // Pick a winning index according to weighted probabilities
    const winningIndex = getWeightedWinningIndex();
    const prize = segments[winningIndex];

    // Compute rotation with exact landing under top needle pointer
    const fullRounds = 5 + Math.floor(Math.random() * 3);
    const currentRotMod = rotation % 360;
    const targetOffset = 360 - (winningIndex * segAngle + segAngle / 2);
    const diff = (targetOffset - currentRotMod + 360) % 360;
    const finalRotation = rotation + (fullRounds * 360) + diff;

    setRotation(finalRotation);

    // Play tick sounds periodically
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sounds.playSpinTick();
      tickCount++;
      if (tickCount > 24) clearInterval(tickInterval);
    }, 120);

    // Stop after spin duration (4.2 seconds)
    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      setSpinsLeft(prev => Math.max(0, prev - 1));
      setWinPrize(prize);
      sounds.playWin();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.55 }
      });

      if (prize.type === 'taka') {
        earnReward(prize.value, 0, `স্পিন হুইল পুরস্কার (${prize.label})`);
      } else {
        earnReward(0, prize.value, `স্পিন হুইল পুরস্কার (${prize.label})`);
      }

      if (typeof addNotification === 'function') {
        addNotification({
          category: 'rewards',
          type: 'reward',
          title: 'স্পিন পুরস্কার! 🎉',
          message: `স্পিন করে আপনি ${prize.label} জিতে নিয়েছেন!`
        });
      }
    }, 4200);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: `url(${gamePageBg})`,
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden'
    }}>
      {/* Subtle Sky Gradient for Header Contrast */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, transparent 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Screen Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '12px 14px 16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '2px',
          flexShrink: 0
        }}>
          <button 
            onClick={() => navigateTo('home')}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <ArrowLeft size={20} color="#0f172a" />
          </button>

          <h2 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif",
            textShadow: '0 1px 4px rgba(255,255,255,0.8)'
          }}>
            Spin & Win
          </h2>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={toggleSound}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {soundOn ? <Volume2 size={18} color="#16a34a" /> : <VolumeX size={18} color="#64748b" />}
            </button>
            <button
              onClick={() => setShowRuleModal(true)}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <HelpCircle size={18} color="#0f172a" />
            </button>
          </div>
        </div>

        {/* Wheel Centerpiece Area */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '38px 0 6px 0'
        }}>
          {/* Wheel Pointer Needle (Top) */}
          <div style={{
            position: 'absolute',
            top: '-16px',
            zIndex: 30,
            width: '0',
            height: '0',
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '32px solid #dc2626',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
          }} />

          {/* Wooden Wheel Exterior Rim */}
          <div style={{
            position: 'relative',
            width: '286px',
            height: '286px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #78350f 70%, #451a03 100%)',
            padding: '10px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.6)',
            border: '4px solid #facc15'
          }}>
            {/* Rotating Wheel Itself */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                position: 'relative',
                overflow: 'hidden',
                transition: spinning ? 'transform 4.2s cubic-bezier(0.12, 0.8, 0.15, 1)' : 'none',
                transform: `rotate(${rotation}deg)`,
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)'
              }}
            >
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {segments.map((seg, i) => {
                  const angle = (360 / segments.length);
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;

                  const rad1 = (startAngle - 90) * (Math.PI / 180);
                  const rad2 = (endAngle - 90) * (Math.PI / 180);

                  const x1 = 50 + 50 * Math.cos(rad1);
                  const y1 = 50 + 50 * Math.sin(rad1);
                  const x2 = 50 + 50 * Math.cos(rad2);
                  const y2 = 50 + 50 * Math.sin(rad2);

                  const midRad = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
                  const tx = 50 + 32 * Math.cos(midRad);
                  const ty = 50 + 32 * Math.sin(midRad);
                  const midAngle = (startAngle + endAngle) / 2;

                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                        fill={seg.color}
                        stroke="#ffffff"
                        strokeWidth="0.8"
                      />

                      {/* Slot Content: Amount on top, 3D Icon on bottom (replacing ৳ and টোকেন text) */}
                      <g transform={`rotate(${midAngle}, ${tx}, ${ty})`}>
                        {/* Number Amount */}
                        <text
                          x={tx}
                          y={ty - 3.4}
                          fill="#ffffff"
                          fontSize="6.2"
                          fontWeight="900"
                          fontFamily="'Outfit', sans-serif"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
                        >
                          {seg.amount}
                        </text>

                        {/* 3D Icon */}
                        {seg.isToken ? (
                          <image
                            href={cigaretteIcon}
                            xlinkHref={cigaretteIcon}
                            x={tx - 4}
                            y={ty + 0.3}
                            width="8"
                            height="8"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                          />
                        ) : (
                          <image
                            href={takaNoteIcon}
                            xlinkHref={takaNoteIcon}
                            x={tx - 4.5}
                            y={ty + 0.5}
                            width="9"
                            height="7"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                          />
                        )}
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center SPIN Button */}
            <button
              onClick={spinWheel}
              disabled={spinning}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #facc15 0%, #ca8a04 80%, #a16207 100%)',
                border: '4px solid #ffffff',
                boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
                cursor: spinning ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 25,
                color: '#451a03',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '900',
                fontSize: '13px',
                letterSpacing: '0.5px'
              }}
            >
              <span>SPIN</span>
            </button>
          </div>
        </div>

        {/* Wooden Board - Spin Counter & Interactive Trigger (Dead Center on Illustrated Board) */}
        <button
          onClick={spinWheel}
          disabled={spinning}
          onMouseDown={() => setBoardPressed(true)}
          onMouseUp={() => setBoardPressed(false)}
          onTouchStart={() => setBoardPressed(true)}
          onTouchEnd={() => setBoardPressed(false)}
          aria-label="Spin the wheel"
          style={{
            position: 'absolute',
            bottom: '17.25%',
            left: '51.8%',
            transform: `translate(-50%, 50%) scale(${boardPressed ? 0.94 : 1})`,
            width: '54%',
            maxWidth: '190px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: spinning ? 'not-allowed' : (spinsLeft > 0 ? 'pointer' : 'default'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            zIndex: 30,
            userSelect: 'none',
            transition: 'transform 0.12s ease'
          }}
        >
          {/* Bengali Title on Wooden Board - Crisp White */}
          <div style={{
            fontSize: '13.5px',
            fontWeight: '800',
            color: '#ffffff',
            fontFamily: "'Noto Serif Bengali', serif",
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px rgba(0, 0, 0, 1)',
            letterSpacing: '0.3px',
            textAlign: 'center'
          }}>
            ফ্রি স্পিন বাকি
          </div>

          {/* Spin Count Number - Radiant Gold */}
          <div style={{
            fontSize: spinning ? '16px' : '24px',
            fontWeight: '900',
            color: '#fef08a',
            fontFamily: spinning ? "'Noto Serif Bengali', serif" : "'Outfit', sans-serif",
            lineHeight: '1.15',
            marginTop: '3px',
            textShadow: '0 2px 5px rgba(0, 0, 0, 0.95), 0 1px 2px rgba(0, 0, 0, 1), 0 0 12px rgba(234, 179, 8, 0.6)',
            textAlign: 'center'
          }}>
            {spinning ? 'ঘুরছে...' : `${spinsLeft} / 3`}
          </div>
        </button>
      </div>

      {/* Win Prize Dialog */}
      {winPrize && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '320px',
            background: 'linear-gradient(135deg, #fef9c3 0%, #ffffff 100%)',
            borderRadius: '28px',
            padding: '28px 20px',
            textAlign: 'center',
            border: '3px solid #eab308',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div className="bounce-coin" style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fef08a 0%, #eab308 100%)',
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #fff',
              boxShadow: '0 6px 20px rgba(234, 179, 8, 0.5)'
            }}>
              <img 
                src={winPrize.isToken ? cigaretteIcon : takaNoteIcon} 
                alt={winPrize.label} 
                style={{
                  width: winPrize.isToken ? '44px' : '48px',
                  height: winPrize.isToken ? '44px' : '36px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))'
                }}
              />
            </div>

            <h3 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#854d0e',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              অভিনন্দন! 🎉
            </h3>
            <p style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#15803d',
              marginTop: '6px',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              আপনি জিতেছেন {winPrize.label}!
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px',
              marginBottom: '20px',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              আপনার ব্যালেন্সে সরাসরি যোগ করা হয়েছে।
            </p>

            <button
              onClick={() => setWinPrize(null)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              চালিয়ে যান
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRuleModal && (
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
            maxWidth: '320px',
            background: '#fff',
            borderRadius: '24px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              স্পিনের নিয়মাবলী
            </h3>
            <div style={{
              textAlign: 'left',
              fontSize: '13px',
              color: '#475569',
              margin: '14px 0',
              lineHeight: '1.6',
              fontFamily: "'Noto Serif Bengali', serif"
            }}>
              <p>১. দৈনিক ৩টি ফ্রি স্পিন দেওয়া হয়।</p>
              <p>২. প্রতিটি স্পিনে ১০৳, ২০৳ ও ৫০৳ পর্যন্ত নগদ টাকা জেতার আকর্ষণীয় সুযোগ রয়েছে।</p>
              <p>৩. অতিরিক্ত স্পিন পেতে টাস্ক সেকশন থেকে টাস্ক সম্পন্ন করুন।</p>
            </div>
            <button
              onClick={() => setShowRuleModal(false)}
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
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
