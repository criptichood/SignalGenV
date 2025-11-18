

import React from 'react';

export const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className="block text-sm font-medium text-gray-300 mb-1"
      {...props}
    />
  );
};