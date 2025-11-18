import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { PageContext } from '@/types';
import type { ChatConversation, ChatMessage, UserParams, Strategy, UserPost } from '@/types';
import { useChatStore } from '@/store/chatStore';
import { generateChatTitle, generateSignalFunctionDeclaration, generateScalpingSignalFunctionDeclaration, createStrategyFunctionDeclaration, createPostFunctionDeclaration, SYSTEM_INSTRUCTION, summarizeNewsFunctionDeclaration, getLivePnlFunctionDeclaration, setPriceAlertFunctionDeclaration, getTutorialContentFunctionDeclaration } from '@/services/chatService';
import { MOCK_ANALYZED_NEWS } from '@/store/newsStore';
import { tutorialsData } from '@/data/tutorialData';

// Define the type for import.meta.env to resolve TypeScript error
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Get API key from environment - in browser, this will be processed by Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please set VITE_GEMINI_API_KEY in your .env file");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

export function useChat(
  context: PageContext,
  triggerSignalGeneration: (params: Partial<UserParams>) => void,
  triggerScalpGeneration: (params: Partial<UserParams>) => void,
  createStrategy: (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'authorUsername'>) => void,
  createPost: (postData: Omit<UserPost, 'id' | 'createdAt' | 'likedBy' | 'repostedBy' | 'commentCount' | 'comments' | 'author' | 'attachedSignalId' | 'attachedTradeIdea'>) => void,
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void
) {
  const {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    clearAllConversations,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  const startNewConversation = useCallback(() => {
    const newConvo: ChatConversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setConversations(prev => [newConvo, ...prev]);
    setCurrentConversationId(newConvo.id);
  }, [setConversations, setCurrentConversationId]);

  // Auto-select a conversation or create a new one
  useEffect(() => {
    if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    } else if (conversations.length === 0) {
      startNewConversation();
    }
  }, [conversations, currentConversationId, setCurrentConversationId, startNewConversation]);

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null;

  // Re-initialize chat instance when conversation or context changes
  useEffect(() => {
    if (currentConversation) {
      const geminiHistory = currentConversation.messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: context.functionCallingEnabled
            ? [{ functionDeclarations: [generateSignalFunctionDeclaration, generateScalpingSignalFunctionDeclaration, createStrategyFunctionDeclaration, createPostFunctionDeclaration, summarizeNewsFunctionDeclaration, getLivePnlFunctionDeclaration, setPriceAlertFunctionDeclaration, getTutorialContentFunctionDeclaration] }]
            : undefined,
        },
        history: geminiHistory
      });
    }
  }, [currentConversationId, conversations, context.functionCallingEnabled]);


  const updateConversation = useCallback((id: string, updates: Partial<ChatConversation> | ((c: ChatConversation) => Partial<ChatConversation>)) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === id) {
          const newUpdates = typeof updates === 'function' ? updates(c) : updates;
          return { ...c, ...newUpdates };
        }
        return c;
      })
    );
  }, [setConversations]);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, [setCurrentConversationId]);

  const renameConversation = useCallback((id: string, newTitle: string) => {
      if (newTitle.trim()) {
          updateConversation(id, { title: newTitle.trim() });
      }
  }, [updateConversation]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const newConversations = prev.filter(c => c.id !== id);
      if (currentConversationId === id) {
        setCurrentConversationId(newConversations[0]?.id || null);
      }
      return newConversations;
    });
  }, [setConversations, currentConversationId, setCurrentConversationId]);

  const sendMessage = useCallback(async (prompt: string) => {
    const chat = chatRef.current;
    if (!currentConversationId || !chat) return;

    let fullPrompt = prompt;
    if (context.contextualChatEnabled && context.signal && (context.page === 'signal-gen' || context.page === 'scalping')) {
        const contextHeader = `---
CONTEXT: The user is currently viewing the following trading signal on the "${context.page}" page. Use this data to answer their question.
SIGNAL DATA:
${JSON.stringify(context.signal, null, 2)}

USER PARAMETERS USED FOR SIGNAL:
${JSON.stringify(context.params, null, 2)}
---

USER QUESTION:
`;
        fullPrompt = `${contextHeader}"${prompt}"`;
    }

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    const placeholderModelMessage: ChatMessage = { role: 'model', content: '' };
    const isFirstUserMessage = currentConversation?.messages.length === 0;

    updateConversation(currentConversationId, c => ({ messages: [...c.messages, userMessage, placeholderModelMessage] }));
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: fullPrompt });

      let aggregatedText = '';
      let functionCalls: any[] = [];
      let finalChunk: any = null;

      for await (const chunk of stream) {
        // Manually aggregate text from parts to avoid the .text getter warning
        let chunkText = '';
        if (chunk.candidates?.[0]?.content?.parts) {
            for (const part of chunk.candidates[0].content.parts) {
                if (part.text) {
                    chunkText += part.text;
                }
            }
        }

        if (chunkText) {
          aggregatedText += chunkText;
          updateConversation(currentConversationId, c => {
            const newMessages = [...c.messages];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1].content = aggregatedText;
            }
            return { messages: newMessages };
          });
        }

        // The library conveniently aggregates function calls, so we can keep using this.
        if (chunk.functionCalls) {
          functionCalls.push(...chunk.functionCalls);
        }
        finalChunk = chunk;
      }

      const finalFunctionCalls = finalChunk?.functionCalls || functionCalls;

      if (finalFunctionCalls && finalFunctionCalls.length > 0) {
        const fc = finalFunctionCalls[0];

        let toolResultMessage = 'Action initiated.';
        switch(fc.name) {
          case 'generateSignal':
            triggerSignalGeneration(fc.args as Partial<UserParams>);
            toolResultMessage = `Signal generation started for ${fc.args.symbol}. The user can view the progress on the 'Signal Gen' page.`;
            break;
          case 'generateScalpingSignal':
            triggerScalpGeneration(fc.args as Partial<UserParams>);
            toolResultMessage = `Scalping signal generation started for ${fc.args.symbol}. The user can view the progress on the 'Scalping' page.`;
            break;
          case 'createStrategy':
            createStrategy(fc.args as Omit<Strategy, 'id' | 'createdAt' | 'authorUsername'>);
            toolResultMessage = `A new strategy titled "${fc.args.title}" has been created and saved. The user can view it on the 'Strategies' page.`;
            break;
          case 'createPost':
            createPost(fc.args as Pick<UserPost, 'content'>);
            toolResultMessage = `A new post has been created and saved. The user can view it on their 'Profile' page.`;
            break;
          case 'summarizeNews':
            const topic = fc.args.topic || '';
            const relevantArticles = MOCK_ANALYZED_NEWS.filter(a => a.title.toLowerCase().includes(topic.toLowerCase()) || a.description.toLowerCase().includes(topic.toLowerCase()));
            if (relevantArticles.length > 0) {
                const summary = relevantArticles.slice(0, 3).map(a => `- Title: ${a.title}, Source: ${a.source}, URL: ${a.url}`).join('\n');
                toolResultMessage = `I found ${relevantArticles.length} articles about ${topic}. Here are the top ones:\n${summary}`;
            } else {
                toolResultMessage = `I couldn't find any recent news about ${topic}.`;
            }
            break;
          case 'getLivePnl':
            toolResultMessage = "Based on a mock calculation, your current unrealized P/L across all live positions is +$245.80. This feature is for demonstration purposes as I cannot access live account data.";
            break;
          case 'setPriceAlert':
            const { symbol, price } = fc.args;
            setToast({ message: `Price alert set for ${symbol} at $${price}`, variant: 'success' });
            toolResultMessage = `I've set a price alert for ${symbol} at $${price}.`;
            break;
          case 'getTutorialContent':
            const tutorialTitle = fc.args.title;
            let foundTutorial = null;
            // Search through all categories to find the tutorial
            for (const category in tutorialsData) {
                const tutorial = tutorialsData[category as keyof typeof tutorialsData].find(t => t.title === tutorialTitle);
                if (tutorial) {
                    foundTutorial = tutorial;
                    break;
                }
            }
            if (foundTutorial) {
                toolResultMessage = `Here is the content for "${foundTutorial.title}":\n\n${foundTutorial.content}`;
            } else {
                toolResultMessage = `I could not find a tutorial with the exact title "${tutorialTitle}". I can still try to answer your question from my general knowledge.`;
            }
            break;
        }

        const toolResponseResultStream = await chat.sendMessageStream({
          message: [ { functionResponse: { name: fc.name, response: { result: toolResultMessage } } } ],
        });

        const toolResponsePlaceholder: ChatMessage = { role: 'model', content: '' };
        updateConversation(currentConversationId, c => ({ messages: [...c.messages, toolResponsePlaceholder] }));

        let toolAggregatedText = '';
        for await (const chunk of toolResponseResultStream) {
            let chunkText = '';
            if (chunk.candidates?.[0]?.content?.parts) {
                for (const part of chunk.candidates[0].content.parts) {
                    if (part.text) {
                        chunkText += part.text;
                    }
                }
            }

            if (chunkText) {
                toolAggregatedText += chunkText;
                updateConversation(currentConversationId, c => {
                    const newMessages = [...c.messages];
                    newMessages[newMessages.length - 1].content = toolAggregatedText;
                    return { messages: newMessages };
                });
            }
        }
      }

      if (isFirstUserMessage) {
        generateChatTitle(prompt).then(newTitle => {
          if (newTitle) updateConversation(currentConversationId, { title: newTitle });
        });
      }

    } catch (error: any) {
      console.error("Chat Error:", error);
      let friendlyMessage = "Sorry, an unexpected error occurred. Please try again later.";
      const errorMessage = error.message?.toLowerCase() || '';

      if (errorMessage.includes('api_key')) {
        friendlyMessage = "There seems to be an issue with the API configuration. Please ensure everything is set up correctly.";
      } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
        friendlyMessage = "The response was blocked due to safety settings. Please try rephrasing your prompt.";
      } else if (errorMessage.includes('network') || errorMessage.includes('failed to fetch')) {
        friendlyMessage = "It seems I'm having trouble connecting to the network. Please check your connection and try again.";
      } else if (error.status >= 500) {
        friendlyMessage = "The AI service is currently unavailable. Please try again in a few moments.";
      } else if (error.status >= 400) {
         friendlyMessage = "The AI model couldn't process that request. Please try again or rephrase your question.";
      }

      updateConversation(currentConversationId, c => {
        const newMessages = [...c.messages];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1].content = friendlyMessage;
        }
        return { messages: newMessages };
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, currentConversation, updateConversation, triggerSignalGeneration, triggerScalpGeneration, createStrategy, createPost, context, setToast]);


  const editMessageAndResend = useCallback(async (messageIndex: number, newContent: string) => {
    if (!currentConversationId || !currentConversation) return;

    const userMessageToEdit = currentConversation.messages[messageIndex];
    if (userMessageToEdit?.role !== 'user') return;

    const historyToResend = currentConversation.messages.slice(0, messageIndex);
    const updatedUserMessage: ChatMessage = { ...userMessageToEdit, content: newContent };

    const newConvo: ChatConversation = {
      id: crypto.randomUUID(),
      title: 'Edited Chat',
      messages: [...historyToResend, updatedUserMessage],
      createdAt: Date.now(),
    };

    setConversations(prev => [newConvo, ...prev]);
    setCurrentConversationId(newConvo.id);

    setTimeout(() => {
        sendMessage(newContent);
    }, 100);

  }, [currentConversationId, currentConversation, setConversations, setCurrentConversationId, sendMessage]);


  return {
    conversations,
    currentConversation,
    isLoading,
    selectConversation,
    startNewConversation,
    sendMessage,
    renameConversation,
    deleteConversation,
    editMessageAndResend,
    clearAllConversations,
  };
}