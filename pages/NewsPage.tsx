import React, { useState, useEffect, useMemo } from 'react';
import { useNewsStore } from '@/store/newsStore';
import type { NewsArticle } from '@/types';
import { NewsCard } from '@/components/NewsCard';
import { Input } from '@/components/ui/Input';
import { Search, Newspaper, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NewsPage() {
  const { 
      displayedArticles: allNews, 
      isLoading, 
      error, 
      fetchNews,
      loadMoreNews,
      hasMore,
      isAppending
  } = useNewsStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = useMemo(() => {
    return allNews.filter(article => {
      if (!searchTerm) return true;
      const searchMatch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [allNews, searchTerm]);

  const featuredArticle = filteredNews.length > 0 ? filteredNews[0] : null;
  const gridArticles = filteredNews.length > 1 ? filteredNews.slice(1) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Market News</h1>
          <p className="text-gray-400 mt-1">Headlines from top cryptocurrency news sources.</p>
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search news..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-9" 
          />
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {isLoading && allNews.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 md:col-span-2"><NewsCard.Skeleton isFeatured /></div>
          <NewsCard.Skeleton />
          <NewsCard.Skeleton />
          <NewsCard.Skeleton />
          <NewsCard.Skeleton />
          <NewsCard.Skeleton />
          <NewsCard.Skeleton />
          <NewsCard.Skeleton />
          <NewsCard.Skeleton />
        </div>
      )}

      {!isLoading && filteredNews.length === 0 && (
        <div className="text-center py-20 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
            <Newspaper className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-white">No News Found</h3>
            <p className="mt-1 text-sm text-gray-400">
              {searchTerm ? 'Try adjusting your search term.' : 'We couldn\'t fetch any news at the moment.'}
            </p>
        </div>
      )}
      
      {!isLoading && filteredNews.length > 0 && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticle && (
                    <div className="lg:col-span-2 md:col-span-2">
                        <NewsCard article={featuredArticle} isFeatured />
                    </div>
                )}
                {gridArticles.map(article => (
                    <NewsCard key={article.id} article={article} />
                ))}
            </div>
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button onClick={loadMoreNews} disabled={isAppending}>
                        {isAppending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : 'Load More News'}
                    </Button>
                </div>
            )}
        </>
      )}
    </div>
  );
}