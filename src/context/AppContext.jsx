import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { getUserId, getUserFromFirestore, saveUserToFirestore, recordReferralOnBackend, syncReferralQuotaAPI } from '../firebase';
import { getTelegramUser, getTelegramStartParam } from '../utils/telegram';

const AppContext = createContext();

export const isLegacyDummyNotification = (n) => {
  if (!n) return true;
  const id = String(n.id || '');
  if (['notif_1', 'notif_2', 'notif_3', 'notif_4', 'notif_5', 'notif_6'].includes(id)) return true;
  const title = String(n.title || '').trim();
  if (['Withdraw Requested!', 'Reward Received!', 'Big Update!', 'Withdraw Successful!', 'Special Offer!', 'Referral Bonus!', 'System Message', 'New Notification'].includes(title)) return true;
  const message = String(n.message || '');
  if (message.includes('BKASH') || message.includes('daily reward') || message.includes('spin wheel') || message.includes('has been approved') || message.includes('inviting more friends') || message.includes('Thanks for being with us')) return true;
  return false;
};

export const DAILY_LOGIN_REWARDS = [
  { day: 1, type: 'taka', amount: 5, label: '৫৳' },
  { day: 2, type: 'taka', amount: 15, label: '১৫৳' },
  { day: 3, type: 'taka', amount: 25, label: '২৫৳' },
  { day: 4, type: 'taka', amount: 50, label: '৫০৳' },
  { day: 5, type: 'taka', amount: 100, label: '১০০৳' },
  { day: 6, type: 'taka', amount: 150, label: '১৫০৳' },
  { day: 7, type: 'taka', amount: 200, label: '২০০৳' },
  { day: 8, type: 'taka', amount: 250, label: '২৫০৳' },
  { day: 9, type: 'taka', amount: 300, label: '৩০০৳' },
  { day: 10, type: 'taka', amount: 350, label: '৩৫০৳' },
  { day: 11, type: 'taka', amount: 400, label: '৪০০৳' },
  { day: 12, type: 'taka', amount: 450, label: '৪৫০৳' },
  { day: 13, type: 'taka', amount: 500, label: '৫০০৳' },
  { day: 14, type: 'token', amount: 50, label: '৫০ টোকেন' },
];

export const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayDifference = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const getStreakStatus = (lastDate, streak) => {
  const today = getLocalDateString();
  const diff = getDayDifference(lastDate, today);

  if (!lastDate) {
    return {
      canClaimToday: true,
      currentDayToClaim: 1,
      activeStreak: 0,
      isStreakReset: false
    };
  }

  if (diff === 0) {
    return {
      canClaimToday: false,
      currentDayToClaim: streak || 1,
      activeStreak: streak || 1,
      isStreakReset: false
    };
  }

  if (diff === 1) {
    const nextDay = streak >= 14 ? 1 : streak + 1;
    return {
      canClaimToday: true,
      currentDayToClaim: nextDay,
      activeStreak: streak,
      isStreakReset: false
    };
  }

  // Missed a day! diff > 1 (streak resets back to Day 1)
  return {
    canClaimToday: true,
    currentDayToClaim: 1,
    activeStreak: 0,
    isStreakReset: true
  };
};

