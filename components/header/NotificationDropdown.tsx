import React from 'react';
import type { Page, Notification, UserProfile } from '../../types';
import { formatDistanceToNow } from '../../utils/date';
import { MailIcon } from '../icons/MailIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { HeartIcon } from '../icons/HeartIcon';

interface NotificationDropdownProps {
  notifications: Notification[];
  users: UserProfile[];
  onNavigate: (page: Page, relatedId?: string) => void;
  onMarkAsRead: (ids: string[]) => void;
  onClose: () => void;
}

const NotificationItem = ({ notification, user, onClick }: { notification: Notification; user?: UserProfile; onClick: () => void }) => {
    const { type, fromUsername, timestamp, isRead } = notification;

    const content = {
        new_message: {
            icon: <MailIcon className="w-5 h-5 text-cyan-400" />,
            text: <><span className="font-bold">{user?.name || fromUsername}</span> sent you a message.</>
        },
        new_follower: {
            icon: <UserPlusIcon className="w-5 h-5 text-green-400" />,
            text: <><span className="font-bold">{user?.name || fromUsername}</span> started following you.</>
        },
        post_like: {
            icon: <HeartIcon className="w-5 h-5 text-red-400" />,
            text: <><span className="font-bold">{user?.name || fromUsername}</span> liked your post.</>
        }
    }[type];

    return (
        <button onClick={onClick} className="w-full text-left p-3 flex items-start gap-3 hover:bg-gray-700 transition-colors">
            {!isRead && <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" aria-label="Unread"></div>}
            <div className={`flex-shrink-0 ${isRead ? 'ml-3.5' : ''}`}>{content.icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-300">{content.text}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDistanceToNow(timestamp)}</p>
            </div>
        </button>
    );
};


export const NotificationDropdown = ({ notifications, users, onNavigate, onMarkAsRead, onClose }: NotificationDropdownProps) => {
    
    const handleNotificationClick = (notification: Notification) => {
        onMarkAsRead([notification.id]);
        
        switch (notification.type) {
            case 'new_message':
                onNavigate('messages', notification.relatedEntityId);
                break;
            case 'new_follower':
                onNavigate('profile', notification.fromUsername);
                break;
            // case 'post_like':
            //     onNavigate('post', notification.relatedEntityId);
            //     break;
        }
        onClose();
    };

    const handleMarkAllRead = () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if(unreadIds.length > 0) {
            onMarkAsRead(unreadIds);
        }
    };
    
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-bold">Notifications</h3>
                <button onClick={handleMarkAllRead} className="text-xs text-cyan-400 hover:underline">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            user={users.find(u => u.username === n.fromUsername)}
                            onClick={() => handleNotificationClick(n)}
                        />
                    ))
                ) : (
                    <p className="p-6 text-center text-sm text-gray-500">No notifications yet.</p>
                )}
            </div>
        </div>
    );
};
