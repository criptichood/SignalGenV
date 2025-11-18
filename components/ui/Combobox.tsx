import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/Button';
import { ChevronsUpDown, Check, Star } from 'lucide-react';

interface ComboboxProps {
  symbols: string[];
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * A simple fuzzy search function.
 * Checks if the characters of the pattern appear in the string in order, but not necessarily consecutively.
 * e.g., 'btu' will match 'BTCUSDT'.
 */
const fuzzyMatch = (pattern: string, str: string): boolean => {
    const lowerPattern = pattern.toLowerCase();
    const lowerStr = str.toLowerCase();
    let patternIndex = 0;
    let strIndex = 0;

    while (patternIndex < lowerPattern.length && strIndex < lowerStr.length) {
        if (lowerPattern[patternIndex] === lowerStr[strIndex]) {
            patternIndex++;
        }
        strIndex++;
    }

    return patternIndex === lowerPattern.length;
};


export const Combobox = ({ symbols, value, onSelect, disabled, favorites, setFavorites }: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recents, setRecents] = useLocalStorage<string[]>('recentSymbols', []);
  const comboboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setSearch('');
    setIsOpen(false);
    // Add to recents
    setRecents(prev => {
      const updated = [symbol, ...prev.filter(s => s !== symbol)];
      return updated.slice(0, 5); // Keep only last 5
    });
  };

  const toggleFavorite = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(symbol) 
      ? prev.filter(s => s !== symbol) 
      : [symbol, ...prev] // Prepend to make it the most recent
    );
  };
  
  const filteredSymbols = useMemo(() => {
    if (!search) return [];
    return symbols.filter(s => fuzzyMatch(search, s));
  }, [search, symbols]);

  const symbolGroups = [
    { title: 'Favorites', items: favorites.slice(0, 5).filter(s => symbols.includes(s)) },
    { title: 'Recents', items: recents.filter(s => symbols.includes(s)) },
    { title: 'All Symbols', items: symbols },
  ];

  return (
    <div className="relative" ref={comboboxRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex justify-between items-center bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{value || 'Select a symbol...'}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
            {favorites.includes(value) && (
                <Star fill="currentColor" className="w-4 h-4 text-yellow-300" />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search symbol..."
              className="w-full bg-gray-900 border-gray-700 rounded-md py-1.5 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {search ? (
              filteredSymbols.length > 0 ? (
                filteredSymbols.map(symbol => (
                  <li key={symbol} onClick={() => handleSelect(symbol)} className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer">
                    <span>{symbol}</span>
                     {value === symbol && <Check className="h-4 w-4 text-cyan-400" />}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-gray-500 text-center">No symbols found.</li>
              )
            ) : (
                symbolGroups.map(group => (
                    group.items.length > 0 && (
                        <React.Fragment key={group.title}>
                            <li className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">{group.title}</li>
                            {group.items.map(symbol => (
                                <li key={symbol} onClick={() => handleSelect(symbol)} className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer group">
                                    <span>{symbol}</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button" 
                                            onClick={(e) => toggleFavorite(e, symbol)} 
                                            className={`p-1 rounded-full ${favorites.includes(symbol) ? 'text-yellow-300' : 'text-gray-500 opacity-50 group-hover:opacity-100'} hover:text-yellow-300 transition-opacity`}
                                        >
                                            <Star fill={favorites.includes(symbol) ? "currentColor" : "none"} className="w-4 h-4" />
                                        </button>
                                        {value === symbol && <Check className="h-4 w-4 text-cyan-400" />}
                                    </div>
                                </li>
                            ))}
                        </React.Fragment>
                    )
                ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};