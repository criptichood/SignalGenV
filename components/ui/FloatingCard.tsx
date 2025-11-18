import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { WindowMinimizeIcon } from '@/components/icons/WindowMinimizeIcon';
import { WindowMaximizeIcon } from '@/components/icons/WindowMaximizeIcon';

interface FloatingCardProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  className?: string;
  initialWidth?: number;
}

export const FloatingCard = ({
  title,
  children,
  isOpen,
  onClose,
  isMinimized,
  onToggleMinimize,
  position,
  onPositionChange,
  className = '',
  initialWidth = 320,
}: FloatingCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // Prevent dragging when clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  }, [position.x, position.y]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      onPositionChange({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange]);


  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className={`fixed bg-gray-800/80 backdrop-blur-md border border-gray-700/70 shadow-2xl rounded-lg flex flex-col z-40 ${className}`}
      style={{
        width: `${initialWidth}px`,
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: `translate(0, 0)`, // Use top/left for positioning
      }}
    >
      <header
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-2 border-b border-gray-700/50 cursor-move"
      >
        <h3 className="text-sm font-bold pl-1 select-none">{title}</h3>
        <div className="flex items-center">
            <button
              onClick={onToggleMinimize}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
                {isMinimized ? <WindowMaximizeIcon className="w-4 h-4"/> : <WindowMinimizeIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
              aria-label="Close"
            >
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
      </header>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'h-0' : 'h-[420px]'}`}>
        {children}
      </div>
    </div>
  );
};