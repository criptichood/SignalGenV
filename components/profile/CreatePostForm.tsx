import React, { useState, useEffect } from 'react';
import type { UserProfile, UserPost, SavedSignal, TradeIdea, AIFeedback } from '../../types';
import { Card } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { SendIcon } from '../icons/SendIcon';
import { ImageSquareIcon } from '../icons/ImageSquareIcon';
import { Input } from '../ui/Input';
import { extractLinks } from '../../utils/links';
import { LinkPreview } from './LinkPreview';
import { CloseIcon } from '../icons/CloseIcon';
import SignalAttachment from './SignalAttachment';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { ManualTradeIdeaForm } from './ManualTradeIdeaForm';
import { TradeIdeaAttachment } from './TradeIdeaAttachment';

interface CreatePostFormProps {
    userProfile: UserProfile;
    onCreatePost: (postData: Omit<UserPost, 'id' | 'createdAt' | 'likedBy' | 'comments' | 'commentCount' | 'author' | 'repostedBy' | 'attachedSignalId' | 'attachedTradeIdea'>) => void;
    signalToAttach: SavedSignal | null;
    onClearSignalAttachment: () => void;
    tradeIdeaToAttach: { userIdea: TradeIdea; aiFeedback?: AIFeedback; } | null;
    setTradeIdeaToAttach: (idea: { userIdea: TradeIdea; aiFeedback?: AIFeedback; } | null) => void;
}

export const CreatePostForm = ({ 
    userProfile, 
    onCreatePost, 
    signalToAttach, 
    onClearSignalAttachment,
    tradeIdeaToAttach,
    setTradeIdeaToAttach,
}: CreatePostFormProps) => {
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [showMediaInput, setShowMediaInput] = useState(false);
    const [showTradeIdeaForm, setShowTradeIdeaForm] = useState(false);
    const [linkForPreview, setLinkForPreview] = useState<string | null>(null);

    useEffect(() => {
        if (signalToAttach) {
            const summary = `New AI Signal Idea: ${signalToAttach.direction} ${signalToAttach.symbol} on the ${signalToAttach.timeframe} chart.\n\nConfidence: ${signalToAttach.confidence}%\nLeverage: ${signalToAttach.leverage}x\n\n#${signalToAttach.symbol.replace('USDT', '')} #TradingSignal #AI`;
            setContent(summary);
            // Clear other attachments
            setTradeIdeaToAttach(null);
        } else if (tradeIdeaToAttach) {
            const { userIdea } = tradeIdeaToAttach;
             const summary = `My Trade Idea: ${userIdea.direction} ${userIdea.symbol} on the ${userIdea.timeframe} chart.\n\nWhat does everyone think of this setup?\n\n#${userIdea.symbol.replace('USDT', '')} #TradeIdea`;
            setContent(summary);
            // Clear other attachments
            onClearSignalAttachment();
        } else {
            setContent('');
        }
    }, [signalToAttach, tradeIdeaToAttach, setTradeIdeaToAttach, onClearSignalAttachment]);
    
    // Debounce link detection
    useEffect(() => {
        const handler = setTimeout(() => {
            const links = extractLinks(content);
            const firstLink = links.length > 0 ? links[0] : null;
            if (firstLink !== linkForPreview) {
                setLinkForPreview(firstLink);
            }
        }, 500); // 500ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [content, linkForPreview]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !signalToAttach && !tradeIdeaToAttach) return;

        onCreatePost({
            content,
            mediaUrl: mediaUrl.trim() || undefined,
            linkPreviewUrl: linkForPreview || undefined,
        });
        
        // Reset form
        setContent('');
        setMediaUrl('');
        setShowMediaInput(false);
        setLinkForPreview(null);
        onClearSignalAttachment();
        setTradeIdeaToAttach(null);
    };
    
    const handleAttachTradeIdea = (idea: TradeIdea) => {
        setTradeIdeaToAttach({ userIdea: idea });
        setShowTradeIdeaForm(false);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <div className="p-4 flex items-start gap-4">
                    <img
                        src={userProfile.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${userProfile.username}`}
                        alt={userProfile.name}
                        className="w-11 h-11 rounded-full border-2 border-gray-700 object-cover"
                    />
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="flex-1 bg-transparent border-0 focus:ring-0 p-0 text-base"
                        rows={3}
                    />
                </div>

                <div className="px-4 pb-4 space-y-3">
                    {signalToAttach && <SignalAttachment signal={signalToAttach} onClear={onClearSignalAttachment} />}
                    {tradeIdeaToAttach && (
                        <TradeIdeaAttachment 
                            idea={tradeIdeaToAttach} 
                            setIdea={setTradeIdeaToAttach}
                            onClear={() => setTradeIdeaToAttach(null)}
                        />
                    )}
                    
                    {(showMediaInput || linkForPreview) && (
                        <>
                            {showMediaInput && (
                                <div className="relative">
                                    <Input 
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        placeholder="Enter image URL..."
                                        className="pr-8"
                                    />
                                    <button type="button" onClick={() => { setShowMediaInput(false); setMediaUrl(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {linkForPreview && (
                                <div className="relative">
                                    <LinkPreview url={linkForPreview} />
                                    <button type="button" onClick={() => setLinkForPreview(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-gray-300 hover:text-white">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    
                    {showTradeIdeaForm && (
                        <ManualTradeIdeaForm 
                            onClose={() => setShowTradeIdeaForm(false)}
                            onAttach={handleAttachTradeIdea}
                        />
                    )}

                </div>
                
                <div className="p-4 border-t border-gray-700/50 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setShowMediaInput(!showMediaInput)} className="p-2 text-gray-400 hover:text-cyan-400 rounded-full transition-colors" title="Attach Image URL">
                            <ImageSquareIcon className="w-5 h-5" />
                        </button>
                         <button type="button" onClick={() => setShowTradeIdeaForm(!showTradeIdeaForm)} className="p-2 text-gray-400 hover:text-cyan-400 rounded-full transition-colors" title="Attach Trade Idea">
                            <LightbulbIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <Button type="submit" disabled={!content.trim() && !signalToAttach && !tradeIdeaToAttach} className="h-9 px-5">
                        <SendIcon className="w-4 h-4 mr-2" />
                        Post
                    </Button>
                </div>
            </form>
        </Card>
    );
};
