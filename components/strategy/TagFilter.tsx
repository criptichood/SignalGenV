import React from 'react';
import { FilterIcon } from '@/components/icons/FilterIcon';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
  onClear: () => void;
}

export const TagFilter = ({ allTags, selectedTags, onTagClick, onClear }: TagFilterProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
        <FilterIcon className="w-4 h-4" />
        Filter by Tag
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onClear}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
            selectedTags.length === 0
              ? 'bg-cyan-500 text-white shadow'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 capitalize ${
              selectedTags.includes(tag)
                ? 'bg-cyan-500 text-white shadow'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
