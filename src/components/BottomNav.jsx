import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, CheckSquare, Wallet, User } from 'lucide-react';

export const BottomNav = () => {
  const { currentScreen, navigateTo } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="bottom-nav-bar">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`nav-item-btn ${isActive ? 'active' : ''}`}
            id={`nav-${item.id}`}
          >
            <div className="nav-icon-wrapper">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
