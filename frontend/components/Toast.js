'use client';

import { useEffect } from 'react';
import Icon from './Icon';

export default function Toast({ message, type = 'success', isOpen, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: 'check',
      iconColor: 'text-white'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: 'close',
      iconColor: 'text-white'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: 'info',
      iconColor: 'text-white'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      icon: 'warning',
      iconColor: 'text-white'
    }
  };

  const style = styles[type] || styles.success;

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slideInRight">
      <div className={`${style.bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md backdrop-blur-sm`}>
        <div className={`flex-shrink-0 ${style.iconColor}`}>
          <Icon name={style.icon} className="w-6 h-6" />
        </div>
        <p className="flex-1 font-medium text-base">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <Icon name="close" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

