import React from 'react';
import type { DirectMessageConversation, UserProfile } from '../../types';
import { formatDistanceToNow } from '../../utils/date';

interface ConversationListItemProps {
    conversation: DirectMessageConversation;
    currentUser: UserProfile;
    users: UserProfile[];
    isActive: boolean;
    onClick: () => void;
}

export const ConversationListItem = ({ conversation, currentUser, users, isActive, onClick }: ConversationListItemProps) => {
    const otherUsername = conversation.participantUsernames.find(u => u !== currentUser.username);
    const otherUser = users.find(u => u.username === otherUsername);
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    const isUnread = lastMessage && lastMessage.senderUsername !== currentUser.username && !lastMessage.isRead;

    if (!otherUser) return null; // Should not happen

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 flex items-start gap-3 border-b border-gray-700/50 transition-colors ${
                isActive ? 'bg-cyan-500/10' : 'hover:bg-gray-700/50'
            }`}
        >
            <div className="relative flex-shrink-0">
                <img 
                    src={otherUser.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${otherUser.username}`} 
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover" 
                />
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                    <h4 className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>{otherUser.name}</h4>
                    {lastMessage && <p className="text-xs text-gray-500 flex-shrink-0">{formatDistanceToNow(lastMessage.timestamp)}</p>}
                </div>
                <p className={`text-sm truncate ${isUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {lastMessage ? (
                        `${lastMessage.senderUsername === currentUser.username ? 'You: ' : ''}${lastMessage.content}`
                    ) : (
                        'No messages yet'
                    )}
                </p>
            </div>
            {isUnread && <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1 flex-shrink-0" />}
        </button>
    );
};
