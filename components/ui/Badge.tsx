import React from 'react';

const badgeVariants = {
  default: 'bg-gray-700 text-gray-300',
  success: 'bg-green-900 text-green-300',
  danger: 'bg-red-900 text-red-300',
  warning: 'bg-yellow-900 text-yellow-300',
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${badgeVariants[variant]} ${className || ''}`}
      {...props}
    />
  );
};