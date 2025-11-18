import React, { useState, useEffect } from 'react';
import { Textarea } from '../ui/Textarea';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    initialContent?: string;
}

export const MessageInput = ({ onSendMessage, initialContent }: MessageInputProps) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        setContent(initialContent || '');
    }, [initialContent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSendMessage(content.trim());
            setContent('');
        }
    };

    return (
        <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="relative">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSubmit(e); } }}
                    placeholder="Type a message..."
                    className="w-full bg-gray-700 border-gray-600 rounded-xl py-3 pl-4 pr-14 text-sm resize-none"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '150px' }}
                />
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon className="w-5 h-5 text-gray-900" />
                </button>
            </form>
        </div>
    );
};
