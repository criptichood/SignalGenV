import React, { useState, useEffect } from 'react';
import { Loader2Icon } from '../icons/Loader2Icon';
import { LinkIcon } from '../icons/LinkIcon';

interface LinkPreviewProps {
  url: string;
}

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  hostname: string;
}

// Mock function to simulate fetching link metadata.
// In a real app, this would be a call to a backend endpoint that scrapes the URL.
const fetchLinkMetadata = async (url: string): Promise<LinkMetadata> => {
    console.log(`Mock fetching metadata for: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    try {
        const urlObj = new URL(url);
        // Use a placeholder image service for mock data
        const imageUrl = `https://picsum.photos/seed/${urlObj.hostname}/500/261`;
        
        // Return mock data
        return {
            title: `Mock Title for ${urlObj.hostname}`,
            description: 'This is a mock description for the link provided. In a real application, this would be scraped from the website\'s meta tags.',
            image: imageUrl,
            hostname: urlObj.hostname,
        };
    } catch (e) {
        // Handle invalid URLs
        return {
            title: 'Invalid URL',
            description: 'The provided URL could not be processed.',
            image: '',
            hostname: 'localhost',
        };
    }
};

export const LinkPreview = ({ url }: LinkPreviewProps) => {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const getMetadata = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchLinkMetadata(url);
                if (isMounted) {
                    setMetadata(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Could not fetch link preview.');
                }
                console.error(err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        getMetadata();

        return () => {
            isMounted = false;
        };
    }, [url]);

    if (isLoading) {
        return (
            <div className="mt-3 flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-900/50">
                <Loader2Icon className="w-5 h-5 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Loading link preview...</span>
            </div>
        );
    }
    
    if (error || !metadata) {
        return (
             <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-colors">
                <LinkIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-cyan-400 truncate">{error || 'Could not load preview'}</p>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                </div>
            </a>
        );
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 block border border-gray-700 rounded-lg overflow-hidden hover:bg-gray-700/30 transition-colors">
            {metadata.image && (
                <img src={metadata.image} alt={metadata.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-3">
                <p className="text-sm font-semibold text-gray-200 truncate">{metadata.title}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{metadata.description}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" />
                    {metadata.hostname}
                </p>
            </div>
        </a>
    );
};
