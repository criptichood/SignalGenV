import React, { useEffect, useMemo } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { formatDistanceToNow } from '@/utils/date';

export const NewsWidget = () => {
    const { displayedArticles: articles, fetchNews, isLoading: isNewsLoading } = useNewsStore();

    useEffect(() => {
        if (articles.length === 0) {
            fetchNews();
        }
    }, [articles, fetchNews]);

    const topArticles = useMemo(() => articles.slice(0, 4), [articles]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI News Feed</CardTitle>
                <CardDescription>Latest AI-analyzed headlines.</CardDescription>
            </CardHeader>
            <CardContent>
                {isNewsLoading ? (
                    <p className="text-gray-500">Loading news...</p>
                ) : (
                    <ul className="space-y-4">
                    {topArticles.map(article => (
                        <li key={article.id}>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-700/50 p-2 rounded-md -m-2">
                                <p className="font-semibold text-sm text-gray-200 line-clamp-2">{article.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{article.source} &middot; {formatDistanceToNow(new Date(article.timestamp))}</p>
                            </a>
                        </li>
                    ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};