export const AppProvider = ({ children }) => {
  // 1. Authenticated Telegram User tracking
  const tgSession = getTelegramUser();
  const activeTgId = tgSession?.id ? String(tgSession.id) : '';
  const initialUid = activeTgId ? `tg_${activeTgId}` : getUserId();
  const [userId, setUserId] = useState(initialUid);

  // Keep userId synchronized if Telegram session resolves after mount
  useEffect(() => {
    const currentTg = getTelegramUser();
    const currentUid = currentTg?.id ? `tg_${currentTg.id}` : getUserId();
    if (currentUid && currentUid !== userId) {
      setUserId(currentUid);
    }
  }, [userId]);

  // Account Switch Detection on shared device/browser:
  // If a DIFFERENT Telegram account or user opens the app on this device,
  // we clear legacy shared keys so the old user's balance and data never leak!
  const lastActiveUid = typeof window !== 'undefined' ? localStorage.getItem('bp_last_active_uid') : null;
  const isAccountSwitched = Boolean(lastActiveUid && lastActiveUid !== initialUid);

  if (isAccountSwitched && typeof window !== 'undefined') {
    const legacyKeys = [
      'bp_balance', 'bp_tokens', 'bp_spins', 'bp_phone',
      'bp_referral_count', 'bp_referral_bonus', 'bp_login_streak',
      'bp_last_login_date', 'bp_notifications', 'bp_tg_id',
      'bp_user_name', 'bp_first_name', 'bp_username', 'bp_user_photo',
      'bp_referral_claimed', 'bp_quota_modal_skip_data'
    ];
    legacyKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }
  if (typeof window !== 'undefined') {
    try { localStorage.setItem('bp_last_active_uid', initialUid); } catch (e) {}
  }

  // User-scoped storage helper functions: strictly isolates data per user ID
  const getUserStorage = (key, fallback = null) => {
    try {
      if (userId) {
        const scoped = localStorage.getItem(`bp_${userId}_${key}`);
        if (scoped !== null) return scoped;
      }
      if (!lastActiveUid || lastActiveUid === userId) {
        return localStorage.getItem(`bp_${key}`);
      }
    } catch (e) {}
    return fallback;
  };

  const setUserStorage = (key, val) => {
    try {
      if (userId) {
        localStorage.setItem(`bp_${userId}_${key}`, String(val));
      }
      localStorage.setItem(`bp_${key}`, String(val));
    } catch (e) {}
  };

  const isLoaded = useRef(false);
  const lastSavedJson = useRef('');
  const saveTimerRef = useRef(null);

  // String Telegram ID tracking (pure numeric string or empty if web)
  const [userTelegramId, setUserTelegramId] = useState(() => {
    if (tgSession?.id) {
      const sId = String(tgSession.id);
      setUserStorage('tg_id', sId);
      return sId;
    }
    return getUserStorage('tg_id', '') || '';
  });

  // User Telegram Name tracking
  const [userName, setUserName] = useState(() => {
    if (tgSession?.fullName) {
      setUserStorage('user_name', tgSession.fullName);
      return tgSession.fullName;
    }
    return getUserStorage('user_name', 'Rocky') || 'Rocky';
  });

  // User First Name for greetings ("Hi, {firstName}")
  const [userFirstName, setUserFirstName] = useState(() => {
    if (tgSession?.firstName) {
      setUserStorage('first_name', tgSession.firstName);
      return tgSession.firstName;
    }
    return getUserStorage('first_name', 'Rocky') || 'Rocky';
  });

  // User Telegram @username
  const [userUsername, setUserUsername] = useState(() => {
    if (tgSession?.username) {
      setUserStorage('username', tgSession.username);
      return tgSession.username;
    }
    return getUserStorage('username', '') || '';
  });

  // User Telegram profile avatar
  const [userPhoto, setUserPhoto] = useState(() => {
    if (tgSession?.photoUrl) {
      setUserStorage('user_photo', tgSession.photoUrl);
      return tgSession.photoUrl;
    }
    return getUserStorage('user_photo', '/assets/mascot_boy.jpg') || '/assets/mascot_boy.jpg';
  });

  // Real database-driven states (starting clean for actual accounts, 100 ৳ default welcome bonus for new accounts)
  const [balance, setBalance] = useState(() => {
    const saved = getUserStorage('balance');
    return saved !== null ? parseFloat(saved) : 100.00;
  });

  const [tokens, setTokens] = useState(() => {
    const saved = getUserStorage('tokens');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [spinsLeft, setSpinsLeft] = useState(() => {
    const saved = getUserStorage('spins');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const [userPhone, setUserPhone] = useState(() => {
    return getUserStorage('phone', '') || '';
  });

  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [deviceView, setDeviceView] = useState('frame'); // 'frame' or 'fullscreen'
  const [soundOn, setSoundOn] = useState(true);

  const [referralCount, setReferralCount] = useState(() => {
    const saved = getUserStorage('referral_count');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [referralBonus, setReferralBonus] = useState(() => {
    const saved = getUserStorage('referral_bonus');
    return saved !== null ? parseFloat(saved) : 0;
  });

  // 14-Day Login Streak states
  const [loginStreak, setLoginStreak] = useState(() => {
    const saved = getUserStorage('login_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastLoginDate, setLastLoginDate] = useState(() => {
    return getUserStorage('last_login_date', null);
  });

  const [showDailyLoginModal, setShowDailyLoginModal] = useState(false);

  // Daily check-in state (synced with streak)
  const streakStatus = getStreakStatus(lastLoginDate, loginStreak);
  const [dailyClaimed, setDailyClaimed] = useState(!streakStatus.canClaimToday);

  // Real Transactions list (starts clean from DB)
  const [transactions, setTransactions] = useState([]);

  // Notifications State (Clean real notifications, empty by default, synced with Firestore)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = getUserStorage('notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(n => !isLegacyDummyNotification(n));
          return clean;
        }
      }
    } catch (e) {}
    return [];
  });

  const unreadNotificationsCount = notifications.filter(n => !isLegacyDummyNotification(n) && !n.read).length;

  const markNotificationAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setUserStorage('notifications', JSON.stringify(updated));
      saveUserToFirestore(userId, { notifications: updated });
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setUserStorage('notifications', JSON.stringify(updated));
      saveUserToFirestore(userId, { notifications: updated });
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUserStorage('notifications', JSON.stringify([]));
    saveUserToFirestore(userId, { notifications: [] });
  };

  // Referral Quota & Account Active Maintenance Algorithm State
  const [referralQuota, setReferralQuota] = useState({
    currentDailyQuota: 1,
    todayReferralCount: 0,
    missedDaysCount: 0,
    accountStatus: 'ACTIVE', // 'ACTIVE' | 'WARNING'
    canWithdraw: true,
    lastEvaluatedDate: '',
    nextResetMs: 0
  });

  const refreshReferralQuota = async () => {
    if (!userId) return;
    try {
      const res = await syncReferralQuotaAPI(userId, userTelegramId);
      if (res && res.success) {
        setReferralQuota({
          currentDailyQuota: res.currentDailyQuota ?? 1,
          todayReferralCount: res.todayReferralCount ?? 0,
          missedDaysCount: res.missedDaysCount ?? 0,
          accountStatus: res.accountStatus ?? 'ACTIVE',
          canWithdraw: res.canWithdraw !== false,
          lastEvaluatedDate: res.todayBD ?? '',
          nextResetMs: res.nextResetMs ?? 0
        });
      }
    } catch (e) {
      console.warn("Could not sync referral quota:", e);
    }
  };

  const addNotification = ({ category = 'rewards', type = 'reward', title = 'নতুন নোটিফিকেশন', message = '' }) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeFormatted = `আজ, ${displayHours}:${displayMinutes} ${ampm}`;

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category,
      type,
      title,
      message,
      time: timeFormatted,
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => {
      // Prevent rapid duplicate clicks
      if (prev.length > 0 && prev[0].title === title && prev[0].message === message && (Date.now() - prev[0].timestamp < 1500)) {
        return prev;
      }
      const updated = [newNotif, ...prev];
      setUserStorage('notifications', JSON.stringify(updated));
      saveUserToFirestore(userId, { notifications: updated });
      return updated;
    });
  };

  // Tasks state (Rewards are strictly in ৳ Taka, Tokens are exclusive to 14-day login streak)
  const [tasks, setTasks] = useState([
    { id: 'video', title: 'Watch 15s Video', reward: '+1 ৳', amount: 1, type: 'taka', action: 'Watch', done: false },
    { id: 'daily', title: 'Daily Check-in', reward: '+5 ৳', amount: 5, type: 'taka', action: 'Claim', done: false },
    { id: 'tg_channel', title: 'Join Telegram Channel', reward: '+50 ৳', amount: 50, type: 'taka', action: 'Join', done: false },
    { id: 'game', title: 'Play Mini Game', reward: '+2 ৳', amount: 2, type: 'taka', action: 'Play', done: false },
    { id: 'refer', title: 'Refer a Friend', reward: '+10 ৳', amount: 10, type: 'taka', action: 'Invite', done: false },
    { id: 'survey', title: 'Complete Survey', reward: '+3 ৳', amount: 3, type: 'taka', action: 'Start', done: false }
  ]);

  // Process incoming referral if opened with ?startapp=<refParam> or Telegram deep link
  useEffect(() => {
    const refParam = getTelegramStartParam();
    const alreadyClaimed = getUserStorage('referral_claimed');
    if (refParam && !alreadyClaimed) {
      const currentUser = tgSession || {
        id: userTelegramId || userId,
        first_name: userName || 'New Friend'
      };
      const curId = String(currentUser.id || userTelegramId || userId);
      if (curId && curId !== String(refParam) && !curId.includes(String(refParam))) {
        recordReferralOnBackend(currentUser, refParam)
          .then((res) => {
            if (res && res.ok) {
              setUserStorage('referral_claimed', 'true');
            }
          })
          .catch(() => {});
      }
    }
  }, [tgSession, userTelegramId, userId, userName]);

  // Fetch remote user data once on mount (Safe single fetch, no infinite loop)
  useEffect(() => {
    let isMounted = true;
    isLoaded.current = false;
    lastSavedJson.current = '';

    getUserFromFirestore(userId)
      .then((remoteData) => {
        if (!isMounted) return;

        if (remoteData) {
          let userBal = remoteData.balance;
          let userTx = Array.isArray(remoteData.transactions) ? remoteData.transactions : [];
          let userNotif = Array.isArray(remoteData.notifications) ? remoteData.notifications : [];

          // If document exists but balance was never initialized: give 100 ৳ Welcome Bonus!
          if (userBal === undefined) {
            userBal = 100.00;
            const welcomeTx = {
              id: 'tx_welcome_' + Date.now(),
              title: 'স্বাগতম বোনাস',
              type: 'earn',
              amount: '+100 ৳',
              date: 'আজ',
              status: 'সফল',
              timestamp: Date.now()
            };
            const welcomeNotif = {
              id: 'notif_welcome_' + Date.now(),
              category: 'rewards',
              type: 'reward',
              title: 'স্বাগতম বোনাস! 🎉',
              message: 'Bengali Pay পরিবারে স্বাগতম! আপনার অ্যাকাউন্টে ১০০ ৳ ওয়েলকাম বোনাস যোগ করা হয়েছে।',
              time: 'এইমাত্র',
              read: false,
              timestamp: Date.now()
            };
            userTx = [welcomeTx, ...userTx];
            userNotif = [welcomeNotif, ...userNotif];
            saveUserToFirestore(userId, {
              balance: userBal,
              welcomeBonusClaimed: true,
              transactions: userTx,
              notifications: userNotif
            });

            // Trigger Welcome Celebration
            if (!getUserStorage('welcome_bonus_shown')) {
              setUserStorage('welcome_bonus_shown', 'true');
              setTimeout(() => {
                try {
                  confetti({
                    particleCount: 90,
                    spread: 70,
                    origin: { y: 0.55 }
                  });
                  sounds.playWin();
                } catch (e) {}
                notifySuccess(
                  'স্বাগতম বোনাস! 🎉',
                  'Bengali Pay পরিবারে স্বাগতম! আপনার অ্যাকাউন্টে ১০০ ৳ ওয়েলকাম বোনাস যুক্ত করা হয়েছে।'
                );
              }, 1200);
            }
          }

          setBalance(userBal);
          setUserStorage('balance', userBal);

          if (remoteData.tokens !== undefined) {
            setTokens(remoteData.tokens);
            setUserStorage('tokens', remoteData.tokens);
          }
          if (remoteData.spinsLeft !== undefined) {
            setSpinsLeft(remoteData.spinsLeft);
            setUserStorage('spins', remoteData.spinsLeft);
          }
          if (remoteData.userLevel !== undefined) setUserLevel(remoteData.userLevel);
          if (remoteData.userXp !== undefined) setUserXp(remoteData.userXp);
          if (remoteData.phone !== undefined) {
            setUserPhone(remoteData.phone);
            setUserStorage('phone', remoteData.phone);
          }
          if (remoteData.dailyClaimed !== undefined) setDailyClaimed(remoteData.dailyClaimed);
          if (remoteData.loginStreak !== undefined) {
            setLoginStreak(remoteData.loginStreak);
            setUserStorage('login_streak', String(remoteData.loginStreak));
          }
          if (remoteData.lastLoginDate !== undefined) {
            setLastLoginDate(remoteData.lastLoginDate);
            setUserStorage('last_login_date', remoteData.lastLoginDate);
          }
          if (remoteData.referralCount !== undefined) {
            setReferralCount(remoteData.referralCount);
            setUserStorage('referral_count', String(remoteData.referralCount));
          }
          if (remoteData.referralBonus !== undefined) {
            setReferralBonus(remoteData.referralBonus);
            setUserStorage('referral_bonus', String(remoteData.referralBonus));
          }
          if (remoteData.referralCompleted) {
            setUserStorage('referral_claimed', 'true');
          }
          setTransactions(userTx);
          setUserStorage('transactions', JSON.stringify(userTx));

          if (Array.isArray(remoteData.tasks)) {
            const defaultTasks = [
              { id: 'video', title: 'Watch 15s Video', reward: '+1 ৳', amount: 1, type: 'taka', action: 'Watch', done: false },
              { id: 'daily', title: 'Daily Check-in', reward: '+5 ৳', amount: 5, type: 'taka', action: 'Claim', done: false },
              { id: 'tg_channel', title: 'Join Telegram Channel', reward: '+50 ৳', amount: 50, type: 'taka', action: 'Join', done: false },
              { id: 'game', title: 'Play Mini Game', reward: '+2 ৳', amount: 2, type: 'taka', action: 'Play', done: false },
              { id: 'refer', title: 'Refer a Friend', reward: '+10 ৳', amount: 10, type: 'taka', action: 'Invite', done: false },
              { id: 'survey', title: 'Complete Survey', reward: '+3 ৳', amount: 3, type: 'taka', action: 'Start', done: false }
            ];
            const normalized = defaultTasks.map(defT => {
              const found = remoteData.tasks.find(t => t.id === defT.id);
              return found ? { ...defT, done: Boolean(found.done) } : defT;
            });
            setTasks(normalized);
          }
          const cleanNotifs = userNotif.filter(n => !isLegacyDummyNotification(n));
          setNotifications(cleanNotifs);
          setUserStorage('notifications', JSON.stringify(cleanNotifs));
          if (cleanNotifs.length !== userNotif.length) {
            saveUserToFirestore(userId, { notifications: cleanNotifs });
          }

          // Restore Telegram metadata if previously tracked in Firestore
          if (remoteData.telegramName && !tgSession?.fullName) setUserName(remoteData.telegramName);
          if (remoteData.telegramFirstName && !tgSession?.firstName) setUserFirstName(remoteData.telegramFirstName);
          if (remoteData.telegramUsername && !tgSession?.username) setUserUsername(remoteData.telegramUsername);
          if (remoteData.photoUrl && !tgSession?.photoUrl) setUserPhoto(remoteData.photoUrl);
          if (remoteData.telegramId && !tgSession?.id) setUserTelegramId(String(remoteData.telegramId));

          // Restore referral quota if available
          if (remoteData.currentDailyQuota !== undefined) {
            setReferralQuota({
              currentDailyQuota: remoteData.currentDailyQuota ?? 1,
              todayReferralCount: remoteData.todayReferralCount ?? 0,
              missedDaysCount: remoteData.missedDaysCount ?? 0,
              accountStatus: remoteData.accountStatus ?? 'ACTIVE',
              canWithdraw: remoteData.canWithdraw !== false,
              lastEvaluatedDate: remoteData.lastEvaluatedDate ?? '',
              nextResetMs: remoteData.nextResetMs ?? 0
            });
          }
        } else {
          // Brand new user document: Start fresh with 100 ৳ Welcome Bonus!
          const welcomeBonus = 100.00;
          setBalance(welcomeBonus);
          setUserStorage('balance', welcomeBonus);
          setTokens(0);
          setSpinsLeft(3);
          setUserLevel(1);
          setUserXp(0);
          setUserPhone('');
          setDailyClaimed(false);
          setLoginStreak(0);
          setLastLoginDate(null);
          setReferralCount(0);
          setReferralBonus(0);

          const initialTransactions = [
            {
              id: 'tx_welcome_' + Date.now(),
              title: 'স্বাগতম বোনাস',
              type: 'earn',
              amount: '+100 ৳',
              date: 'আজ',
              status: 'সফল',
              timestamp: Date.now()
            }
          ];
          setTransactions(initialTransactions);
          setUserStorage('transactions', JSON.stringify(initialTransactions));

          const initialNotifications = [
            {
              id: 'notif_welcome_' + Date.now(),
              category: 'rewards',
              type: 'reward',
              title: 'স্বাগতম বোনাস! 🎉',
              message: 'Bengali Pay পরিবারে স্বাগতম! আপনার অ্যাকাউন্টে ১০০ ৳ ওয়েলকাম বোনাস যোগ করা হয়েছে।',
              time: 'এইমাত্র',
              read: false,
              timestamp: Date.now()
            }
          ];
          setNotifications(initialNotifications);
          setUserStorage('notifications', JSON.stringify(initialNotifications));

          saveUserToFirestore(userId, {
            balance: welcomeBonus,
            tokens: 0,
            spinsLeft: 3,
            userLevel: 1,
            userXp: 0,
            welcomeBonusClaimed: true,
            transactions: initialTransactions,
            notifications: initialNotifications
          });

          // Trigger Welcome Celebration
          if (!getUserStorage('welcome_bonus_shown')) {
            setUserStorage('welcome_bonus_shown', 'true');
            setTimeout(() => {
              try {
                confetti({
                  particleCount: 90,
                  spread: 70,
                  origin: { y: 0.55 }
                });
                sounds.playWin();
              } catch (e) {}
              notifySuccess(
                'স্বাগতম বোনাস! 🎉',
                'Bengali Pay পরিবারে স্বাগতম! আপনার অ্যাকাউন্টে ১০০ ৳ ওয়েলকাম বোনাস যুক্ত করা হয়েছে।'
              );
            }, 1200);
          }
        }

        // Initialize lastSaved snapshot
        const initialPayload = {
          telegramId: String(remoteData?.telegramId ?? userTelegramId ?? ''),
          telegramName: remoteData?.telegramName ?? userName,
          balance: remoteData?.balance ?? (remoteData ? balance : 100.00),
          tokens: remoteData?.tokens ?? (remoteData ? tokens : 0),
          spinsLeft: remoteData?.spinsLeft ?? (remoteData ? spinsLeft : 3),
          userLevel: remoteData?.userLevel ?? (remoteData ? userLevel : 1),
          userXp: remoteData?.userXp ?? (remoteData ? userXp : 0),
          phone: remoteData?.phone ?? (remoteData ? userPhone : ''),
          dailyClaimed: remoteData?.dailyClaimed ?? false,
          loginStreak: remoteData?.loginStreak ?? 0,
          lastLoginDate: remoteData?.lastLoginDate ?? null
        };
        lastSavedJson.current = JSON.stringify(initialPayload);
        isLoaded.current = true;
      })
      .catch((err) => {
        console.warn("Could not load Firestore data, using local storage:", err?.message || err);
        isLoaded.current = true;
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Synchronize Daily Active Referral Quota from Cloud Backend
  useEffect(() => {
    if (userId) {
      refreshReferralQuota();
    }
  }, [userId, userTelegramId]);

  // Sync state to local storage immediately & Firestore with debouncing
  useEffect(() => {
    setUserStorage('balance', balance.toString());
    setUserStorage('tokens', tokens.toString());
    setUserStorage('spins', spinsLeft.toString());
    setUserStorage('phone', userPhone);
    if (userTelegramId) setUserStorage('tg_id', String(userTelegramId));
    if (userName) setUserStorage('user_name', userName);
    if (userFirstName) setUserStorage('first_name', userFirstName);
    if (userUsername) setUserStorage('username', userUsername);
    if (userPhoto) setUserStorage('user_photo', userPhoto);

    // Only save to Firestore if remote load is finished
    if (!isLoaded.current) return;

    // Guaranteed string Telegram ID
    const tgIdString = String(userTelegramId || tgSession?.id || '');

    const currentPayload = {
      telegramId: tgIdString, // Saved explicitly as string in database
      rawTelegramId: tgIdString,
      telegramName: userName,
      telegramFirstName: userFirstName,
      telegramUsername: userUsername,
      photoUrl: userPhoto,
      balance,
      tokens,
      spinsLeft,
      userLevel,
      userXp,
      phone: userPhone,
      dailyClaimed,
      loginStreak,
      lastLoginDate
    };

    const currentJson = JSON.stringify(currentPayload);
    // Don't save if nothing actually changed
    if (currentJson === lastSavedJson.current) return;

    // Debounce save by 2000ms so rapid clicks don't spam Firestore
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      lastSavedJson.current = currentJson;
      saveUserToFirestore(userId, {
        ...currentPayload,
        transactions,
        tasks,
        notifications
      });
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [balance, tokens, spinsLeft, userLevel, userXp, userPhone, dailyClaimed, loginStreak, lastLoginDate, transactions, tasks, notifications, userId, userTelegramId, userName, userFirstName, userUsername, userPhoto, tgSession]);

  // Sync dailyClaimed whenever streakStatus changes
  useEffect(() => {
    setDailyClaimed(!streakStatus.canClaimToday);
  }, [streakStatus.canClaimToday]);

  // Auto-trigger daily login popup on app launch if not claimed today
  useEffect(() => {
    const today = getLocalDateString();
    const diff = getDayDifference(lastLoginDate, today);
    if (diff !== 0) {
      const timer = setTimeout(() => {
        setShowDailyLoginModal(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [lastLoginDate]);

  // Claim Daily Login Reward handler
  const claimDailyLoginReward = () => {
    const status = getStreakStatus(lastLoginDate, loginStreak);
    if (!status.canClaimToday) return false;

    const today = getLocalDateString();
    const dayToClaim = status.currentDayToClaim;
    const rewardItem = DAILY_LOGIN_REWARDS.find(r => r.day === dayToClaim) || DAILY_LOGIN_REWARDS[0];

    // Give reward
    if (rewardItem.type === 'token') {
      earnReward(0, rewardItem.amount, `১৪ দিনের মেগা স্ট্রিক রিওয়ার্ড (Day ${dayToClaim})`);
    } else {
      earnReward(rewardItem.amount, 0, `দৈনিক লগইন রিওয়ার্ড (Day ${dayToClaim})`);
    }

    sounds.playWin();

    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    setLoginStreak(dayToClaim);
    setLastLoginDate(today);
    setDailyClaimed(true);

    setUserStorage('login_streak', String(dayToClaim));
    setUserStorage('last_login_date', today);

    const rewardText = rewardItem.type === 'token' ? `${rewardItem.amount}টি সিগারেট টোকেন` : `৳${rewardItem.amount}`;
    addNotification({
      category: 'rewards',
      type: 'reward',
      title: `ডে ${dayToClaim} লগইন বোনাস! 🎁`,
      message: `আপনি সফলভাবে ডে ${dayToClaim}-এর লগইন রিওয়ার্ড (+${rewardText}) ক্লেইম করেছেন!`
    });

    saveUserToFirestore(userId, {
      loginStreak: dayToClaim,
      lastLoginDate: today,
      dailyClaimed: true
    });

    return true;
  };

  // Sound toggle
  const toggleSound = () => {
    const next = sounds.toggleSound();
    setSoundOn(next);
  };

  // Add earnings
  const earnReward = (takaAmount = 0, tokenAmount = 0, title = 'Reward') => {
    if (takaAmount > 0) {
      setBalance(prev => +(prev + takaAmount).toFixed(2));
    }
    if (tokenAmount > 0) {
      setTokens(prev => prev + tokenAmount);
    }
    sounds.playWin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (takaAmount > 0 || tokenAmount > 0) {
      setTransactions(prev => [
        {
          id: Date.now(),
          title: title,
          amount: takaAmount > 0 ? `+${takaAmount} ৳` : `+${tokenAmount} Token`,
          time: 'Just now',
          icon: 'gift',
          color: 'green'
        },
        ...prev
      ]);

      if (takaAmount > 0) {
        addNotification({
          category: 'rewards',
          type: 'reward',
          title: 'রিওয়ার্ড পেয়েছেন!',
          message: `${title} থেকে +${takaAmount.toFixed(2)} ৳ আপনার ব্যালেন্সে যোগ হয়েছে।`
        });
      } else if (tokenAmount > 0) {
        addNotification({
          category: 'rewards',
          type: 'reward',
          title: 'টোকেন বোনাস যুক্ত হয়েছে!',
          message: `${title} এর জন্য আপনি +${tokenAmount} টি সিগারেট টোকেন পেয়েছেন।`
        });
      }
    }
  };

  // Custom Professional Modal State
  const [modalConfig, setModalConfig] = useState(null);

  const showModal = (config) => {
    setModalConfig(config);
  };

  const closeModal = () => {
    setModalConfig(null);
  };

  const notifySuccess = (title, message, options = {}) => {
    showModal({ type: 'success', title, message, ...options });
  };

  const notifyWarn = (title, message, options = {}) => {
    showModal({ type: 'warn', title, message, ...options });
  };

  const notifyFail = (title, message, options = {}) => {
    showModal({ type: 'fail', title, message, ...options });
  };

  // Quota Lockout State & Modal Control
  const [isQuotaReminderOpen, setIsQuotaReminderOpen] = useState(false);

  const getQuotaCycleDate = () => {
    const now = Date.now();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(now - 6 * 3600 * 1000));
  };

  const getStoredSkipCount = () => {
    try {
      const cycle = getQuotaCycleDate();
      const raw = getUserStorage('quota_modal_skip_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === cycle) {
          return typeof parsed.count === 'number' ? parsed.count : 0;
        }
      }
    } catch (e) {}
    return 0;
  };

  const isQuotaLocked = () => {
    const target = referralQuota?.currentDailyQuota ?? 1;
    const done = referralQuota?.todayReferralCount ?? 0;
    if (done >= target) return false;

    const isPenalized = referralQuota?.accountStatus === 'WARNING' || (referralQuota?.missedDaysCount > 0);
    const skipCount = getStoredSkipCount();
    return isPenalized || skipCount >= 5;
  };

  const navigateTo = (screen) => {
    // If quota mission is strictly locked (skips exhausted or penalty active, quota incomplete)
    if (isQuotaLocked()) {
      // User is ONLY allowed to access 'account-status' and 'invite' (plus initial 'splash')
      if (screen !== 'account-status' && screen !== 'invite' && screen !== 'splash') {
        try {
          sounds.playError?.();
        } catch (e) {}
        // Block navigation and immediately show the locked quota reminder popup!
        setIsQuotaReminderOpen(true);
        return;
      }
    }

    sounds.playClick();
    setCurrentScreen(screen);
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        userTelegramId,
        userName,
        setUserName,
        userFirstName,
        userUsername,
        userPhoto,
        userPhone,
        setUserPhone,
        balance,
        setBalance,
        tokens,
        setTokens,
        spinsLeft,
        setSpinsLeft,
        userLevel,
        userXp,
        currentScreen,
        setCurrentScreen,
        navigateTo,
        isQuotaReminderOpen,
        setIsQuotaReminderOpen,
        isQuotaLocked,
        deviceView,
        setDeviceView,
        soundOn,
        toggleSound,
        transactions,
        setTransactions,
        tasks,
        setTasks,
        dailyClaimed,
        setDailyClaimed,
        dailyLoginRewards: DAILY_LOGIN_REWARDS,
        loginStreak,
        lastLoginDate,
        streakStatus,
        showDailyLoginModal,
        setShowDailyLoginModal,
        claimDailyLoginReward,
        earnReward,
        modalConfig,
        showModal,
        closeModal,
        notifySuccess,
        notifyWarn,
        notifyFail,
        referralCount,
        setReferralCount,
        referralBonus,
        setReferralBonus,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
        referralQuota,
        refreshReferralQuota
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
