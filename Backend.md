# Signal Gen - Backend Architecture (Supabase-Powered)

Signal Gen is a sophisticated, feature-rich web application that relies on a robust, secure, and scalable backend infrastructure. This document outlines the unified architecture, which is **fully powered by Supabase** to handle authentication, data storage, serverless logic, and real-time communication.

## 1.0 Core Architecture Principles

- **Backend-for-Frontend (BFF):** The frontend application does not directly communicate with external APIs (like Gemini or cryptocurrency exchanges). Instead, it communicates with our own backend services, implemented as **Supabase Edge Functions**. This pattern is crucial for security, control, and keeping API keys off the client.
- **Security First:** All sensitive information, including the Google Gemini API key and users' exchange API keys, is stored and used exclusively on the server side within Supabase Edge Functions. They are never exposed to the client browser.
- **Scalability & Performance:** We leverage the full Supabase stack: high-performance Postgres for data, serverless Edge Functions for on-demand scalability, and Realtime for low-latency communication.

## 2.0 Authentication & User Data (Supabase Auth & Postgres)

User identity and all application data are managed within the Supabase ecosystem, creating a single, secure source of truth.

- **Authentication:** **Supabase Auth** provides a secure and complete solution for email/password and social logins. It handles user session management, JWT issuance, and integration with the database via RLS.
- **User Profiles & Data:** All application data is stored in the **Supabase Postgres Database**. This includes:
    - `users`: Public profile information (username, bio, etc.).
    - `posts`, `strategies`, `comments`: User-generated content.
    - `trade_logs`: User's manual spot and perpetual trade history.
- **Row Level Security (RLS):** Data access is secured using Postgres RLS policies. These policies are rules that check a user's JWT upon every database request, ensuring users can only access and modify their own data. For example, a policy on the `strategies` table would be: `(auth.uid() = author_id)`.

## 3.0 Serverless Logic (Supabase Edge Functions)

All backend logic is handled by a suite of Deno-based Supabase Edge Functions.

### 3.1 AI Services

These functions act as a secure gateway to the Google Gemini API.

- **`generate-signal`**: Receives user parameters, fetches market data, constructs a prompt, and securely calls the Gemini API to generate a structured trade signal.
- **`get-second-opinion`**: Analyzes a user-created trade idea against market data.
- **`analyze-performance`**: Generates a comprehensive performance review based on a user's trade history.
- **`run-screener`**: Takes a natural language query and uses Gemini to find matching assets.

### 3.2 Secure API Proxies

- **Trade Execution Proxy:** When a user executes a trade, the parameters are sent to an Edge Function. This function retrieves the user's encrypted API keys from the database, signs the request, and forwards it to the exchange.
- **Blockchain Data Proxy:** The Stablecoin Stash feature uses an Edge Function to query blockchain APIs (e.g., Alchemy, Infura), protecting our API keys for those services.

## 4.0 Real-time Functionality (Supabase Realtime)

Supabase's built-in Realtime server provides managed WebSocket functionality for several key features.

### 4.1 Market Data Streaming

- **Architecture:** A backend worker (e.g., a scheduled Supabase Edge Function) continuously ingests candlestick data from exchange APIs and writes it to a `candles` table in Postgres.
- **Delivery:** The frontend subscribes to changes on this table using the **Supabase Realtime** client. This provides highly performant, scalable live chart updates without managing WebSockets manually.

### 4.2 Live Messaging & Notifications

- **Architecture:** Direct messages and notifications use **Supabase Realtime Broadcast**. Authenticated clients can send and receive messages on specific channels (e.g., a channel for each conversation).
- **End-to-End Encryption (E2EE):** For direct messages, messages are encrypted on the client side using the recipient's public key (stored in their user profile) before being broadcasted. The server only transports encrypted data.

### 4.3 Custom WebSocket Servers

- While Supabase Realtime covers most of our needs, Edge Functions also support deploying custom WebSocket servers if highly specialized real-time logic is ever required. For this application, the built-in Realtime service is sufficient and preferred.

## 5.0 Automation & Integration (Supabase Database Webhooks)

Supabase can trigger Edge Functions in response to database changes, enabling powerful automation.

- **Content Moderation:** A Database Webhook on the `posts` table triggers an Edge Function whenever new content is created. This function sends the content to the **Gemini API's safety classifiers** for automated analysis, flagging or removing inappropriate content.

## 6.0 Data Caching

### 6.1 Centralized News Service

- **Architecture:** A scheduled **Supabase Edge Function** runs periodically to fetch, deduplicate, and analyze news articles using the Gemini API.
- **Storage:** The pre-analyzed and structured news data is stored in a `news_articles` table in the Supabase Postgres database. This table includes columns for `title`, `description`, `source`, `timestamp`, `sentiment`, `category`, and a crucial `source_url`.
- **Result:** The frontend reads from this simple cache, providing a fast, scalable, and cost-effective news feed for all users.