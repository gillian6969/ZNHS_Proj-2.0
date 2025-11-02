'use client';

import CollapsibleSidebar from './CollapsibleSidebar';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function DashboardLayout({ children, menuItems }) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getRoleDisplay = () => {
    if (user?.role === 'student') return `${user?.gradeLevel} - ${user?.section}`;
    if (user?.role === 'teacher') return user?.subjects?.join(', ') || 'Teacher';
    if (user?.role === 'admin') return 'Administrator';
    return '';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar menuItems={menuItems} userRole={getRoleDisplay()} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {user?.name}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">{getRoleDisplay()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-blue rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

