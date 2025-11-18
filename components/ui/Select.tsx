import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

export const Select = ({ children, onValueChange, ...props }: SelectProps) => {
  return (
    <select
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className="w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </select>
  );
};