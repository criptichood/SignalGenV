import React from 'react';

const variants = {
  default: 'bg-cyan-600 hover:bg-cyan-700 text-white font-bold disabled:bg-gray-600',
  outline: 'bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-300',
  ghost: 'bg-transparent hover:bg-gray-700 text-gray-300',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  children?: React.ReactNode;
}

export const Button = ({ className, children, variant = 'default', ...props }: ButtonProps) => {
  const baseClasses = 'inline-flex justify-center items-center gap-2 py-2 px-4 rounded-md shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform active:scale-95';
  
  const classNames = `${baseClasses} ${variants[variant]} ${className || ''}`;

  return (
    <button
      className={classNames}
      {...props}
    >
      {children}
    </button>
  );
};