import React, { createContext, useContext } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export const Tabs = ({ value, onValueChange, children, className }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode; className?: string }) => {
  return (
    <TabsContext.Provider value={{ activeTab: value, setActiveTab: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center rounded-lg bg-gray-900 p-1 ${className}`}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, disabled }: { value: string; children: React.ReactNode; disabled?: boolean }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within a Tabs component');
  
  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => !disabled && context.setActiveTab(value)}
      disabled={disabled}
      className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all flex items-center justify-center
        ${isActive ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within a Tabs component');
  
  const isActive = context.activeTab === value;

  return isActive ? (
    <div className={className}>
      {children}
    </div>
  ) : null;
};