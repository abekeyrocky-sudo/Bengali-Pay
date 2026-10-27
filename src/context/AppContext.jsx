import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { getUserId, getUserFromFirestore, saveUserToFirestore, recordReferralOnBackend } from '../firebase';
import { getTelegramUser, getTelegramStartParam } from '../utils/telegram';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userId] = useState(() => getUserId());
  const isLoaded = useRef(false);
  const lastSavedJson = useRef('');
  const saveTimerRef = useRef(null);

  // Authenticated Telegram User tracking
  const [tgSession] = useState(() => getTelegramUser());

  // String Telegram ID tracking (pure numeric string or empty if web)
  const [userTelegramId, setUserTelegramId] = useState(() => {
    if (tgSession?.id) {
      const sId = String(tgSession.id);
      localStorage.setItem('bp_tg_id', sId);
      return sId;
    }
    return localStorage.getItem('bp_tg_id') || '';
  });

  // User Telegram Name tracking
  const [userName, setUserName] = useState(() => {
    if (tgSession?.fullName) {
      localStorage.setItem('bp_user_name', tgSession.fullName);
      return tgSession.fullName;
    }
    return localStorage.getItem('bp_user_name') || 'Rocky';
  });

  // User First Name for greetings ("Hi, {firstName}")
  const [userFirstName, setUserFirstName] = useState(() => {
    if (tgSession?.firstName) {
      localStorage.setItem('bp_first_name', tgSession.firstName);
      return tgSession.firstName;
    }
    return localStorage.getItem('bp_first_name') || 'Rocky';
  });

  // User Telegram @username
  const [userUsername, setUserUsername] = useState(() => {
    if (tgSession?.username) {
      localStorage.setItem('bp_username', tgSession.username);
      return tgSession.username;
    }
    return localStorage.getItem('bp_username') || '';
  });

  // User Telegram profile avatar
  const [userPhoto, setUserPhoto] = useState(() => {
    if (tgSession?.photoUrl) {
      localStorage.setItem('bp_user_photo', tgSession.photoUrl);
      return tgSession.photoUrl;
    }
    return localStorage.getItem('bp_user_photo') || '/assets/mascot_boy.jpg';
  });

  // Real database-driven states (starting clean for actual accounts)
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('bp_balance');
    return saved !== null ? parseFloat(saved) : 0.00;
  });

  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('bp_tokens');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [spinsLeft, setSpinsLeft] = useState(() => {
    const saved = localStorage.getItem('bp_spins');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const [userPhone, setUserPhone] = useState(() => {
    return localStorage.getItem('bp_phone') || '';
  });

  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [deviceView, setDeviceView] = useState('frame'); // 'frame' or 'fullscreen'
  const [soundOn, setSoundOn] = useState(true);

  const [referralCount, setReferralCount] = useState(() => {
    const saved = localStorage.getItem('bp_referral_count');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [referralBonus, setReferralBonus] = useState(() => {
    const saved = localStorage.getItem('bp_referral_bonus');
    return saved !== null ? parseFloat(saved) : 0;
  });

  // Daily check-in state
  const [dailyClaimed, setDailyClaimed] = useState(false);

  // Real Transactions list (starts clean from DB)
  const [transactions, setTransactions] = useState([]);

  // Notifications State (Clean real notifications, empty by default, synced with Firestore)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('bp_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy dummy English mock notifications
          const clean = parsed.filter(n => 
            !n.id?.startsWith('notif_1') && 
            !n.id?.startsWith('notif_2') && 
            !n.id?.startsWith('notif_3') && 
            !n.id?.startsWith('notif_4') && 
            !n.id?.startsWith('notif_5') && 
            !n.id?.startsWith('notif_6') &&
            n.title !== 'Withdraw Requested!' &&
            n.title !== 'Reward Received!' &&
            n.title !== 'Big Update!' &&
            n.title !== 'Withdraw Successful!' &&
            n.title !== 'Special Offer!' &&
            n.title !== 'Referral Bonus!' &&
            n.title !== 'System Message'
          );
          return clean;
        }
      }
    } catch (e) {}
    return [];
  });

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('bp_notifications', JSON.stringify(updated));
      saveUserToFirestore(userId, { notifications: updated });
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('bp_notifications', JSON.stringify(updated));
      saveUserToFirestore(userId, { notifications: updated });
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('bp_notifications', JSON.stringify([]));
    saveUserToFirestore(userId, { notifications: [] });
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
      localStorage.setItem('bp_notifications', JSON.stringify(updated));
      saveUserToFirestore(userId, { notifications: updated });
      return updated;
    });
  };

  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 'video', title: 'Watch 15s Video', reward: '+1 ৳ Token', amount: 1, type: 'token', action: 'Watch', done: false },
    { id: 'daily', title: 'Daily Check-in', reward: '+5 ৳ Token', amount: 5, type: 'token', action: 'Claim', done: false },
    { id: 'game', title: 'Play Mini Game', reward: '+2 ৳ Token', amount: 2, type: 'token', action: 'Play', done: false },
    { id: 'refer', title: 'Refer a Friend', reward: '+10 ৳ Token', amount: 10, type: 'token', action: 'Invite', done: false },
    { id: 'survey', title: 'Complete Survey', reward: '+3 ৳ Token', amount: 3, type: 'token', action: 'Start', done: false }
  ]);

  // Process incoming referral if opened with ?startapp=<refParam> or Telegram deep link
  useEffect(() => {
    const refParam = getTelegramStartParam();
    const alreadyClaimed = localStorage.getItem('bp_referral_claimed');
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
              localStorage.setItem('bp_referral_claimed', 'true');
            }
          })
          .catch(() => {});
      }
    }
  }, [tgSession, userTelegramId, userId, userName]);

  // Fetch remote user data once on mount (Safe single fetch, no infinite loop)
  useEffect(() => {
    let isMounted = true;

    getUserFromFirestore(userId)
      .then((remoteData) => {
        if (!isMounted) return;

        if (remoteData) {
          if (remoteData.balance !== undefined) setBalance(remoteData.balance);
          if (remoteData.tokens !== undefined) setTokens(remoteData.tokens);
          if (remoteData.spinsLeft !== undefined) setSpinsLeft(remoteData.spinsLeft);
          if (remoteData.userLevel !== undefined) setUserLevel(remoteData.userLevel);
          if (remoteData.userXp !== undefined) setUserXp(remoteData.userXp);
          if (remoteData.phone !== undefined) setUserPhone(remoteData.phone);
          if (remoteData.dailyClaimed !== undefined) setDailyClaimed(remoteData.dailyClaimed);
          if (remoteData.referralCount !== undefined) {
            setReferralCount(remoteData.referralCount);
            localStorage.setItem('bp_referral_count', String(remoteData.referralCount));
          }
          if (remoteData.referralBonus !== undefined) {
            setReferralBonus(remoteData.referralBonus);
            localStorage.setItem('bp_referral_bonus', String(remoteData.referralBonus));
          }
          if (Array.isArray(remoteData.transactions)) setTransactions(remoteData.transactions);
          if (Array.isArray(remoteData.tasks)) setTasks(remoteData.tasks);
          if (Array.isArray(remoteData.notifications) && remoteData.notifications.length > 0) {
            setNotifications(remoteData.notifications);
            localStorage.setItem('bp_notifications', JSON.stringify(remoteData.notifications));
          } else if (remoteData && !remoteData.notifications) {
            saveUserToFirestore(userId, { notifications: DEFAULT_NOTIFICATIONS });
          }

          // Restore Telegram metadata if previously tracked in Firestore
          if (remoteData.telegramName && !tgSession?.fullName) setUserName(remoteData.telegramName);
          if (remoteData.telegramFirstName && !tgSession?.firstName) setUserFirstName(remoteData.telegramFirstName);
          if (remoteData.telegramUsername && !tgSession?.username) setUserUsername(remoteData.telegramUsername);
          if (remoteData.photoUrl && !tgSession?.photoUrl) setUserPhoto(remoteData.photoUrl);
          if (remoteData.telegramId && !tgSession?.id) setUserTelegramId(String(remoteData.telegramId));
        }

        // Initialize lastSaved snapshot
        const initialPayload = {
          telegramId: String(remoteData?.telegramId ?? userTelegramId ?? ''),
          telegramName: remoteData?.telegramName ?? userName,
          balance: remoteData?.balance ?? balance,
          tokens: remoteData?.tokens ?? tokens,
          spinsLeft: remoteData?.spinsLeft ?? spinsLeft,
          userLevel: remoteData?.userLevel ?? userLevel,
          userXp: remoteData?.userXp ?? userXp,
          phone: remoteData?.phone ?? userPhone,
          dailyClaimed: remoteData?.dailyClaimed ?? dailyClaimed
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
  }, [userId, tgSession]);

  // Sync state to local storage immediately & Firestore with debouncing
  useEffect(() => {
    localStorage.setItem('bp_balance', balance.toString());
    localStorage.setItem('bp_tokens', tokens.toString());
    localStorage.setItem('bp_spins', spinsLeft.toString());
    localStorage.setItem('bp_phone', userPhone);
    if (userTelegramId) localStorage.setItem('bp_tg_id', String(userTelegramId));
    if (userName) localStorage.setItem('bp_user_name', userName);
    if (userFirstName) localStorage.setItem('bp_first_name', userFirstName);
    if (userUsername) localStorage.setItem('bp_username', userUsername);
    if (userPhoto) localStorage.setItem('bp_user_photo', userPhoto);

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
      dailyClaimed
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
  }, [balance, tokens, spinsLeft, userLevel, userXp, userPhone, dailyClaimed, transactions, tasks, notifications, userId, userTelegramId, userName, userFirstName, userUsername, userPhoto, tgSession]);

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

  const navigateTo = (screen) => {
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
        addNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
