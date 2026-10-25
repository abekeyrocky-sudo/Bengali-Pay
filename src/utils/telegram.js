/**
 * Telegram Mini App (TMA) Helper & Controller
 * Supports Bot API 7.x & 8.0+ Fullscreen, Swipe Locking, and Close Confirmation
 */

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const isTelegramEnvironment = () => {
  const tg = getTelegramWebApp();
  return Boolean(tg && tg.initData);
};

/**
 * Initialize Telegram Mini App Fullscreen & Safety Settings
 */
export const initTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (!tg) {
    // Fallback for regular web browsers: beforeunload warning
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'আপনি কি সত্যি বের হতে চান? আপনার প্রোগ্রেস সংরক্ষিত না হতে পারে।';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }

  try {
    // 1. Tell Telegram the app is ready
    tg.ready();

    // 2. Expand to full available height
    tg.expand();

    // 3. Request native Fullscreen (Telegram Bot API 8.0+)
    if (typeof tg.requestFullscreen === 'function') {
      tg.requestFullscreen();
    }

    // 4. Disable vertical swipe-to-close gesture (prevents accidental closing on scroll)
    if (typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes();
    }

    // 5. Enable native App Close Warning / Confirmation Modal
    // Whenever user tries to swipe away or tap close (X), Telegram shows a native confirmation popup
    if (typeof tg.enableClosingConfirmation === 'function') {
      tg.enableClosingConfirmation();
    }

    // 6. Set theme colors to match Bengali Pay branding
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#15803d');
    }
    if (typeof tg.setBackgroundColor === 'function') {
      tg.setBackgroundColor('#ffffff');
    }

    // 7. Calculate and apply safe area top gap for Telegram overlay (Close / Menu pills)
    const applySafeArea = () => {
      const topInset = tg.contentSafeAreaInset?.top || tg.safeAreaInset?.top || 0;
      const topGap = Math.max(56, topInset);
      document.documentElement.style.setProperty('--app-top-safe-gap', `${topGap}px`);
    };
    applySafeArea();
    if (typeof tg.onEvent === 'function') {
      tg.onEvent('contentSafeAreaChanged', applySafeArea);
      tg.onEvent('safeAreaChanged', applySafeArea);
    }
  } catch (err) {
    console.warn("Telegram WebApp initialization notice:", err);
  }

  // Also bind web beforeunload as double protection
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = '';
    return '';
  };
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

/**
 * Handle Telegram Native BackButton based on current active screen
 */
export const updateTelegramBackButton = (currentScreen, onBack) => {
  const tg = getTelegramWebApp();
  if (!tg || !tg.BackButton) return;

  try {
    if (currentScreen === 'home' || currentScreen === 'splash') {
      tg.BackButton.hide();
      tg.BackButton.offClick(onBack);
    } else {
      tg.BackButton.show();
      tg.BackButton.offClick(onBack);
      tg.BackButton.onClick(onBack);
    }
  } catch (err) {
    console.warn("Telegram BackButton error:", err);
  }
};

/**
 * Safely close the Telegram Mini App or Web Session
 */
export const closeTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (tg && typeof tg.close === 'function') {
    tg.close();
  } else if (typeof window !== 'undefined') {
    window.close();
  }
};

