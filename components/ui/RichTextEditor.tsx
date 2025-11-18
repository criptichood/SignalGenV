import React, { useRef, useState, useEffect } from 'react';
import { BoldIcon } from '@/components/icons/BoldIcon';
import { ItalicIcon } from '@/components/icons/ItalicIcon';
import { UnderlineIcon } from '@/components/icons/UnderlineIcon';
import { ListIcon } from '@/components/icons/ListIcon';
import { ListOrderedIcon } from '@/components/icons/ListOrderedIcon';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  isActive?: boolean;
  title: string;
}

const ToolbarButton = ({ onMouseDown, children, isActive, title }: ToolbarButtonProps) => (
  <button
    type="button"
    title={title}
    onMouseDown={onMouseDown}
    className={`p-2 rounded-md transition-colors ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-600 hover:text-white'}`}
  >
    {children}
  </button>
);

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const lastValue = useRef(value);

  // Sync the editor's content only when the `value` prop changes from an external source.
  // This prevents the cursor jump issue caused by re-rendering on every input.
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      lastValue.current = value;
    }
  }, [value]);

  const handleCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats: Record<string, boolean> = {};
    ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].forEach(cmd => {
      try {
        formats[cmd] = document.queryCommandState(cmd);
      } catch (e) {
        formats[cmd] = false;
      }
    });
    setActiveFormats(formats);
  };
  
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newHtml = e.currentTarget.innerHTML;
    if (lastValue.current !== newHtml) {
      lastValue.current = newHtml;
      onChange(newHtml);
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="bg-gray-700 border-transparent rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500">
      <div className="flex items-center gap-1 p-2 border-b border-gray-600">
        <ToolbarButton title="Bold" onMouseDown={e => { e.preventDefault(); handleCommand('bold'); }} isActive={activeFormats['bold']}><BoldIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Italic" onMouseDown={e => { e.preventDefault(); handleCommand('italic'); }} isActive={activeFormats['italic']}><ItalicIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Underline" onMouseDown={e => { e.preventDefault(); handleCommand('underline'); }} isActive={activeFormats['underline']}><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
        <div className="w-px h-5 bg-gray-600 mx-1"></div>
        <ToolbarButton title="Bulleted List" onMouseDown={e => { e.preventDefault(); handleCommand('insertUnorderedList'); }} isActive={activeFormats['insertUnorderedList']}><ListIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Numbered List" onMouseDown={e => { e.preventDefault(); handleCommand('insertOrderedList'); }} isActive={activeFormats['insertOrderedList']}><ListOrderedIcon className="w-4 h-4" /></ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        className="min-h-[200px] max-w-none p-3 text-white focus:outline-none [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:pl-4 [&>:last-child]:mb-4"
        data-placeholder={placeholder}
      >
      </div>
    </div>
  );
};