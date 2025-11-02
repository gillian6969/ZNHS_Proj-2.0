'use client';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale">
        <div className={`${theme.bg} p-6 rounded-t-2xl`}>
          <div className="flex items-center space-x-4">
            <div className={`${theme.iconBg} ${theme.iconText} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
              {theme.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-lg mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
          animation: scale 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

