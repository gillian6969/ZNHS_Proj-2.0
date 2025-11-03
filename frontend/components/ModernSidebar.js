'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Icon from './Icon';
import ConfirmModal from './ConfirmModal';

export default function ModernSidebar({ menuItems, children, pageTitle }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

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
        className={`fixed left-0 top-0 h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 shadow-2xl transition-all duration-300 z-50 ${
          isCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        {/* Logo / Header */}
        <div className="h-20 flex items-center px-6 border-b-2 border-white/20 bg-gradient-to-r from-white/10 to-transparent">
          {!isCollapsed ? (
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md"></div>
                <img 
                  src="/znhslogo.png" 
                  alt="ZNHS Logo" 
                  className="relative w-12 h-12 rounded-full bg-white p-1.5 shadow-lg"
                />
              </div>
              <div className="text-white">
                <div className="font-bold text-lg leading-tight tracking-wide">ZNHS</div>
                <div className="text-sm opacity-90 font-medium">Student grade Portal</div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-md"></div>
              <img 
                src="/znhslogo.png" 
                alt="ZNHS Logo" 
                className="relative w-10 h-10 rounded-full bg-white p-1 shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-3">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            if (item.action === 'logout') {
              return (
                    <button
                      key={index}
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all duration-200 ${
                        isCollapsed ? 'justify-center' : ''
                      } hover:bg-red-500/20 text-white/90 hover:text-white hover:scale-105 font-medium`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon name="logout" className="w-6 h-6 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-base">{item.label}</span>
                      )}
                    </button>
              );
            }

            return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all duration-200 ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xl scale-105 font-semibold'
                        : 'text-white/90 hover:bg-white/15 hover:text-white hover:scale-105 font-medium'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon name={item.iconName} className="w-6 h-6 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-base">{item.label}</span>
                    )}
                  </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-24' : 'ml-72'}`}>
        {/* Top Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b-2 border-blue-100 flex items-center justify-between px-8 shadow-lg">
          <div className="flex items-center gap-4">
            {/* Burger Menu */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon name={isCollapsed ? 'menu' : 'close'} className="w-6 h-6 text-gray-700" />
            </button>

                    {/* Page Title */}
                    {pageTitle && (
                      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
                    )}
          </div>

                  {/* User Info */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-4 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                    >
                      <div className="text-right hidden md:block">
                        <p className="text-base font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500 capitalize font-medium">{user?.role}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-md opacity-60"></div>
                        {user?.avatar ? (
                          <img 
                            src={`http://localhost:5000${user.avatar}`}
                            alt={user?.name}
                            className="relative w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                          />
                        ) : (
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Icon name="user" className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowUserMenu(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-slideUp">
                          <Link
                            href={
                              user?.role === 'student' 
                                ? '/student/profile' 
                                : '/staff/profile'
                            }
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                          >
                            <Icon name="user" className="w-5 h-5 text-gray-600" />
                            <span className="text-base font-medium text-gray-700">View Profile</span>
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setShowLogoutModal(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                          >
                            <Icon name="logout" className="w-5 h-5 text-red-600" />
                            <span className="text-base font-medium text-red-600">Log Out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
        </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8">
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

