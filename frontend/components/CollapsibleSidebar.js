'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function CollapsibleSidebar({ menuItems, userRole }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 relative">
              <Image
                src="/znhslogo.png"
                alt="ZNHS Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-lg text-primary-dark block">ZNHS</span>
              <span className="text-xs text-gray-500">{userRole}</span>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 relative mx-auto">
            <Image
              src="/znhslogo.png"
              alt="ZNHS Logo"
              fill
              className="object-contain"
            />
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-gray-600 hover:text-primary-dark transition-colors ${isCollapsed ? 'mx-auto mt-2' : ''}`}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href || item.label}>
                {item.action === 'logout' ? (
                  <button
                    onClick={logout}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-blue text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

