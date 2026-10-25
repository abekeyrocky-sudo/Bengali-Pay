import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  ArrowLeft
} from 'lucide-react';
import cigaretteIcon from '../assets/cigarette-icon.png';
import taskPageImg from '../assets/task-page-img.jpg';

export const TasksScreen = () => {
  const { 
    tokens, 
    tasks, 
    setTasks, 
    earnReward, 
    navigateTo, 
    dailyClaimed, 
    setDailyClaimed,
    notifySuccess,
    notifyWarn
  } = useApp();

  // Active modal state: null | 'video' | 'survey' | 'refer'
  const [activeModal, setActiveModal] = useState(null);
  const [videoTimer, setVideoTimer] = useState(15);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Survey state
  const [surveyStep, setSurveyStep] = useState(1);
  const [surveyAnswer, setSurveyAnswer] = useState('');

  // Handle Video Watch
  const startVideoTask = () => {
    setActiveModal('video');
    setVideoTimer(15);
    setIsVideoPlaying(true);

    let current = 15;
    const interval = setInterval(() => {
      current -= 1;
      setVideoTimer(current);
      if (current <= 0) {
        clearInterval(interval);
        setIsVideoPlaying(false);
        setActiveModal(null);
        earnReward(1, 1, 'Watch Video Reward');
        markTaskDone('video');
        notifySuccess('ভিডিও টাস্ক সম্পন্ন!', '+১ ৳ ও +১টি টোকেন সফলভাবে আপনার অ্যাকাউন্টে যোগ হয়েছে!');
      }
    }, 1000);
  };

  // Mark task as done
  const markTaskDone = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
  };

  // Handle Daily check-in
  const handleDailyCheckin = () => {
    if (!dailyClaimed) {
      setDailyClaimed(true);
      earnReward(5, 5, 'Daily Check-in Bonus');
      markTaskDone('daily');
      notifySuccess('দৈনিক বোনাস সফল!', '+৫ ৳ ও +৫টি টোকেন আপনার ওয়ালেটে যুক্ত হয়েছে!');
    } else {
      notifyWarn('ইতিমধ্যে ক্লেইম করেছেন!', 'আজকের দৈনিক বোনাস আপনি ইতিমধ্যে নিয়ে নিয়েছেন। আগামীকাল আবার চেক করুন!');
    }
  };

  // Handle Survey submit
  const submitSurvey = () => {
    earnReward(3, 3, 'Survey Completed Reward');
    markTaskDone('survey');
    setActiveModal(null);
    notifySuccess('সার্ভে সম্পন্ন!', '+৩ ৳ ও +৩টি টোকেন সফলভাবে অ্যাকাউন্টে যোগ হয়েছে!');
  };

  const getTaskIcon = (icon) => {
    switch (icon) {
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
    if (task.id === 'video') startVideoTask();
    else if (task.id === 'daily') handleDailyCheckin();
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
            Earn Tokens
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

      {/* Tasks List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {tasks.map((task) => {
          const isDone = task.done || (task.id === 'daily' && dailyClaimed);

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
                    textDecoration: isDone ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#16a34a',
                    marginTop: '2px'
                  }}>
                    {task.reward}
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
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                    transition: 'transform 0.1s ease'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {task.action}
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
                  পুরস্কার ক্লেইম করুন (+1 ৳ Token)
                </button>
              ) : (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  বিজ্ঞাপনটি দেখলে আপনার অ্যাকাউন্টে ১টি টোকেন যোগ হবে।
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
              জমা দিন ও ৩টি টোকেন নিন
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
              রেফার করুন আর টোকেন জিতুন!
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>
              প্রতি রেফারে পাবেন ১০টি ফ্রি টোকেন
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
                earnReward(0, 10, 'Referral Bonus');
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
              বন্ধুর সাথে লিংক শেয়ার করুন (+10)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
