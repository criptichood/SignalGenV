import React from 'react';
import type { Page } from '@/types';

interface FormattedReasoningProps {
    text: string;
    onNavigate?: (page: Page) => void;
}

// A more advanced markdown parser for bold text and links.
const parseMarkdown = (text: string, onNavigate?: (page: Page) => void): React.ReactNode[] => {
  // Split by bold markers or link markers, keeping the delimiters.
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g).filter(Boolean);
  
  return parts.map((part, index) => {
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    // Link
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const [, linkText, url] = linkMatch;
      
      // Internal navigation link
      if (url.startsWith('#/')) {
        const pageId = url.substring(2);
        const handleNavClick = (e: React.MouseEvent) => {
          e.preventDefault();
          if (onNavigate) {
            onNavigate(pageId as Page);
          }
        };
        return <a key={index} href={url} onClick={handleNavClick} className="text-cyan-400 hover:underline font-semibold">{linkText}</a>;
      }

      // External link
      if (url.startsWith('http')) {
        return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{linkText}</a>;
      }
    }
    
    return part; // Return plain text part
  });
};


/**
 * A markdown-like renderer that supports paragraphs, lists, bold text, and clickable links.
 */
export const FormattedReasoning = ({ text, onNavigate }: FormattedReasoningProps) => {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 leading-relaxed">
          {currentList.map((item, index) => (
            <li key={index}>{parseMarkdown(item, onNavigate)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const lines = text.split('\n');

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const isListItem = /^(?:-|\*|\d+\.)\s/.test(trimmedLine);

    if (isListItem) {
      currentList.push(trimmedLine.replace(/^(?:-|\*|\d+\.)\s/, ''));
    } else {
      flushList();
      if (trimmedLine.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="my-2 leading-relaxed">
            {parseMarkdown(line, onNavigate)}
          </p>
        );
      }
    }
  });

  flushList();

  return <div className="text-sm font-light text-gray-300">{elements}</div>;
};
