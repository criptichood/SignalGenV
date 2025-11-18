import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useChatStore } from '../store/chatStore';
import type { ThemeMode, ThemeAccent, ChatIconType } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { BellIcon } from '../components/icons/BellIcon';
import { CloudIcon } from '../components/icons/CloudIcon';
import { ChatBotIcon } from '../components/icons/ChatBotIcon';
import { Button } from '../components/ui/Button';
import { Trash2Icon } from '../components/icons/Trash2Icon';
import { AlertDialog } from '../components/ui/AlertDialog';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { LightbulbIcon } from '../components/icons/LightbulbIcon';
import { MessageSquareIcon } from '../components/icons/MessageSquareIcon';
import { ZapIcon } from '../components/icons/ZapIcon';
import { Loader2Icon } from '../components/icons/Loader2Icon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { getSupportedExchanges } from '../services/exchangeService';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';


const accentColors: { name: ThemeAccent; bgClass: string }[] = [
    { name: 'cyan', bgClass: 'bg-cyan-500' },
    { name: 'red', bgClass: 'bg-red-500' },
    { name: 'green', bgClass: 'bg-green-500' },
    { name: 'blue', bgClass: 'bg-blue-500' },
    { name: 'purple', bgClass: 'bg-purple-500' },
    { name: 'orange', bgClass: 'bg-orange-500' },
];

const chatIcons: { name: ChatIconType; icon: React.ReactNode }[] = [
    { name: 'bot', icon: <ChatBotIcon className="w-5 h-5" /> },
    { name: 'sparkles', icon: <SparklesIcon className="w-5 h-5" /> },
    { name: 'lightbulb', icon: <LightbulbIcon className="w-5 h-5" /> },
    { name: 'message', icon: <MessageSquareIcon className="w-5 h-5" /> },
];

type SaveStatus = 'idle' | 'typing' | 'saved';

