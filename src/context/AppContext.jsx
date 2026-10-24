import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { getUserId, subscribeUserData, saveUserToFirestore } from '../firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userId] = useState(() => getUserId());
  const isInitialSync = useRef(true);

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

  // Firebase Realtime Sync on mount
  useEffect(() => {
    const unsubscribe = subscribeUserData(userId, (remoteData) => {
      if (remoteData) {
        if (remoteData.balance !== undefined) setBalance(remoteData.balance);
        if (remoteData.tokens !== undefined) setTokens(remoteData.tokens);
        if (remoteData.spinsLeft !== undefined) setSpinsLeft(remoteData.spinsLeft);
        if (remoteData.userLevel !== undefined) setUserLevel(remoteData.userLevel);
        if (remoteData.userXp !== undefined) setUserXp(remoteData.userXp);
        if (remoteData.phone !== undefined) setUserPhone(remoteData.phone);
        if (remoteData.dailyClaimed !== undefined) setDailyClaimed(remoteData.dailyClaimed);
        if (remoteData.transactions) setTransactions(remoteData.transactions);
        if (remoteData.tasks) setTasks(remoteData.tasks);
      } else {
        // Initialize user in Firestore if not existing
        saveUserToFirestore(userId, {
          userId,
          balance,
          tokens,
          spinsLeft,
          userLevel,
          userXp,
          phone: userPhone,
          dailyClaimed,
          transactions,
          tasks,
          createdAt: new Date().toISOString()
        });
      }
      isInitialSync.current = false;
    });

    return () => unsubscribe();
  }, [userId]);

  // Sync state to local storage & Firestore
  useEffect(() => {
    localStorage.setItem('bp_balance', balance.toString());
    localStorage.setItem('bp_tokens', tokens.toString());
    localStorage.setItem('bp_spins', spinsLeft.toString());
    localStorage.setItem('bp_phone', userPhone);

    if (!isInitialSync.current) {
      saveUserToFirestore(userId, {
        balance,
        tokens,
        spinsLeft,
        userLevel,
        userXp,
        phone: userPhone,
        dailyClaimed,
        transactions,
        tasks
      });
    }
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
