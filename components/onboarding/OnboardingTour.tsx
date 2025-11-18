import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { useSignalGenStore } from '@/store/signalGenStore';
import { Button } from '@/components/ui/Button';
import { X, ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react';
import { createPortal } from 'react-dom';

type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

interface TourStep {
    selector?: string;
    title: string;
    content: string;
    position?: PopoverPosition;
    preAction?: () => void;
}

export const OnboardingTour = () => {
    const { 
        tourStep, 
        nextTourStep, 
        prevTourStep, 
        endTour, 
        setCurrentPage,
        setIsSidebarOpen,
    } = useStore();
    
    const tourSteps: TourStep[] = useMemo(() => [
        { // Step 0: Welcome Modal
            title: "Welcome to Signal Gen!",
            content: "This quick tour will walk you through the core features of your new AI trading assistant. Let's get started!",
            position: 'center',
        },
        { // Step 1: Sidebar
            selector: '[data-tour-id="sidebar"]',
            title: "Navigation Sidebar",
            content: "This is your main navigation. You can access all the app's powerful tools from here, from signal generation to analytics.",
            position: 'right',
            preAction: () => {
                if(window.innerWidth > 1024) setIsSidebarOpen(true);
            }
        },
        { // Step 2: Signal Gen Page
            selector: '[data-tour-id="sidebar-signal-gen-link"]',
            title: "Signal Generator",
            content: "This is where the magic happens. Let's go here to generate your first AI-powered swing trade signal.",
            position: 'right',
            preAction: () => {
                setCurrentPage('dashboard');
                if(window.innerWidth > 1024) setIsSidebarOpen(true);
            }
        },
        { // Step 3: Controls Panel
            selector: '[data-tour-id="signal-gen-controls"]',
            title: "The Controls Panel",
            content: "Before generating a signal, you can configure all the parameters here, like the symbol, timeframe, and your risk settings.",
            position: 'right',
            preAction: () => {
                setCurrentPage('signal-gen');
                if (window.innerWidth > 1024) setIsSidebarOpen(true);
                useSignalGenStore.getState().setIsControlsOpen(true);
            }
        },
        { // Step 4: Generate Button
            selector: '[data-tour-id="generate-signal-button"]',
            title: "Generate Your Signal",
            content: "Once you're happy with your settings, click this button to have the AI analyze the market and generate a trade idea.",
            position: 'top',
             preAction: () => {
                setCurrentPage('signal-gen');
                if (window.innerWidth > 1024) setIsSidebarOpen(true);
                useSignalGenStore.getState().setIsControlsOpen(true);
            }
        },
        { // Step 5: AI Assistant
            selector: '[data-tour-id="ai-assistant-fab"]',
            title: "Your AI Co-Pilot",
            content: "This is your AI Assistant. You can ask it questions about trading, get help with the app, or even command it to perform actions for you!",
            position: 'left',
        },
        { // Step 6: Final Modal
            title: "You're All Set!",
            content: "You've learned the basics. Feel free to explore the other pages like Scalping, Analytics, and your Profile. Happy trading!",
            position: 'center',
        },
    ], [setCurrentPage, setIsSidebarOpen]);

    const currentStepConfig = tourSteps[tourStep];
    const [highlightStyle, setHighlightStyle] = useState({});
    const [popoverStyle, setPopoverStyle] = useState({});
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    useLayoutEffect(() => {
        currentStepConfig.preAction?.();

        const updatePosition = () => {
            if (!currentStepConfig.selector) {
                setHighlightStyle({ display: 'none' });
                setPopoverStyle({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                });
                return;
            }

            const target = document.querySelector(currentStepConfig.selector);
            if (target) {
                const rect = target.getBoundingClientRect();
                const padding = 4;
                
                const newHighlightStyle = {
                    top: `${rect.top - padding}px`,
                    left: `${rect.left - padding}px`,
                    width: `${rect.width + (padding * 2)}px`,
                    height: `${rect.height + (padding * 2)}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                    borderRadius: getComputedStyle(target).borderRadius,
                };
                
                target.classList.add('tour-highlighted-element');
                setHighlightStyle(newHighlightStyle);

                const popoverRect = { width: 320, height: 220 }; // Approximate popover dimensions
                let newPopoverStyle: any = {};
                const popoverMargin = 15;

                switch(currentStepConfig.position) {
                    case 'right':
                        newPopoverStyle = { top: `${rect.top}px`, left: `${rect.right + popoverMargin}px` };
                        break;
                    case 'left':
                        newPopoverStyle = { top: `${rect.top}px`, left: `${rect.left - popoverRect.width - popoverMargin}px` };
                        break;
                    case 'bottom':
                        newPopoverStyle = { top: `${rect.bottom + popoverMargin}px`, left: `${rect.left + (rect.width / 2) - (popoverRect.width / 2)}px` };
                        break;
                    case 'top':
                        newPopoverStyle = { top: `${rect.top - popoverRect.height - popoverMargin}px`, left: `${rect.left + (rect.width / 2) - (popoverRect.width / 2)}px` };
                        break;
                }

                if (newPopoverStyle.left < 0) newPopoverStyle.left = `${popoverMargin}px`;
                if (newPopoverStyle.left + popoverRect.width > window.innerWidth) newPopoverStyle.left = `${window.innerWidth - popoverRect.width - popoverMargin}px`;
                if (newPopoverStyle.top < 0) newPopoverStyle.top = `${popoverMargin}px`;
                if (newPopoverStyle.top + popoverRect.height > window.innerHeight) newPopoverStyle.top = `${window.innerHeight - popoverRect.height - popoverMargin}px`;

                setPopoverStyle(newPopoverStyle);
            }
        };

        const timer = setTimeout(updatePosition, 200); // Increased delay for animations to finish

        return () => {
            clearTimeout(timer);
            const selector = currentStepConfig.selector;
            if (selector) {
                const target = document.querySelector(selector);
                if (target) {
                    target.classList.remove('tour-highlighted-element');
                }
            }
        };
    }, [tourStep, tourSteps]);

    if (!isMounted) return null;

    const PopoverContent = (
        <div className="tour-popover" style={popoverStyle}>
            {currentStepConfig.position !== 'center' && (
                 <button onClick={endTour} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full transition-colors">
                    <X className="w-4 h-4" />
                </button>
            )}
            <div className="p-5">
                {currentStepConfig.position === 'center' && <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto mb-4" />}
                <h3 className={`text-xl font-bold mb-2 text-white ${currentStepConfig.position === 'center' ? 'text-center' : ''}`}>{currentStepConfig.title}</h3>
                <p className={`text-sm text-gray-300 ${currentStepConfig.position === 'center' ? 'text-center' : ''}`}>{currentStepConfig.content}</p>
            </div>
            <div className="px-5 py-3 bg-gray-900/50 rounded-b-lg border-t border-gray-700/50 flex justify-between items-center">
                <button onClick={endTour} className="text-xs text-gray-500 hover:text-white transition-colors">Skip Tour</button>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        {tourSteps.map((_, index) => (
                            <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === tourStep ? 'bg-cyan-400' : 'bg-gray-600'}`}></div>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                        {tourStep > 0 && <Button onClick={prevTourStep} variant="outline" className="h-8 px-3 text-sm"><ArrowLeft className="w-4 h-4 mr-1"/> Prev</Button>}
                        <Button onClick={tourStep === tourSteps.length - 1 ? endTour : nextTourStep} className="h-8 px-3 text-sm">
                            {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4 ml-1"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
    
    return createPortal(
        <div className="fixed inset-0 z-[1000]">
             <div 
                className="tour-highlight-cutout"
                style={highlightStyle}
            ></div>
             {PopoverContent}
        </div>,
        document.body
    );
};
