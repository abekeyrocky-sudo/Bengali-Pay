import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { TasksScreen } from './components/TasksScreen';
import { GameScreen } from './components/GameScreen';
import { WalletScreen } from './components/WalletScreen';
import { WithdrawScreen } from './components/WithdrawScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav } from './components/BottomNav';
import { ActionModal } from './components/ActionModal';

const MainAppContent = () => {
  const { currentScreen } = useApp();

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
        <main className={`app-screen-body ${!showBottomNav ? 'no-nav' : ''}`}>
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
