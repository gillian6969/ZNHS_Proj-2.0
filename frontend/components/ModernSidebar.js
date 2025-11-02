'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Icon from './Icon';
import ConfirmModal from './ConfirmModal';

export default function ModernSidebar({ menuItems, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleMenuClick = (item) => {
    if (item.action === 'logout') {
      setShowLogoutModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-2xl transition-all duration-300 z-50 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-500/30">
          {!isCollapsed && (
            <span className="text-white font-semibold text-sm">ZNHS AIMS</span>
          )}
        </div>

        {/* Menu Items */}
        <nav className="mt-4 px-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            if (item.action === 'logout') {
              return (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                    isCollapsed ? 'justify-center' : ''
                  } hover:bg-white/10 text-white/90 hover:text-white`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon name="logout" className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon name={item.iconName} className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          {/* Burger Menu */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name={isCollapsed ? 'menu' : 'close'} className="w-6 h-6 text-gray-700" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{useAuth().user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{useAuth().user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Icon name="user" className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        type="warning"
      />
    </div>
  );
}

