import React from 'react';
import type { NewsArticle } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${Math.floor(seconds)}s ago`;
}

const SentimentIndicator = ({ sentiment }: { sentiment?: NewsArticle['sentiment'] }) => {
    if (!sentiment) return null;

    const config = {
        Bullish: { text: 'Bullish', color: 'text-green-400', icon: <TrendingUp className="w-4 h-4" /> },
        Bearish: { text: 'Bearish', color: 'text-red-400', icon: <TrendingDown className="w-4 h-4" /> },
        Neutral: { text: 'Neutral', color: 'text-yellow-400', icon: <Minus className="w-4 h-4" /> },
    };

    const { text, color, icon } = config[sentiment];

    return (
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};


interface NewsCardProps {
  article: NewsArticle;
  isFeatured?: boolean;
}

const NewsCard = ({ article, isFeatured = false }: NewsCardProps) => {
    if (isFeatured) {
        return (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden bg-gray-800 shadow-lg h-full group relative">
                <div className="h-96 relative">
                    {article.thumbnail ? (
                        <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : <div className="w-full h-full bg-gray-700" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <div className="flex items-center gap-4 mb-2">
                            {article.category && <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{article.category}</span>}
                            <SentimentIndicator sentiment={article.sentiment} />
                        </div>
                        <h2 className="text-2xl font-bold leading-tight group-hover:text-cyan-300 transition-colors">{article.title}</h2>
                    </div>
                </div>
                <div className="p-6 pt-4 bg-gray-800">
                    <p className="text-gray-400 text-sm line-clamp-2">{article.description}</p>
                    <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                        <span className="font-semibold">{article.source}</span>
                        <span>{timeAgo(article.timestamp)}</span>
                    </div>
                </div>
            </a>
        );
    }
    
    // Grid Card
    return (
         <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex flex-col bg-gray-800 rounded-lg shadow-lg h-full group transition-transform hover:-translate-y-1">
            {article.thumbnail && (
                <div className="h-40 overflow-hidden rounded-t-lg">
                    <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
                {article.category && <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">{article.category}</span>}
                <h3 className="font-semibold text-gray-200 leading-snug flex-grow group-hover:text-cyan-300 transition-colors">{article.title}</h3>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/50">
                    <SentimentIndicator sentiment={article.sentiment} />
                    <div className="text-xs text-gray-500">
                        <span className="font-semibold">{article.source.split(' ')[0]}</span> &middot; {timeAgo(article.timestamp)}
                    </div>
                </div>
            </div>
        </a>
    );
};

// Skeleton Component
const Skeleton = ({ isFeatured = false }: { isFeatured?: boolean }) => {
    if (isFeatured) {
        return (
            <div className="rounded-lg overflow-hidden bg-gray-800 shadow-lg h-full animate-pulse">
                <div className="h-96 bg-gray-700"></div>
                <div className="p-6 pt-4 bg-gray-800">
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-700 rounded w-5/6 mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col bg-gray-800 rounded-lg shadow-lg h-full animate-pulse">
            <div className="h-40 bg-gray-700 rounded-t-lg"></div>
            <div className="p-4 flex flex-col flex-grow">
                 <div className="h-3 bg-gray-700 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2 flex-grow"></div>
                <div className="h-4 bg-gray-700 rounded w-4/5 flex-grow"></div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/50">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                </div>
            </div>
        </div>
    );
}

NewsCard.Skeleton = Skeleton;

export { NewsCard };