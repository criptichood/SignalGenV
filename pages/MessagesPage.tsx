import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { UserProfile, DirectMessageConversation } from '@/types';
import { ConversationListItem } from '@/components/messages/ConversationListItem';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';
import { MailIcon } from '@/components/icons/MailIcon';
import { useSocialStore } from '@/store/socialStore';

interface MessagesPageProps {
    onNavigateToProfile: (username: string) => void;
}

export default function MessagesPage({ onNavigateToProfile }: MessagesPageProps) {
    const { 
        // FIX: Remove `currentUser` from destructuring as it does not exist on the store.
        users, conversations, handleSendMessage, 
        activeConversationId, setActiveConversationId, 
        pendingMessage, setPendingMessage 
    } = useSocialStore();

    const currentUser = useMemo(() => users?.find(u => u.username === 'CryptoTrader123'), [users]);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const [initialContent, setInitialContent] = useState('');
    const prevActiveConversationIdRef = useRef<string | null>(null);

    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === activeConversationId);
    }, [conversations, activeConversationId]);
    
    // Auto-select the first conversation if none is active
    useEffect(() => {
        if (!activeConversationId && conversations.length > 0) {
            setActiveConversationId(conversations[0].id);
        }
    }, [activeConversationId, conversations, setActiveConversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    useEffect(() => {
        const prevId = prevActiveConversationIdRef.current;

        if (pendingMessage && pendingMessage.conversationId === activeConversationId) {
            setInitialContent(pendingMessage.content);
            setPendingMessage(null); 
        } else if (activeConversationId !== prevId) {
            setInitialContent('');
        }
        
        prevActiveConversationIdRef.current = activeConversationId;
    }, [activeConversationId, pendingMessage, setPendingMessage]);

    const otherUser = useMemo(() => {
        if (!activeConversation || !currentUser) return null;
        const otherUsername = activeConversation.participantUsernames.find(u => u !== currentUser.username);
        return users.find(u => u.username === otherUsername);
    }, [activeConversation, currentUser, users]);

    const handleSend = (content: string) => {
        if (otherUser) {
            handleSendMessage(otherUser.username, content);
        }
    };

    if (!currentUser) {
        return null; // Or a loading spinner
    }

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold mb-6">Messages</h1>
            <div className="flex-1 flex border border-gray-700 rounded-lg overflow-hidden min-h-0">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="font-bold">Conversations</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map(convo => (
                            <ConversationListItem
                                key={convo.id}
                                conversation={convo}
                                currentUser={currentUser}
                                users={users}
                                isActive={convo.id === activeConversationId}
                                onClick={() => setActiveConversationId(convo.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Active Chat View */}
                <div className="w-2/3 flex flex-col bg-gray-800/50">
                    {activeConversation && otherUser ? (
                        <>
                            <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                                <button onClick={() => onNavigateToProfile(otherUser.username)}>
                                    <img src={otherUser.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${otherUser.username}`} alt={otherUser.name} className="w-9 h-9 rounded-full object-cover" />
                                </button>
                                <div>
                                    <h3 className="font-bold">{otherUser.name}</h3>
                                    <p className="text-sm text-gray-400">@{otherUser.username}</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeConversation.messages.map(msg => (
                                    <MessageBubble 
                                        key={msg.id}
                                        message={msg}
                                        isFromCurrentUser={msg.senderUsername === currentUser.username}
                                        senderProfile={users.find(u => u.username === msg.senderUsername)}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <MessageInput onSendMessage={handleSend} initialContent={initialContent} />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <MailIcon className="w-16 h-16 mb-4" />
                            <h3 className="text-lg font-semibold">Select a conversation</h3>
                            <p className="text-sm">Or start a new one from a user's profile.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}