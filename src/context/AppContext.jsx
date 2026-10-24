import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { getUserId, getUserFromFirestore, saveUserToFirestore } from '../firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userId] = useState(() => getUserId());
  const isLoaded = useRef(false);
  const lastSavedJson = useRef('');
  const saveTimerRef = useRef(null);

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

  // Daily check-in state
  const [dailyClaimed, setDailyClaimed] = useState(false);

  // Real Transactions list (starts clean from DB)
  const [transactions, setTransactions] = useState([]);

  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 'video', title: 'Watch 15s Video', reward: '+1 ৳ Token', amount: 1, type: 'token', action: 'Watch', done: false },
    { id: 'daily', title: 'Daily Check-in', reward: '+5 ৳ Token', amount: 5, type: 'token', action: 'Claim', done: false },
    { id: 'game', title: 'Play Mini Game', reward: '+2 ৳ Token', amount: 2, type: 'token', action: 'Play', done: false },
    { id: 'refer', title: 'Refer a Friend', reward: '+10 ৳ Token', amount: 10, type: 'token', action: 'Invite', done: false },
    { id: 'survey', title: 'Complete Survey', reward: '+3 ৳ Token', amount: 3, type: 'token', action: 'Start', done: false }
  ]);

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
          if (Array.isArray(remoteData.transactions)) setTransactions(remoteData.transactions);
          if (Array.isArray(remoteData.tasks)) setTasks(remoteData.tasks);
        }

        // Initialize lastSaved snapshot
        const initialPayload = {
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
  }, [userId]);

  // Sync state to local storage immediately & Firestore with debouncing
  useEffect(() => {
    localStorage.setItem('bp_balance', balance.toString());
    localStorage.setItem('bp_tokens', tokens.toString());
    localStorage.setItem('bp_spins', spinsLeft.toString());
    localStorage.setItem('bp_phone', userPhone);

    // Only save to Firestore if remote load is finished
    if (!isLoaded.current) return;

    const currentPayload = {
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
        tasks
      });
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [balance, tokens, spinsLeft, userLevel, userXp, userPhone, dailyClaimed, transactions, tasks, userId]);

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
        notifyFail
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
