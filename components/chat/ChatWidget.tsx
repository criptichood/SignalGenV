import React, { useState, useRef, useEffect } from 'react';
// FIX: Update import path for PageContext to fix circular dependency.
import type { Page, PageContext, UserProfile } from '@/types';
import type { ChatIconType } from '@/types';
import { useChat } from '@/hooks/useChat';
import { useStore } from '@/store';
import { FormattedReasoning } from '@/components/FormattedReasoning';
import { ChatBotIcon } from '@/components/icons/ChatBotIcon';
import { CloseIcon } from '@/components/icons/CloseIcon';
import { SendIcon } from '@/components/icons/SendIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { formatDistanceToNow } from '@/utils/date';
import { ChevronsLeftIcon } from '@/components/icons/ChevronsLeftIcon';
import { ChevronsRightIcon } from '@/components/icons/ChevronsRightIcon';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { Trash2Icon } from '@/components/icons/Trash2Icon';
import { CopyIcon } from '@/components/icons/CopyIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { LightbulbIcon } from '@/components/icons/LightbulbIcon';
import { MessageSquareIcon } from '@/components/icons/MessageSquareIcon';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { MoreHorizontalIcon } from '@/components/icons/MoreHorizontalIcon';
import { UserIcon } from '@/components/icons/UserIcon';


interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  context: PageContext;
  chatController: ReturnType<typeof useChat>;
  chatIcon: ChatIconType;
  currentUser: UserProfile;
  onNavigate: (page: Page) => void;
}

const FloatingActionButtonIcon = ({ icon, className }: { icon: ChatIconType; className: string }) => {
    switch (icon) {
        case 'sparkles': return <SparklesIcon className={className} />;
        case 'lightbulb': return <LightbulbIcon className={className} />;
        case 'message': return <MessageSquareIcon className={className} />;
        case 'bot':
        default:
            return <ChatBotIcon className={className} />;
    }
};

