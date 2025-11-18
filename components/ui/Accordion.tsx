

import React, { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';

interface AccordionProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const Accordion = ({ trigger, children }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-gray-700 pt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-gray-300 hover:text-white"
      >
        <div className="font-semibold">{trigger}</div>
        <ChevronsUpDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};