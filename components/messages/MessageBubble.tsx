import React from 'react';
import type { DirectMessage, UserProfile } from '../../types';

interface MessageBubbleProps {
    message: DirectMessage;
    isFromCurrentUser: boolean;
    senderProfile?: UserProfile;
}

export const MessageBubble = ({ message, isFromCurrentUser, senderProfile }: MessageBubbleProps) => {
    return (
        <div className={`flex items-end gap-2 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {!isFromCurrentUser && senderProfile && (
                <img 
                    src={senderProfile.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${senderProfile.username}`}
                    alt={senderProfile.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
            )}
            <div className={`max-w-md rounded-2xl px-4 py-2 ${
                isFromCurrentUser 
                ? 'bg-lime-600 text-white rounded-br-none' 
                : 'bg-gray-700 rounded-bl-none'
            }`}>
                <p className="text-sm">{message.content}</p>
            </div>
        </div>
    );
};
