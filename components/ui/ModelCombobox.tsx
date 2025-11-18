import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChevronsUpDown, Check, Star } from 'lucide-react';
import type { AiModel } from '@/types';

interface ModelComboboxProps {
  models: AiModel[];
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const ModelCombobox = ({ models, value, onSelect, disabled }: ModelComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [favoriteModels, setFavoriteModels] = useLocalStorage<string[]>('favoriteModels', []);
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

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    setIsOpen(false);
  };

  const toggleFavorite = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setFavoriteModels(prev =>
      prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
    );
  };

  const selectedModelName = models.find(m => m.id === value)?.name || 'Select a model...';

  const modelGroups = useMemo(() => {
    const favorites = models.filter(m => favoriteModels.includes(m.id));
    const otherModels = models.filter(m => !favoriteModels.includes(m.id));

    return [
      { title: 'Favorites', items: favorites },
      { title: 'Available Models', items: otherModels },
    ];
  }, [models, favoriteModels]);

  return (
    <div className="relative" ref={comboboxRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex justify-between items-center bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{selectedModelName}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
            {favoriteModels.includes(value) && (
                <Star fill="currentColor" className="w-4 h-4 text-yellow-300" />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          <ul className="max-h-60 overflow-y-auto p-1">
            {modelGroups.map(group => (
              group.items.length > 0 && (
                <React.Fragment key={group.title}>
                  <li className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">{group.title}</li>
                  {group.items.map(model => (
                    <li
                      key={model.id}
                      onClick={() => handleSelect(model.id)}
                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer group rounded-md"
                    >
                      <span>{model.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(e, model.id)}
                          className={`p-1 rounded-full ${favoriteModels.includes(model.id) ? 'text-yellow-300' : 'text-gray-500 opacity-50 group-hover:opacity-100'} hover:text-yellow-300 transition-opacity`}
                          aria-label={`Favorite ${model.name}`}
                        >
                          <Star fill={favoriteModels.includes(model.id) ? "currentColor" : "none"} className="w-4 h-4" />
                        </button>
                        {value === model.id && <Check className="h-4 w-4 text-cyan-400" />}
                      </div>
                    </li>
                  ))}
                </React.Fragment>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};