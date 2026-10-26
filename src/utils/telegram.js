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
 * Extract authenticated Telegram User data
 * Converts user ID strictly to a string and extracts name and avatar
 */
export const getTelegramUser = () => {
  const tg = getTelegramWebApp();
  let u = tg?.initDataUnsafe?.user;
  let startParam = tg?.initDataUnsafe?.start_param || '';

  // Fallback 1: Parse from tg.initData string if initDataUnsafe is not yet parsed
  if (!u && tg?.initData) {
    try {
      const p = new URLSearchParams(tg.initData);
      const userStr = p.get('user');
      if (userStr) u = JSON.parse(userStr);
      if (!startParam) startParam = p.get('start_param') || '';
    } catch (e) {}
  }

  // Fallback 2: Parse from window.location.hash (#tgWebAppData=...)
  if (!u && typeof window !== 'undefined' && window.location.hash) {
    try {
      const hash = window.location.hash.substring(1);
      const p = new URLSearchParams(hash);
      const tgWebAppData = p.get('tgWebAppData');
      if (tgWebAppData) {
        const sub = new URLSearchParams(tgWebAppData);
        const userStr = sub.get('user');
        if (userStr) u = JSON.parse(userStr);
        if (!startParam) startParam = sub.get('start_param') || '';
      }
    } catch (e) {}
  }

  if (u && (u.id !== undefined && u.id !== null)) {
    const rawId = String(u.id); // Guaranteed string representation of Telegram ID
    const firstName = u.first_name ? String(u.first_name).trim() : '';
    const lastName = u.last_name ? String(u.last_name).trim() : '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || firstName || u.username || 'Rocky';
    return {
      id: rawId,
      rawId: rawId,
      username: u.username || '',
      firstName: firstName || 'Rocky',
      lastName: lastName || '',
      fullName: fullName,
      photoUrl: u.photo_url || '',
      isPremium: Boolean(u.is_premium),
      languageCode: u.language_code || 'bn',
      startParam: String(startParam)
    };
  }
  return null;
};

/**
 * Get active numeric Telegram user ID as a string from all available sources
 */
export const getActiveTelegramUserId = () => {
  const user = getTelegramUser();
  if (user?.id) return String(user.id);
  const stored = localStorage.getItem('bp_tg_id');
  if (stored) return String(stored);
  const uid = localStorage.getItem('bp_uid');
  if (uid && uid.startsWith('tg_')) return uid.replace('tg_', '');
  return '';
};

/**
 * Retrieve referral / deep link start_param from Mini App or URL query
 */
export const getTelegramStartParam = () => {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.start_param) {
    return String(tg.initDataUnsafe.start_param);
  }
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('startapp') || params.get('start') || '';
  }
  return '';
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

    // 7. Calculate and apply exact viewport height & safe area insets
    const updateViewportAndInsets = () => {
      // Calculate exact visible viewport height (locks screen to actual viewable area)
      const visibleHeight = tg.viewportStableHeight || tg.viewportHeight || window.innerHeight;
      if (visibleHeight && visibleHeight > 0) {
        document.documentElement.style.setProperty('--app-viewport-height', `${visibleHeight}px`);
      }

      // Safe area top (Telegram overlay pills: Close X and Menu ⋮)
      const topInset = tg.contentSafeAreaInset?.top ?? tg.safeAreaInset?.top ?? 0;
      const topGap = Math.max(56, topInset);
      document.documentElement.style.setProperty('--app-top-safe-gap', `${topGap}px`);

      // Safe area bottom (Mobile navigation bar / gesture pill)
      const bottomInset = tg.contentSafeAreaInset?.bottom ?? tg.safeAreaInset?.bottom ?? 0;
      document.documentElement.style.setProperty('--app-bottom-safe-gap', `${Math.max(14, bottomInset)}px`);
    };

    updateViewportAndInsets();

    if (typeof tg.onEvent === 'function') {
      tg.onEvent('viewportChanged', updateViewportAndInsets);
      tg.onEvent('contentSafeAreaChanged', updateViewportAndInsets);
      tg.onEvent('safeAreaChanged', updateViewportAndInsets);
    }
    window.addEventListener('resize', updateViewportAndInsets);
    window.addEventListener('orientationchange', updateViewportAndInsets);

    // Also bind web beforeunload as double protection
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('resize', updateViewportAndInsets);
      window.removeEventListener('orientationchange', updateViewportAndInsets);
      if (typeof tg.offEvent === 'function') {
        tg.offEvent('viewportChanged', updateViewportAndInsets);
        tg.offEvent('contentSafeAreaChanged', updateViewportAndInsets);
        tg.offEvent('safeAreaChanged', updateViewportAndInsets);
      }
    };
  } catch (err) {
    console.warn("Telegram WebApp initialization notice:", err);
  }

  return () => {};
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

