import React from 'react';

export const ThreadConnector = () => {
  return (
    <div className="w-10 flex-shrink-0 relative self-stretch" aria-hidden="true">
      {/* Vertical part of the connector */}
      <div className="absolute top-0 left-5 h-[28px] w-px chain-line-vertical"></div>
      {/* Horizontal part of the connector */}
      <div className="absolute top-[28px] left-5 h-px w-5 chain-line-horizontal"></div>
    </div>
  );
};
