'use client';

import Icon from './Icon';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'bg-red-50',
      icon: '⚠️',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      icon: '⚡',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const theme = colors[type] || colors.danger;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 animate-scale">
        <div className={`${theme.bg} p-6 rounded-t-2xl border-b border-white/60`}>
          <div className="flex items-center gap-4">
            <div className={`${theme.iconBg} ${theme.iconText} w-12 h-12 rounded-xl flex items-center justify-center`}> 
              {type === 'danger' && <Icon name="warning" className="w-6 h-6" />}
              {type === 'warning' && <Icon name="alert" className="w-6 h-6" />}
              {type === 'info' && <Icon name="info" className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-base mb-6 leading-relaxed">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3 ${theme.button} text-white font-semibold rounded-lg transition-colors shadow-lg`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale {
          animation: scale 0.18s ease-out;
        }
      `}</style>
    </div>
  );
}

