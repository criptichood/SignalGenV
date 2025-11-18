import React from 'react';

export const CandleChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 5v4"/>
        <rect width="4" height="6" x="7" y="9" rx="1"/>
        <path d="M9 15v4"/>
        <path d="M17 3v2"/>
        <rect width="4" height="8" x="15" y="5" rx="1"/>
        <path d="M17 13v8"/>
    </svg>
);