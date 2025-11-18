import React, { useEffect } from 'react';
import { CheckCircle, X, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  variant?: 'success' | 'warning' | 'error';
}

export const Toast = ({ message, onClose, duration = 5000, variant = 'success' }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);
  
  const variantConfig = {
    success: {
      bg: 'bg-green-600',
      border: 'border-green-500',
      hoverBg: 'hover:bg-green-700',
      icon: <CheckCircle className="w-5 h-5 mr-3" />,
    },
    warning: {
      bg: 'bg-yellow-600',
      border: 'border-yellow-500',
      hoverBg: 'hover:bg-yellow-700',
      icon: <Info className="w-5 h-5 mr-3" />,
    },
    error: {
      bg: 'bg-red-600',
      border: 'border-red-500',
      hoverBg: 'hover:bg-red-700',
      icon: <Info className="w-5 h-5 mr-3" />,
    },
  };

  const config = variantConfig[variant];

  return (
    <div className="fixed top-6 right-6 z-50 animate-toast-in-right">
      <div className={`flex items-center ${config.bg} ${config.border} text-white text-sm font-bold px-4 py-3 rounded-lg shadow-2xl`}>
        {config.icon}
        <p>{message}</p>
        <button onClick={onClose} className={`ml-4 -mr-2 p-1 rounded-full ${config.hoverBg} transition-colors`}>
            <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};