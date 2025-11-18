import React from 'react';
import { Input } from './Input';
import { Plus, Minus } from 'lucide-react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string | number;
  onValueChange: (value: string) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const NumberInput = ({
  value,
  onValueChange,
  onIncrement,
  onDecrement,
  className,
  disabled,
  ...props
}: NumberInputProps) => {
  return (
    <div className={`relative flex items-center ${className || ''}`}>
      <Input
        type="number"
        className="pr-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Hide default spinners
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        {...props}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-gray-700/80 rounded-md border border-gray-600">
        <button
          type="button"
          onClick={onDecrement}
          tabIndex={-1}
          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-l-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrement"
          disabled={disabled || !onDecrement}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-500"></div>
        <button
          type="button"
          onClick={onIncrement}
          tabIndex={-1}
          className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-r-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increment"
          disabled={disabled || !onIncrement}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};