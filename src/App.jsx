import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { TasksScreen } from './components/TasksScreen';
import { GameScreen } from './components/GameScreen';
import { WalletScreen } from './components/WalletScreen';
import { WithdrawScreen } from './components/WithdrawScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { InviteScreen } from './components/InviteScreen';
import { BottomNav } from './components/BottomNav';
import { ActionModal } from './components/ActionModal';
import { initTelegramApp, updateTelegramBackButton } from './utils/telegram';

const screenBgMap = {
  splash: '#0a1910',
  home: '#f8fafc',
  tasks: '#f8fafc',
  game: '#4aa0e6',
  wallet: '#f8fafc',
  withdraw: '#f8fafc',
  profile: '#f8fafc',
  invite: '#f8fafc'
};

const MainAppContent = () => {
  const { currentScreen, setCurrentScreen } = useApp();

  // Dynamically match header gap and background color with the active screen
  useEffect(() => {
    const bgColor = screenBgMap[currentScreen] || '#f8fafc';
    document.documentElement.style.setProperty('--screen-bg', bgColor);

    // Update Telegram WebApp native top header bar & background
    const tg = window.Telegram?.WebApp;
    if (tg) {
      if (typeof tg.setHeaderColor === 'function') {
        try { tg.setHeaderColor(bgColor); } catch (e) {}
      }
      if (typeof tg.setBackgroundColor === 'function') {
        try { tg.setBackgroundColor(bgColor); } catch (e) {}
      }
    }
  }, [currentScreen]);

  // Initialize Telegram Mini App Fullscreen, Swipe-lock & Close Warning
  useEffect(() => {
    const cleanup = initTelegramApp();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Sync Telegram Native Back Button with app screen navigation
  useEffect(() => {
    updateTelegramBackButton(currentScreen, () => {
      setCurrentScreen('home');
    });
  }, [currentScreen, setCurrentScreen]);

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'home':
        return <HomeScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'game':
        return <GameScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'withdraw':
        return <WithdrawScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'invite':
        return <InviteScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showBottomNav = currentScreen !== 'splash' && currentScreen !== 'game';

  return (
    <div className="app-viewport-container">
      {/* Real Telegram Mini App / Web App Container */}
      <div className="app-container">
        {/* Active Screen Body */}
        <main className={`app-screen-body ${currentScreen === 'splash' ? 'splash-screen' : ''} ${!showBottomNav ? 'no-nav' : ''}`}>
          {renderActiveScreen()}
        </main>

        {/* Bottom Navigation Bar */}
        {showBottomNav && <BottomNav />}

        {/* Global Action Modal (Success, Warn, Fail) */}
        <ActionModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