const ApiKeyInput: React.FC<{
  id: string;
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ id, label, description, value, onChange, placeholder }) => {
    const [status, setStatus] = useState<SaveStatus>('idle');
    const debounceTimer = React.useRef<number | null>(null);

    useEffect(() => {
        // Don't show status on initial load
        if (value) setStatus('idle');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setStatus('typing');
        onChange(newValue);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = window.setTimeout(() => {
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        }, 1000);
    };
    
    const StatusIndicator = () => {
        switch (status) {
            case 'typing':
                return <Loader2Icon className="w-4 h-4 text-gray-400 animate-spin" />;
            case 'saved':
                return <CheckIcon className="w-4 h-4 text-green-400" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label htmlFor={id} className="block text-sm font-medium text-gray-300">{label}</label>
                <div className="flex items-center gap-2 text-xs text-gray-400 h-5">
                    <StatusIndicator />
                    {status === 'saved' && <span>Saved</span>}
                </div>
            </div>
            {description && <p className="text-xs text-gray-500 -mt-1 mb-2">{description}</p>}
            <input 
                type="password" 
                id={id} 
                value={value} 
                onChange={handleChange} 
                placeholder={placeholder} 
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" 
            />
        </div>
    );
};

export default function SettingsPage() {
    const {
        bybitApiKey, setBybitApiKey,
        bybitApiSecret, setBybitApiSecret,
        binanceApiKey, setBinanceApiKey,
        binanceApiSecret, setBinanceApiSecret,
        theme, setThemeMode, setThemeAccent,
        audioAlertsEnabled, setAudioAlertsEnabled,
        cloudSyncEnabled, setCloudSyncEnabled,
        contextualChatEnabled, setContextualChatEnabled,
        functionCallingEnabled, setFunctionCallingEnabled,
        chatIcon, setChatIcon
    } = useStore();
    const { clearAllConversations } = useChatStore();

    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState('bybit');
    const supportedExchanges = getSupportedExchanges();


    const handleConfirmClear = () => {
        clearAllConversations();
        setIsAlertOpen(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your application preferences and API keys.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Color Mode</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setThemeMode('light')} className={`py-2 px-4 rounded-md text-sm font-semibold border transition-colors ${theme.mode === 'light' ? 'bg-white text-gray-900 border-gray-300' : 'bg-gray-700 text-gray-300 border-transparent hover:bg-gray-600'}`}>
                                        Light
                                    </button>
                                    <button onClick={() => setThemeMode('dark')} className={`py-2 px-4 rounded-md text-sm font-semibold border transition-colors ${theme.mode === 'dark' ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-gray-700 text-gray-300 border-transparent hover:bg-gray-600'}`}>
                                        Dark
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                                <div className="flex items-center gap-4">
                                    {accentColors.map(({ name, bgClass }) => (
                                        <button key={name} onClick={() => setThemeAccent(name)} className={`w-8 h-8 rounded-full ${bgClass} transition-all duration-200 ring-offset-2 ring-offset-gray-800 ${theme.accent === name ? 'ring-2 ring-white' : 'hover:scale-110'}`} aria-label={`Set accent color to ${name}`} />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Assistant */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ChatBotIcon className="w-5 h-5 text-cyan-400"/> AI Assistant</CardTitle>
                            <CardDescription>Manage your chat settings and data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-center justify-between">
                                <div>
                                    <label htmlFor="context-chat" className="block text-sm font-medium text-gray-300">Contextual Awareness</label>
                                    <p className="text-xs text-gray-500">Allow AI to use your current page context.</p>
                                </div>
                                <Switch id="context-chat" checked={contextualChatEnabled} onCheckedChange={setContextualChatEnabled} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label htmlFor="function-calling" className="block text-sm font-medium text-gray-300">Enable Function Calling</label>
                                    <p className="text-xs text-gray-500">Allow AI to trigger actions like generating signals.</p>
                                </div>
                                <Switch id="function-calling" checked={functionCallingEnabled} onCheckedChange={setFunctionCallingEnabled} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Chat Icon</label>
                                <div className="flex items-center gap-2 rounded-lg bg-gray-700/50 p-2">
                                    {chatIcons.map(({ name, icon }) => (
                                        <button
                                            key={name}
                                            onClick={() => setChatIcon(name)}
                                            className={`flex-1 flex items-center justify-center p-2 rounded-md transition-colors ${chatIcon === name ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-600'}`}
                                            aria-label={`Set chat icon to ${name}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-gray-700 pt-4">
                                <label className="block text-sm font-medium text-gray-300">Chat History</label>
                                <p className="text-xs text-gray-500 mb-2">This will permanently delete all conversations.</p>
                                <Button onClick={() => setIsAlertOpen(true)} className="w-full sm:w-auto bg-red-600/20 hover:bg-red-500/30 border border-red-500 text-red-300 font-semibold">
                                    <Trash2Icon className="w-4 h-4 mr-2"/> Clear All History
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                     {/* Notifications & Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>General application preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label htmlFor="audio-alerts" className="block text-sm font-medium text-gray-300">Audio Alerts</label>
                                    <p className="text-xs text-gray-500">Play sounds for new signals and TP hits.</p>
                                </div>
                                <Switch id="audio-alerts" checked={audioAlertsEnabled} onCheckedChange={setAudioAlertsEnabled} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label htmlFor="cloud-sync" className="block text-sm font-medium text-gray-300">Cloud Sync</label>
                                    <p className="text-xs text-gray-500">Sync history & strategies to the cloud.</p>
                                </div>
                                <Switch id="cloud-sync" checked={cloudSyncEnabled} onCheckedChange={setCloudSyncEnabled} />
                            </div>
                        </CardContent>
                    </Card>
                     {/* API Keys */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Exchange API Keys</CardTitle>
                            <CardDescription>Keys are stored securely in your browser's local storage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <Label htmlFor="exchange-select">Select Exchange</Label>
                                <Select
                                    id="exchange-select"
                                    value={selectedExchange}
                                    onValueChange={(value) => setSelectedExchange(value)}
                                    className="mt-1"
                                >
                                    {supportedExchanges.map(ex => (
                                        <option key={ex} value={ex} className="capitalize">{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>
                                    ))}
                                </Select>
                            </div>

                            {selectedExchange === 'bybit' && (
                                <div className="space-y-6 animate-fade-in-down">
                                    <ApiKeyInput
                                        id="bybit-key"
                                        label="Bybit API Key (Testnet Recommended)"
                                        description="Used for trade execution simulation."
                                        value={bybitApiKey}
                                        onChange={setBybitApiKey}
                                        placeholder="Enter Bybit API Key"
                                    />
                                    <ApiKeyInput
                                        id="bybit-secret"
                                        label="Bybit API Secret"
                                        value={bybitApiSecret}
                                        onChange={setBybitApiSecret}
                                        placeholder="Enter Bybit API Secret"
                                    />
                                </div>
                            )}

                            {selectedExchange === 'binance' && (
                                <div className="space-y-6 animate-fade-in-down">
                                    <ApiKeyInput
                                        id="binance-key"
                                        label="Binance API Key (Testnet Recommended)"
                                        description="Used for data fetching and trade execution simulation."
                                        value={binanceApiKey}
                                        onChange={setBinanceApiKey}
                                        placeholder="Enter Binance API Key"
                                    />
                                    <ApiKeyInput
                                        id="binance-secret"
                                        label="Binance API Secret"
                                        value={binanceApiSecret}
                                        onChange={setBinanceApiSecret}
                                        placeholder="Enter Binance API Secret"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={handleConfirmClear}
                title="Clear Chat History?"
                description="This will permanently delete all your conversations. This action cannot be undone."
            />
        </div>
    );
}
