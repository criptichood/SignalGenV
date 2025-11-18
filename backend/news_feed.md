# Procedure: Migrating News Feed to a Supabase Backend

## Objective
To replace the client-side mock news data in `store/newsStore.ts` with a dynamic, backend-powered, and cached system. This will involve using a scheduled Supabase Edge Function to fetch, analyze, and store news articles, which the frontend will then query directly from the database.

## Architecture Overview
This migration implements a robust caching and analysis strategy, ensuring the news feed is fast, scalable, and cost-effective.

1.  **Data Ingestion & AI Analysis (Supabase Edge Function):** A scheduled Supabase Edge Function (e.g., `news-ingestor`) will run periodically (e.g., every 15 minutes).
    -   It will fetch raw news articles from a third-party news API (e.g., NewsAPI, CryptoCompare).
    -   For each new article, it will call the Google Gemini API to perform sentiment analysis and categorization.
    -   The enriched, structured data will be stored in a Supabase Postgres table.
2.  **Data Delivery (Supabase Postgres):** The frontend application will no longer fetch raw data or perform analysis. It will simply query the pre-processed `news_articles` table from Supabase, allowing for fast data retrieval and pagination.

---

## Step 1: Database Setup

A table is needed to store the analyzed news articles.

1.  Navigate to the **SQL Editor** in your Supabase project.
2.  Run the following SQL to create the `news_articles` table. We'll also create a custom `sentiment_type` for data integrity.

```sql
-- First, create the ENUM type for sentiment
CREATE TYPE sentiment_type AS ENUM ('Bullish', 'Bearish', 'Neutral');

-- Now, create the table
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE, -- Use URL as a unique constraint to prevent duplicates
    thumbnail TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    sentiment sentiment_type,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read the news articles
CREATE POLICY "Allow public read access" ON news_articles
    FOR SELECT
    USING (true);
```

3.  Navigate to **Database > Replication** and ensure the `news_articles` table is enabled for Realtime events if you plan to add live updates in the future.

---

## Step 2: Backend News Ingestion (Edge Function)

Create the server-side function to fetch, analyze, and store news.

1.  Create a new Supabase Edge Function named `news-ingestor`.
2.  The function's logic will be:
    -   Fetch a list of recent crypto news articles from an external API.
    -   For each article, check if its `url` already exists in the `news_articles` table to prevent duplicates.
    -   If it's a new article, construct a prompt for the Gemini API containing the article's title and description. The prompt should ask Gemini to return a JSON object with `sentiment` ('Bullish', 'Bearish', or 'Neutral') and a concise `category`.
    -   Use the Supabase client to `INSERT` the combined, structured data into the `news_articles` table.
3.  In the Supabase dashboard, navigate to **Edge Functions > news-ingestor > Schedules** and schedule the function to run on a cron schedule (e.g., `*/15 * * * *` for every 15 minutes).

---

## Step 3: Frontend Client Integration (`store/newsStore.ts`)

Update the `useNewsStore` to fetch data from Supabase instead of using the mock array.

1.  Import the `supabase` client.
2.  Modify the `fetchNews` and `loadMoreNews` functions.

#### `store/newsStore.ts` (Updated Logic)
```typescript
import { create } from 'zustand';
import type { NewsArticle } from '@/types';
import { supabase } from '@/services/supabaseClient'; // Import the client

const ARTICLES_PER_PAGE = 10;

// ... (interface NewsState) ...

export const useNewsStore = create<NewsState>((set, get) => ({
  // ... (existing state properties) ...

  fetchNews: async () => {
    // This function will now only be called once on initial load
    if (get().allArticles.length > 0) return;
    
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(ARTICLES_PER_PAGE);

      if (error) throw error;

      // Map Supabase data to our application's type
      const fetchedArticles: NewsArticle[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        source: item.source,
        timestamp: item.published_at,
        url: item.url,
        thumbnail: item.thumbnail,
        sentiment: item.sentiment,
        category: item.category,
      }));
      
      set({
        allArticles: fetchedArticles, // Initially, allArticles is just the first page
        displayedArticles: fetchedArticles,
        hasMore: fetchedArticles.length === ARTICLES_PER_PAGE,
        isLoading: false,
      });

    } catch (e: any) {
      const error = e.message || 'Failed to fetch market news from the server.';
      set({ error, isLoading: false });
    }
  },
  
  loadMoreNews: async () => {
    if (get().isAppending || !get().hasMore) return;

    set({ isAppending: true });
    
    const { displayedArticles } = get();
    const currentCount = displayedArticles.length;

    try {
        const { data, error } = await supabase
            .from('news_articles')
            .select('*')
            .order('published_at', { ascending: false })
            .range(currentCount, currentCount + ARTICLES_PER_PAGE - 1);

        if (error) throw error;
        
        const newArticles: NewsArticle[] = data.map(item => ({ /* mapping */ }));

        set(state => ({
            allArticles: [...state.allArticles, ...newArticles],
            displayedArticles: [...state.displayedArticles, ...newArticles],
            hasMore: newArticles.length === ARTICLES_PER_PAGE,
            isAppending: false,
        }));
    } catch (e: any) {
        set({ error: e.message, isAppending: false });
    }
  }
}));
```

## Outcome
The news feed will now be populated with real, AI-analyzed data from your Supabase backend. The frontend is significantly simplified, only responsible for fetching and displaying data, while the heavy lifting of data collection and analysis is handled efficiently on the server.