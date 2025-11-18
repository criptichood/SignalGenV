import React, { useState, useRef, useEffect, createContext, useContext, useLayoutEffect } from 'react';

interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // Use a more generic ref type to accommodate different trigger elements (div, button, etc.)
  triggerRef: React.RefObject<HTMLElement>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block text-left" ref={wrapperRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');
  
  const { isOpen, setIsOpen, triggerRef } = context;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<any>;
    const childProps = childElement.props;

    return React.cloneElement(childElement, {
      ...childProps,
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        childProps.onClick?.(e);
        handleToggle(e);
      },
    });
  }

  return <div ref={triggerRef as React.RefObject<HTMLDivElement>} onClick={handleToggle} className="cursor-pointer">{children}</div>;
};

export const DropdownMenuContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within a DropdownMenu');

  if (!context.isOpen) return null;

  return (
    <div className={`absolute z-50 mt-2 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-700 origin-top-right right-0 ${className}`}>
      <div className="py-1" role="menu" aria-orientation="vertical">
        {children}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className, disabled = false }: { children: React.ReactNode; onClick?: (event: React.MouseEvent) => void; className?: string; disabled?: boolean }) => {
  const context = useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (disabled) return;
    onClick?.(e);
    context?.setIsOpen(false);
  };
  
  return (
    <a
      href="#"
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm w-full transition-colors ${
          disabled
          ? 'text-gray-500 cursor-not-allowed'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      } ${className || ''}`}
      role="menuitem"
      aria-disabled={disabled}
    >
      {children}
    </a>
  );
};