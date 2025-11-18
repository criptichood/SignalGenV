import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
}

export const Progress = ({ value, className, ...props }: ProgressProps) => {
  const progress = Math.max(0, Math.min(100, value || 0));

  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-700 ${className}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-cyan-500 transition-all"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </div>
  );
};