export const ChatWidget = ({ isOpen, onClose, onOpen, context, chatController, chatIcon, currentUser, onNavigate }: ChatWidgetProps) => {
  const {
    conversations,
    currentConversation,
    selectConversation,
    startNewConversation,
    sendMessage,
    renameConversation,
    deleteConversation,
    editMessageAndResend,
    isLoading,
  } = chatController;

  const { chatFabPosition, setChatFabPosition } = useStore();

  const [input, setInput] = useState('');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [convoToDelete, setConvoToDelete] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number; content: string } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const wasDragged = useRef(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isLoading]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatWidgetRef.current &&
        !chatWidgetRef.current.contains(event.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFabMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!fabRef.current) return;
    wasDragged.current = false;
    const rect = fabRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !fabRef.current) return;
      wasDragged.current = true;
      let x = e.clientX - dragOffset.current.x;
      let y = e.clientY - dragOffset.current.y;
      
      const fabWidth = fabRef.current.offsetWidth;
      const fabHeight = fabRef.current.offsetHeight;
      x = Math.max(16, Math.min(x, window.innerWidth - fabWidth - 16));
      y = Math.max(16, Math.min(y, window.innerHeight - fabHeight - 16));

      setChatFabPosition({ x, y });
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
  }, [isDragging, setChatFabPosition]);
  
  const handleFabClick = () => {
    if (!wasDragged.current) {
      onOpen();
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleEditSend = () => {
    if (editingMessage) {
        editMessageAndResend(editingMessage.index, editingMessage.content);
        setEditingMessage(null);
    }
  };

  const handleRename = (id: string) => {
    renameConversation(id, editingTitle);
    setEditingConvoId(null);
  };
  
  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <div
        ref={chatWidgetRef}
        className={`fixed bottom-0 right-0 m-4 rounded-xl shadow-2xl bg-gray-900/80 backdrop-blur-md border border-gray-700 flex transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0 w-[90vw] h-[80vh] md:w-[700px] md:h-[600px]' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {/* History Sidebar */}
        <div className={`flex flex-col bg-gray-800/50 rounded-l-xl transition-all duration-300 ease-in-out border-r border-gray-700 ${isHistoryCollapsed ? 'w-12' : 'w-56'}`}>
          <div className="flex items-center justify-between p-2 border-b border-gray-700 h-14">
            {!isHistoryCollapsed && <h3 className="font-bold text-sm pl-2">Chat History</h3>}
            <button onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)} className="p-2 rounded-lg hover:bg-gray-700">
              {isHistoryCollapsed ? <ChevronsRightIcon className="w-4 h-4" /> : <ChevronsLeftIcon className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.sort((a,b) => b.createdAt - a.createdAt).map(convo => (
              <div key={convo.id} className="relative group">
                {editingConvoId === convo.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onBlur={() => handleRename(convo.id)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(convo.id)}
                    autoFocus
                    className="w-full bg-gray-900 text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                ) : (
                  <button
                    onClick={() => selectConversation(convo.id)}
                    // FIX: Cannot find name 'currentConversationId'. Use currentConversation.id instead.
                    className={`w-full text-left text-sm rounded-md px-2 py-2 truncate transition-colors ${currentConversation?.id === convo.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700'}`}
                    title={convo.title}
                  >
                    {isHistoryCollapsed ? <MessageSquareIcon className="w-4 h-4 mx-auto"/> : convo.title}
                  </button>
                )}
                 {/* FIX: Cannot find name 'currentConversationId'. Use currentConversation.id instead. */}
                 {!isHistoryCollapsed && currentConversation?.id === convo.id && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-gray-700 rounded-md">
                    <button onClick={() => { setEditingConvoId(convo.id); setEditingTitle(convo.title); }} className="p-1 hover:text-white"><PencilIcon className="w-3 h-3"/></button>
                    <button onClick={() => setConvoToDelete(convo.id)} className="p-1 hover:text-red-400"><Trash2Icon className="w-3 h-3"/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-700">
            <Button onClick={startNewConversation} className="w-full h-9 text-sm bg-transparent border border-gray-600 hover:bg-gray-700">
              <PlusIcon className={`w-4 h-4 ${!isHistoryCollapsed && 'mr-2'}`} />
              {!isHistoryCollapsed && "New Chat"}
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between p-3 border-b border-gray-700 h-14">
            <h2 className="font-bold truncate pr-4">{currentConversation?.title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><CloseIcon className="w-5 h-5" /></button>
          </header>
          <main className="flex-1 overflow-y-auto p-4 space-y-6">
            {currentConversation?.messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                 {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0"><ChatBotIcon className="w-5 h-5 text-cyan-400" /></div>}
                <div className="group relative max-w-xl">
                    {editingMessage?.index === index ? (
                        <div className="w-full">
                            <Textarea value={editingMessage.content} onChange={e => setEditingMessage({index, content: e.target.value})} rows={3} className="text-sm bg-gray-700" autoFocus />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button onClick={() => setEditingMessage(null)} className="h-7 px-3 text-xs bg-gray-600 hover:bg-gray-500">Cancel</Button>
                                <Button onClick={handleEditSend} className="h-7 px-3 text-xs">Save & Send</Button>
                            </div>
                        </div>
                    ) : (
                        <div className={`px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-lime-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            {msg.role === 'model' ? <FormattedReasoning text={msg.content} onNavigate={onNavigate} /> : <p className="text-white whitespace-pre-wrap">{msg.content}</p>}
                        </div>
                    )}
                    {msg.role === 'model' && (
                        <div className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleCopy(msg.content, index)} className="p-1 text-gray-400 hover:text-white">
                                {copiedIndex === index ? <CheckIcon className="w-3 h-3 text-green-400"/> : <CopyIcon className="w-3 h-3"/>}
                            </button>
                        </div>
                    )}
                     {msg.role === 'user' && !editingMessage && (
                        <div className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingMessage({ index, content: msg.content })} className="p-1 text-gray-400 hover:text-white">
                                <PencilIcon className="w-3 h-3"/>
                            </button>
                        </div>
                    )}
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-gray-400" /></div>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0"><ChatBotIcon className="w-5 h-5 text-cyan-400" /></div>
                <div className="px-4 py-3 bg-gray-700 rounded-xl flex items-center gap-2">
                    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>
          <footer className="p-4 border-t border-gray-700">
            <div className="relative">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask a question or give a command..."
                rows={1}
                className="w-full bg-gray-700 border-gray-600 rounded-xl py-3 pl-4 pr-12 text-sm resize-none"
                style={{minHeight: '48px', maxHeight: '150px'}}
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed">
                <SendIcon className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          </footer>
        </div>
      </div>

      <button
        ref={fabRef}
        onClick={handleFabClick}
        onMouseDown={handleFabMouseDown}
        style={{
            left: chatFabPosition ? `${chatFabPosition.x}px` : 'auto',
            right: chatFabPosition ? 'auto' : '1.5rem',
            top: chatFabPosition ? `${chatFabPosition.y}px` : 'auto',
            bottom: chatFabPosition ? 'auto' : '1.5rem',
        }}
        className={`fixed w-14 h-14 rounded-full bg-lime-500 hover:bg-lime-600 text-gray-900 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out z-40 transform hover:scale-110 active:scale-95 ${isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
        aria-label="Open AI Assistant"
        data-tour-id="ai-assistant-fab"
      >
        <FloatingActionButtonIcon icon={chatIcon} className="w-7 h-7" />
      </button>
      
      <AlertDialog isOpen={!!convoToDelete} onClose={() => setConvoToDelete(null)} onConfirm={() => { if(convoToDelete) deleteConversation(convoToDelete); setConvoToDelete(null); }} title="Delete Conversation?" description="This will permanently delete this chat history." />
    </>
  );
};