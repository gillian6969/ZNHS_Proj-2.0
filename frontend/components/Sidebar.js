'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ menuItems }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-blue rounded-full flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="font-bold text-xl text-primary-dark">ZNHS</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                {item.action === 'logout' ? (
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-blue text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
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

