import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-lg w-full">
        <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-lg text-gray-500 mb-4">Coming Soon!</p>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;