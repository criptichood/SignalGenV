import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Page, Notification, UserProfile } from '../../types';
import { BellIcon } from '../icons/BellIcon';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  notifications: Notification[];
  onNavigate: (page: Page, relatedId?: string) => void;
  onMarkAsRead: (ids: string[]) => void;
  users: UserProfile[];
}

export const NotificationBell = ({ notifications, onNavigate, onMarkAsRead, users }: NotificationBellProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button 
                onClick={handleToggle} 
                className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Toggle notifications"
            >
                <BellIcon className="w-6 h-6 text-gray-300" />
                {unreadCount > 0 && (
                     <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown 
                    notifications={notifications}
                    users={users}
                    onNavigate={onNavigate}
                    onMarkAsRead={onMarkAsRead}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
