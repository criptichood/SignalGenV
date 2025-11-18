import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = ({ className, icon, ...props }: InputProps) => {
  const hasIcon = icon !== undefined;
  return (
    <div className="relative w-full">
      {hasIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={`w-full bg-gray-700 border-transparent rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 ${hasIcon ? 'pl-9' : ''} ${className || ''}`}
        {...props}
      />
    </div>
  );
};