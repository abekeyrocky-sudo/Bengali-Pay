import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  ShieldCheck,
  Download,
  Share2,
  Clock,
  History,
  XCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import cigaretteIcon from '../assets/cigarette-icon.png';
import { EmptyState } from './EmptyState';

import { submitWithdrawalToFirestore, subscribeUserWithdrawals } from '../firebase';

export const WithdrawScreen = () => {
  const { 
    userId,
    userPhone,
    setUserPhone,
    balance, 
    setBalance, 
    tokens, 
    setTokens, 
    navigateTo, 
    setTransactions,
    notifySuccess,
    notifyWarn,
    notifyFail,
    addNotification
  } = useApp();

  const [method, setMethod] = useState('bkash'); // 'bkash' or 'nagad'
  const [phone, setPhone] = useState(userPhone || '');
  const [amount, setAmount] = useState('500');
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Auto-fill phone if loaded from DB
  useEffect(() => {
    if (userPhone && !phone) {
      setPhone(userPhone);
    }
  }, [userPhone]);

  // Real-time listen to user's withdrawals in Firestore
  useEffect(() => {
    const unsubscribe = subscribeUserWithdrawals(userId, (list) => {
      setWithdrawalsList(list);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleWithdraw = async () => {
    setErrorMsg('');

    // Phone validation
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('01') || cleanPhone.length < 11) {
      const err = 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)';
      setErrorMsg(err);
      notifyFail('ভুল মোবাইল নম্বর!', err);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      const err = 'সর্বনিম্ন উইথড্র পরিমাণ ৫০০ টাকা (৳ 500)';
      setErrorMsg(err);
      notifyFail('সর্বনিম্ন পরিমাণ ৫০০ ৳!', err);
      return;
    }

    if (numAmount > 25000) {
      const err = 'সর্বোচ্চ উইথড্র সীমা ২৫,০০০ টাকা (৳ 25,000)';
      setErrorMsg(err);
      notifyFail('সর্বোচ্চ সীমা ২৫,০০০ ৳!', err);
      return;
    }

    // Real database token check (Required: 50 Tokens)
    if (tokens < 50) {
      const msg = `উইথড্র করতে ন্যূনতম ৫০টি টোকেন প্রয়োজন! (আপনার বর্তমান ব্যালেন্স: ${tokens})`;
      setErrorMsg(msg);
      notifyWarn('অপর্যাপ্ত টোকেন!', msg, {
        confirmText: 'টাস্ক সম্পন্ন করুন',
        onConfirm: () => navigateTo('tasks'),
        cancelText: 'বন্ধ করুন'
      });
      return;
    }

    // Real database balance check
    if (balance < numAmount) {
      const msg = `আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই! (বর্তমান ব্যালেন্স: ৳${balance.toFixed(2)}, তুলতে চেয়েছেন: ৳${numAmount})`;
      setErrorMsg(msg);
      notifyWarn('অপর্যাপ্ত ব্যালেন্স!', msg);
      return;
    }

    setIsSubmitting(true);

    const trxId = 'TRX' + Math.floor(10000000 + Math.random() * 90000000);
    const dateFormatted = new Date().toLocaleDateString('bn-BD') + ' ' + new Date().toLocaleTimeString();

    // Deduct state & remember phone
    const newBal = Math.max(0, +(balance - numAmount).toFixed(2));
    const newTok = Math.max(0, tokens - 50);
    setBalance(newBal);
    setTokens(newTok);
    setUserPhone(cleanPhone);

    setTransactions(prev => [
      {
        id: Date.now(),
        title: `${method === 'bkash' ? 'bKash' : 'Nagad'} Withdraw`,
        amount: `-${numAmount} ৳`,
        time: 'Just now',
        icon: 'check',
        color: 'pink'
      },
      ...prev
    ]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Real submission to Firebase DB
    const res = await submitWithdrawalToFirestore({
      userId,
      trxId,
      method: method === 'bkash' ? 'bKash' : 'Nagad',
      phone: cleanPhone,
      amount: numAmount,
      status: 'pending',
      dateString: dateFormatted
    });

    setIsSubmitting(false);

    if (res.success) {
      if (typeof addNotification === 'function') {
        addNotification({
          category: 'rewards',
          type: 'withdraw',
          title: 'উইথড্র আবেদন জমা হয়েছে!',
          message: `${numAmount} ৳ উত্তোলনের আবেদন (${method.toUpperCase()}) সফলভাবে জমা হয়েছে।`
        });
      }

      notifySuccess(
        'উইথড্র আবেদন সফল!',
        `আপনার ৳${numAmount} টাকা উত্তোলনের আবেদন সফলভাবে ফায়ারবেস ডেটাবেজে জমা হয়েছে। ট্রানজেকশন আইডি: ${trxId}`
      );

      setSuccessReceipt({
        trxId,
        method: method === 'bkash' ? 'bKash' : 'Nagad',
        phone: cleanPhone,
        amount: numAmount,
        date: dateFormatted
      });
    } else {
      notifyFail('ব্যর্থ হয়েছে!', 'উইথড্র রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করুন।');
    }
  };

  return (
    <div style={{
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigateTo('wallet')}
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
            <ArrowLeft size={18} color="#334155" />
          </button>

          <h2 style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Withdraw
          </h2>
        </div>

        {/* Top-Right History Button */}
        <button
          onClick={() => setShowHistoryModal(true)}
          title="উত্তোলন ইতিহাস"
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
            position: 'relative',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.1s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <History size={19} color="#16a34a" />
          {withdrawalsList.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#16a34a',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: '900',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.4)',
              border: '1.5px solid #ffffff'
            }}>
              {withdrawalsList.length}
            </span>
          )}
        </button>
      </div>

      {/* Available Balance Box */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '18px 20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9'
      }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
          Available Balance
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
          marginTop: '2px'
        }}>
          <span style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#16a34a',
            fontFamily: "'Noto Serif Bengali', serif"
          }}>
            ৳
          </span>
          <span style={{
            fontSize: '34px',
            fontWeight: '900',
            letterSpacing: '-0.5px',
            fontFamily: "'Outfit', sans-serif",
            color: '#0f172a'
          }}>
            {balance.toFixed(2)}
          </span>
        </div>

        {/* Token mini-tag with 2x larger cigarette icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '6px'
        }}>
          <img 
            src={cigaretteIcon} 
            alt="Cigarette Token" 
            style={{ 
              width: '46px', 
              height: '46px', 
              objectFit: 'contain',
              transform: 'scale(1.25)',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.12))',
              flexShrink: 0
            }} 
          />
          <span style={{ 
            fontSize: '15px', 
            fontWeight: '800', 
            color: '#dc2626',
            letterSpacing: '0.2px',
            fontFamily: "'Noto Serif Bengali', serif"
          }}>
            {tokens} সিগারেট টোকেন
          </span>
        </div>
      </div>

      {/* Withdraw Limit Alert Banner with 3x larger cigarette icon */}
      <div style={{
        background: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)',
        borderRadius: '20px',
        padding: '16px 20px',
        border: '1.5px solid #fde047',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '92px',
        boxShadow: '0 4px 14px rgba(234, 179, 8, 0.12)',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#854d0e', fontFamily: "'Noto Serif Bengali', serif" }}>
            উইথড্র লিমিট (Withdraw Limit)
          </span>
          <p style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#15803d',
            fontFamily: "'Outfit', 'Noto Serif Bengali', serif, sans-serif",
            lineHeight: '1.2',
            margin: '2px 0'
          }}>
            ৳ 500 - 25,000
          </p>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#b45309',
            marginTop: '1px',
            display: 'block'
          }}>
            Required: 50 Cigarette Token
          </span>
        </div>

        {/* 3x Larger Cigarette Mascot Icon */}
        <div style={{
          width: '76px',
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <img 
            src={cigaretteIcon} 
            alt="Cigarette Token" 
            style={{
              width: '76px',
              height: '76px',
              objectFit: 'contain',
              transform: 'scale(1.6)',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))'
            }}
          />
        </div>
      </div>

      {/* Select Withdraw Method (2-Column Grid) */}
      <div>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '10px'
        }}>
          Select Withdraw Method
        </h4>

        {/* 2-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {/* bKash Option */}
          <div
            onClick={() => setMethod('bkash')}
            style={{
              background: method === 'bkash' ? '#fdf2f8' : '#ffffff',
              borderRadius: '16px',
              padding: '12px 14px',
              border: method === 'bkash' ? '2px solid #e2136e' : '1.5px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: method === 'bkash' ? '0 4px 16px rgba(226, 19, 110, 0.14)' : '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '72px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: '46px',
                height: '28px',
                borderRadius: '8px',
                background: '#e2136e',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '12px',
                fontFamily: "'Outfit', sans-serif"
              }}>
                bKash
              </div>

              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: method === 'bkash' ? '6px solid #16a34a' : '2px solid #cbd5e1',
                background: '#fff',
                transition: 'border 0.15s ease'
              }} />
            </div>

            <div style={{ marginTop: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'block' }}>
                bKash
              </span>
            </div>
          </div>

          {/* Nagad Option */}
          <div
            onClick={() => setMethod('nagad')}
            style={{
              background: method === 'nagad' ? '#fff7ed' : '#ffffff',
              borderRadius: '16px',
              padding: '12px 14px',
              border: method === 'nagad' ? '2px solid #f97316' : '1.5px solid #e2e8f0',
              cursor: 'pointer',
              boxShadow: method === 'nagad' ? '0 4px 16px rgba(249, 115, 22, 0.14)' : '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '72px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: '46px',
                height: '28px',
                borderRadius: '8px',
                background: '#f97316',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '12px',
                fontFamily: "'Outfit', sans-serif"
              }}>
                Nagad
              </div>

              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: method === 'nagad' ? '6px solid #16a34a' : '2px solid #cbd5e1',
                background: '#fff',
                transition: 'border 0.15s ease'
              }} />
            </div>

            <div style={{ marginTop: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'block' }}>
                Nagad
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account number input */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        padding: '14px 16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
          {method === 'bkash' ? 'bKash' : 'Nagad'} নম্বর (১১ ডিজিট)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} color="#94a3b8" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: "'Outfit', monospace",
              color: '#0f172a',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Withdraw Amount Input Form (500৳ - 25,000৳) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        padding: '14px 16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
            উত্তোলন পরিমাণ
          </label>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
            ৳ 500 - 25,000
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          padding: '10px 14px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#16a34a',
            fontFamily: "'Noto Serif Bengali', serif"
          }}>
            ৳
          </span>
          <input
            type="number"
            min="500"
            max="25000"
            step="50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '20px',
              fontWeight: '800',
              fontFamily: "'Outfit', sans-serif",
              color: '#0f172a',
              background: 'transparent'
            }}
          />
        </div>

        {/* Quick Amount Suggestion Chips */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginTop: '10px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none'
        }}>
          {['500', '1000', '2000', '5000', '10000', '25000'].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              style={{
                flexShrink: 0,
                padding: '5px 10px',
                borderRadius: '10px',
                border: String(amount) === amt ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                background: String(amount) === amt ? '#dcfce7' : '#ffffff',
                color: String(amount) === amt ? '#15803d' : '#475569',
                fontSize: '11.5px',
                fontWeight: '800',
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ৳{parseInt(amt).toLocaleString()}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const maxPossible = Math.min(25000, Math.floor(balance));
              setAmount(String(maxPossible >= 500 ? maxPossible : 500));
            }}
            style={{
              flexShrink: 0,
              padding: '5px 10px',
              borderRadius: '10px',
              border: '1px solid #fed7aa',
              background: '#fff7ed',
              color: '#ea580c',
              fontSize: '11.5px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Max
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px dashed #e2e8f0'
        }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
            উইথড্র ফি: <strong style={{ color: '#16a34a' }}>৳ ০.০০ (ফ্রি)</strong>
          </span>
          <div style={{
            fontSize: '11.5px',
            color: '#dc2626',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>প্রয়োজন: 50</span>
            <img 
              src={cigaretteIcon} 
              alt="Token" 
              style={{
                width: '18px',
                height: '18px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))'
              }}
            />
          </div>
        </div>
      </div>

      {/* Error message alert */}
      {errorMsg && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#dc2626',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          <AlertTriangle size={18} flexShrink={0} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '16px',
          background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #16a34a, #15803d)',
          border: 'none',
          borderRadius: '18px',
          color: '#fff',
          fontSize: '17px',
          fontWeight: '800',
          fontFamily: "'Outfit', sans-serif",
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
          transition: 'transform 0.1s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isSubmitting ? 'প্রসেসিং হচ্ছে...' : `Withdraw ৳${amount || '500'}`}
      </button>

      {/* Bangladesh User Notice Note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: '#fffbeb',
        borderRadius: '14px',
        border: '1px solid #fef3c7'
      }}>
        <AlertTriangle size={16} color="#d97706" />
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#b45309'
        }}>
          Only bKash or Nagad available (For Bangladeshi Users)
        </span>
      </div>

      {/* Withdrawal History Popup Window Modal */}
      {showHistoryModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 400,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
            animation: 'modalFadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHistoryModal(false);
          }}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: '80vh',
              background: '#ffffff',
              borderRadius: '26px',
              padding: '22px 18px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <History size={18} color="#16a34a" />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#0f172a',
                    fontFamily: "'Noto Serif Bengali', serif",
                    lineHeight: '1.2'
                  }}>
                    উত্তোলন ইতিহাস
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Withdrawal History ({withdrawalsList.length})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
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
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Scrollable List */}
            <div style={{
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '2px'
            }}>
              {withdrawalsList.length === 0 ? (
                <EmptyState 
                  title="কোনো হিস্ট্রি নেই"
                  subtitle="উইথড্র রিকোয়েস্ট জমা দিলে তার বিবরণ ও স্ট্যাটাস এখানে দেখতে পাবেন।"
                  animationSize={140}
                  style={{ padding: '16px 8px', background: 'transparent' }}
                />
              ) : (
                withdrawalsList.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '800',
                          color: item.method === 'bKash' ? '#e2136e' : '#f97316',
                          background: item.method === 'bKash' ? '#fdf2f8' : '#fff7ed',
                          padding: '2px 6px',
                          borderRadius: '6px'
                        }}>
                          {item.method}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#0f172a',
                          fontFamily: "'Outfit', monospace"
                        }}>
                          {item.phone}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        display: 'block',
                        marginTop: '3px'
                      }}>
                        {item.dateString || 'Just now'} • {item.trxId}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '900',
                        color: '#0f172a',
                        fontFamily: "'Outfit', sans-serif",
                        display: 'block'
                      }}>
                        ৳ {item.amount}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        display: 'inline-block',
                        marginTop: '2px',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: item.status === 'completed' || item.status === 'approved' 
                          ? '#dcfce7' 
                          : item.status === 'rejected' 
                          ? '#fee2e2' 
                          : '#fef3c7',
                        color: item.status === 'completed' || item.status === 'approved' 
                          ? '#15803d' 
                          : item.status === 'rejected' 
                          ? '#b91c1c' 
                          : '#b45309'
                      }}>
                        {item.status === 'completed' || item.status === 'approved' 
                          ? 'অনুমোদিত' 
                          : item.status === 'rejected' 
                          ? 'বাতিল' 
                          : 'অপেক্ষমাণ'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '14px',
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Receipt Modal */}
      {successReceipt && (
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
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
              উইথড্র রিকোয়েস্ট সফল!
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              আপনার টাকা ২৪ ঘণ্টার মধ্যে পাঠিয়ে দেওয়া হবে।
            </p>

            {/* Receipt Box */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '16px',
              margin: '16px 0',
              textAlign: 'left',
              fontSize: '13px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Trx ID:</span>
                <span style={{ fontWeight: '800', fontFamily: 'monospace' }}>{successReceipt.trxId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>পদ্ধতি:</span>
                <span style={{ fontWeight: '800', color: successReceipt.method === 'bKash' ? '#e2136e' : '#f97316' }}>
                  {successReceipt.method}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>নম্বর:</span>
                <span style={{ fontWeight: '700' }}>{successReceipt.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>পরিমাণ:</span>
                <span style={{ fontWeight: '900', color: '#16a34a', fontSize: '16px' }}>
                  ৳ {successReceipt.amount}.00
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessReceipt(null);
                navigateTo('wallet');
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer'
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
