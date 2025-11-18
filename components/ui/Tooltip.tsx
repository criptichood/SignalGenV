import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export const Tooltip = ({ children, content, className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-50 px-2.5 py-1.5 text-xs font-semibold text-white bg-gray-900 border border-gray-600 rounded-md shadow-lg animate-tooltip-in ${className ?? ''}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
