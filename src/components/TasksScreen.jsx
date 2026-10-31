import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { checkChannelMembershipAPI } from '../firebase';
import { getTelegramWebApp, getActiveTelegramUserId } from '../utils/telegram';
import { showAdsgramInterstitialAd } from '../utils/adsgram';
import { showGigaPubAd } from '../utils/gigapub';
import { 
  Play, 
  Calendar, 
  Gamepad2, 
  UserPlus, 
  ClipboardCheck, 
  Tv, 
  CheckCircle2, 
  X, 
  Copy, 
  Sparkles,
  ArrowLeft,
  Send,
  ExternalLink
} from 'lucide-react';
import cigaretteIcon from '../assets/cigarette-icon.png';
import taskPageImg from '../assets/task-page-img.jpg';

export const TasksScreen = () => {
  const { 
    userId,
    userTelegramId,
    tokens, 
    tasks, 
    setTasks, 
    earnReward, 
    navigateTo, 
    dailyClaimed, 
    setDailyClaimed,
    setShowDailyLoginModal,
    notifySuccess,
    notifyWarn,
    dailyAdsCount,
    dailyAdsgramCount,
    dailyGigapubCount,
    lastAdDate,
    recordAdWatch
  } = useApp();

  // Active modal state: null | 'video' | 'survey' | 'refer' | 'tg_channel'
  const [activeModal, setActiveModal] = useState(null);
  const [videoTimer, setVideoTimer] = useState(15);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVerifyingChannel, setIsVerifyingChannel] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);

  // Survey state
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyAnswer, setSurveyAnswer] = useState('');

  // Handle Channel Join verification
  const handleVerifyChannelJoin = async () => {
    setIsVerifyingChannel(true);
    const realTgId = getActiveTelegramUserId() || userTelegramId || (userId?.startsWith('tg_') ? userId.replace('tg_', '') : '');
    const tgId = realTgId || '7639899614';

    try {
      const res = await checkChannelMembershipAPI(tgId);
      if (res && res.isMember) {
        sounds.playWin();
        try {
          confetti({
            particleCount: 85,
            spread: 70,
            origin: { y: 0.55 }
          });
        } catch (e) {}

        earnReward(50, 0, 'অফিসিয়াল চ্যানেল জয়েন বোনাস');
        markTaskDone('tg_channel');
        setActiveModal(null);
        notifySuccess('অভিনন্দন! 🎉', '+৫০ ৳ চ্যানেল জয়েন বোনাস সফলভাবে অ্যাকাউন্টে যোগ হয়েছে!');
      } else {
        try { sounds.playError?.(); } catch (e) {}
        notifyWarn('চ্যানেলে জয়েন করা হয়নি!', 'অনুগ্রহ করে প্রথমে Bengali Pay অফিসিয়াল চ্যানেলে জয়েন করুন, তারপর ভেরিফাই বাটনে ট্যাপ করুন।');
      }
    } catch (e) {
      notifyWarn('ভেরিফিকেশন সমস্যা', 'ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।');
    } finally {
      setIsVerifyingChannel(false);
    }
  };

  // Handle Interstitial Ads Watch (3 Adsgram + 3 Gigapub = 6 Ads daily, +20 ৳ per ad)
  const startVideoTask = async () => {
    const totalWatched = (dailyAdsgramCount || 0) + (dailyGigapubCount || 0);
    if (totalWatched >= 6) {
      notifyWarn(
        'দৈনিক লিমিট শেষ!',
        'আজকের জন্য ৬টি বিজ্ঞাপন (৩টি Adsgram + ৩টি Gigapub) দেখার লিমিট পূর্ণ হয়েছে (৬/৬)। আগামীকাল আবার দেখতে পারবেন!'
      );
      return;
    }

    if (isAdLoading) return;
    setIsAdLoading(true);

    try {
      const canShowAdsgram = (dailyAdsgramCount || 0) < 3;
      const canShowGigapub = (dailyGigapubCount || 0) < 3;

      let showedNetwork = null;
      let adResult = null;

      // Smart rotation & seamless failover between Adsgram and Gigapub
      if (canShowAdsgram && (!canShowGigapub || (dailyAdsgramCount || 0) <= (dailyGigapubCount || 0))) {
        // Try Adsgram Interstitial (int-57158)
        const agRes = await showAdsgramInterstitialAd('int-57158');
        if (agRes && agRes.done) {
          showedNetwork = 'adsgram';
          adResult = agRes;
        } else if (canShowGigapub) {
          // Seamless fallback to Gigapub if Adsgram had no fill
          const gpRes = await showGigaPubAd();
          if (gpRes && gpRes.done) {
            showedNetwork = 'gigapub';
            adResult = gpRes;
          }
        }
      } else if (canShowGigapub) {
        // Try Gigapub Interstitial (id: 8909)
        const gpRes = await showGigaPubAd();
        if (gpRes && gpRes.done) {
          showedNetwork = 'gigapub';
          adResult = gpRes;
        } else if (canShowAdsgram) {
          // Seamless fallback to Adsgram if Gigapub had no fill
          const agRes = await showAdsgramInterstitialAd('int-57158');
          if (agRes && agRes.done) {
            showedNetwork = 'adsgram';
            adResult = agRes;
          }
        }
      }

      if (showedNetwork && adResult?.done) {
        const stats = recordAdWatch(showedNetwork);
        earnReward(20, 0, 'বিজ্ঞাপন দেখার পুরস্কার');
        
        notifySuccess(
          'বিজ্ঞাপন সম্পন্ন! 🎉',
          `+২০ ৳ সফলভাবে আপনার অ্যাকাউন্টে যোগ হয়েছে! (আজকের অগ্রগতি: ${stats.total}/৬)`
        );
      } else {
        notifyWarn(
          'বিজ্ঞাপন সম্পন্ন হয়নি!',
          'বিজ্ঞাপন লোড হতে সমস্যা হয়েছে বা বন্ধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
        );
      }
    } catch (err) {
      notifyWarn(
        'বিজ্ঞাপন সমস্যা',
        'ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।'
      );
    } finally {
      setIsAdLoading(false);
    }
  };

  // Mark task as done
  const markTaskDone = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
  };

  // Handle Daily check-in: open 14-day login streak popup
  const handleDailyCheckin = () => {
    setShowDailyLoginModal(true);
  };

  // Handle Survey submit
  const submitSurvey = () => {
    earnReward(3, 0, 'Survey Completed Reward');
    markTaskDone('survey');
    setActiveModal(null);
    notifySuccess('সার্ভে সম্পন্ন!', '+৩ ৳ সফলভাবে অ্যাকাউন্টে যোগ হয়েছে!');
  };

  const getTaskIcon = (icon) => {
    switch (icon) {
      case 'tg_channel':
        return <Send size={20} color="#0284c7" />;
      case 'video':
        return <Tv size={20} color="#ef4444" />;
      case 'daily':
        return <Calendar size={20} color="#16a34a" />;
      case 'game':
        return <Gamepad2 size={20} color="#8b5cf6" />;
      case 'refer':
        return <UserPlus size={20} color="#0ea5e9" />;
      case 'survey':
        return <ClipboardCheck size={20} color="#f59e0b" />;
      default:
        return <Sparkles size={20} color="#16a34a" />;
    }
  };

  const handleTaskAction = (task) => {
    if (!task || task.done) return;
    if (task.id === 'video') startVideoTask();
    else if (task.id === 'daily') handleDailyCheckin();
    else if (task.id === 'tg_channel') setActiveModal('tg_channel');
    else if (task.id === 'game') navigateTo('game');
    else if (task.id === 'refer') navigateTo('invite');
    else if (task.id === 'survey') setActiveModal('survey');
  };

  return (
    <div style={{
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: '#f8fafc',
      minHeight: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => navigateTo('home')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} color="#334155" />
          </button>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Earn Rewards
          </h2>
        </div>

        {/* Token Counter Badge */}
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
              width: '38px', 
              height: '38px', 
              objectFit: 'contain',
              transform: 'scale(1.15)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
              flexShrink: 0
            }} 
          />
          <span style={{
            fontWeight: '900',
            color: '#b45309',
            fontSize: '18px',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.2px'
          }}>
            {tokens}
          </span>
        </div>
      </div>

      {/* Adsgram Sponsored Partner Task Block (task-57162) - Rewards: +1 Free Spin */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        padding: '14px 16px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        border: '1.5px solid #bae6fd'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px' }}>⚡</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0369a1' }}>
              পার্টনার স্পেশাল টাস্ক
            </span>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#b45309',
            background: '#fef3c7',
            padding: '2px 8px',
            borderRadius: '8px',
            border: '1px solid #fde047'
          }}>
            +১টি ফ্রি স্পিন 🎰
          </span>
        </div>

        {/* Official Adsgram Task Component */}
        <adsgram-task data-block-id="task-57162"></adsgram-task>
      </div>

      {/* Tasks List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {tasks.map((task) => {
          const isDone = task.done || (task.id === 'daily' && dailyClaimed) || (task.id === 'video' && dailyAdsCount >= 6);

          return (
            <div
              key={task.id}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: isDone ? '1px solid #bbf7d0' : '1px solid #f1f5f9'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: isDone ? '#f0fdf4' : '#f8fafc',
                  border: isDone ? '1px solid #86efac' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getTaskIcon(task.id)}
                </div>

                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: isDone ? '#64748b' : '#1e293b',
                    textDecoration: isDone ? 'line-through' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{task.id === 'video' ? 'Watch Ads' : task.title}</span>
                    {task.id === 'video' && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: isDone ? '#16a34a' : '#0284c7',
                        background: isDone ? '#f0fdf4' : '#e0f2fe',
                        padding: '1px 7px',
                        borderRadius: '8px',
                        textDecoration: 'none'
                      }}>
                        {dailyAdsCount}/৬
                      </span>
                    )}
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#16a34a',
                    marginTop: '2px'
                  }}>
                    {task.id === 'video' ? '+২০ ৳' : task.reward}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {isDone ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#16a34a',
                  fontWeight: '700',
                  fontSize: '12px',
                  background: '#f0fdf4',
                  padding: '6px 12px',
                  borderRadius: '12px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>Done</span>
                </div>
              ) : (
                <button
                  onClick={() => handleTaskAction(task)}
                  disabled={task.id === 'video' && isAdLoading}
                  style={{
                    background: (task.id === 'video' && isAdLoading)
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: (task.id === 'video' && isAdLoading) ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                    transition: 'transform 0.1s ease',
                    opacity: (task.id === 'video' && isAdLoading) ? 0.75 : 1
                  }}
                  onMouseDown={(e) => !(task.id === 'video' && isAdLoading) && (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {task.id === 'video' && isAdLoading ? 'বিজ্ঞাপন লোড হচ্ছে...' : task.action}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Promo Banner: task-page-img.jpg */}
      <div 
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(234, 179, 8, 0.16)',
          lineHeight: 0,
          marginTop: '6px',
          cursor: 'pointer',
          transition: 'transform 0.15s ease'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src={taskPageImg} 
          alt="আরো কাজ করুন আরো টোকেন জিতুন!" 
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            objectFit: 'cover'
          }} 
        />
      </div>

      {/* MODAL 1: Watch Video Simulation */}
      {activeModal === 'video' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#0f172a',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '2px solid #22c55e',
            color: '#fff',
            textAlign: 'center'
          }}>
            {/* Video Mock Player Header */}
            <div style={{
              background: '#1e293b',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#86efac' }}>
                ভিডিও বিজ্ঞাপন স্পনসর
              </span>
              <span style={{
                background: '#ef4444',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '800'
              }}>
                {videoTimer > 0 ? `${videoTimer}s` : 'Reward Ready!'}
              </span>
            </div>

            {/* Video Screen Area */}
            <div style={{
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, #1e3a2f 0%, #064e3b 100%)',
              padding: '20px'
            }}>
              <div className="bounce-coin" style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#713f12',
                border: '3px solid #fff',
                marginBottom: '10px'
              }}>
                ৳
              </div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#fef08a' }}>
                Bengali Pay স্পনসরড ভিডিও
              </p>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                ভিডিও শেষ হওয়া পর্যন্ত অপেক্ষা করুন
              </p>
            </div>

            {/* Bottom action */}
            <div style={{ padding: '16px' }}>
              {videoTimer <= 0 ? (
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#16a34a',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  পুরস্কার ক্লেইম করুন (+১ ৳)
                </button>
              ) : (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  বিজ্ঞাপনটি দেখলে আপনার অ্যাকাউন্টে ১ ৳ যোগ হবে।
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Complete Survey */}
      {activeModal === 'survey' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <ClipboardCheck size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              ছোট জরিপ (Quick Survey)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>
              আপনার পছন্দের মোবাইল ব্যাংকিং কোনটি?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {['bKash (বিকাশ)', 'Nagad (নগদ)', 'Rocket (রকেট)'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSurveyAnswer(opt)}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    border: surveyAnswer === opt ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    background: surveyAnswer === opt ? '#f0fdf4' : '#fff',
                    color: '#1e293b',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              disabled={!surveyAnswer}
              onClick={submitSurvey}
              style={{
                width: '100%',
                padding: '14px',
                background: surveyAnswer ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#cbd5e1',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontWeight: '800',
                fontSize: '15px',
                cursor: surveyAnswer ? 'pointer' : 'not-allowed'
              }}
            >
              জমা দিন ও ৩ ৳ রিওয়ার্ড নিন
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Refer a Friend */}
      {activeModal === 'refer' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <UserPlus size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              রেফার করুন আর ক্যাশ জিতুন!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>
              প্রতি সফল রেফারে পাবেন ৫০ ৳ ক্যাশ রিওয়ার্ড
            </p>

            <div style={{
              background: '#f1f5f9',
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <span style={{
                fontFamily: "'Outfit', monospace",
                fontSize: '18px',
                fontWeight: '800',
                letterSpacing: '1px',
                color: '#0f172a'
              }}>
                BP-ROCKY777
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('BP-ROCKY777');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                earnReward(10, 0, 'রেফারেল টাস্ক বোনাস');
                markTaskDone('refer');
                setActiveModal(null);
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              বন্ধুর সাথে লিংক শেয়ার করুন (+১০ ৳)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Join Telegram Channel */}
      {activeModal === 'tg_channel' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '22px 20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 8px 16px rgba(2, 132, 199, 0.2)'
            }}>
              <Send size={28} style={{ transform: 'translateX(-2px) translateY(1px)' }} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              অফিসিয়াল চ্যানেলে জয়েন করুন!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0', lineHeight: '1.5' }}>
              Bengali Pay-এর অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করে ইনস্ট্যান্ট <span style={{ color: '#16a34a', fontWeight: '800' }}>৫০ ৳</span> ক্যাশ রিওয়ার্ড নিন।
            </p>

            <button
              onClick={() => {
                const tg = getTelegramWebApp();
                if (tg && typeof tg.openTelegramLink === 'function') {
                  tg.openTelegramLink('https://t.me/BengaliPay');
                } else {
                  window.open('https://t.me/BengaliPay', '_blank');
                }
              }}
              style={{
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
              }}
            >
              <Send size={16} />
              <span>১. চ্যানেলে জয়েন করুন</span>
            </button>

            <button
              disabled={isVerifyingChannel}
              onClick={handleVerifyChannelJoin}
              style={{
                width: '100%',
                padding: '13px',
                background: isVerifyingChannel 
                  ? '#cbd5e1' 
                  : 'linear-gradient(135deg, #16a34a, #15803d)',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontWeight: '800',
                fontSize: '14px',
                cursor: isVerifyingChannel ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isVerifyingChannel ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isVerifyingChannel ? 'ভেরিফাই হচ্ছে...' : '২. ভেরিফাই ও ৫০ ৳ নিন'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
