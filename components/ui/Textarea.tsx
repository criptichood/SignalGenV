

import React from 'react';

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      rows={3}
      className="w-full bg-gray-700 border-transparent rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
      {...props}
    />
  );
};