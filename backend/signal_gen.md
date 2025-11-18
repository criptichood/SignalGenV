# Procedure: Migrating Signal Generation to a Supabase Backend

## Objective
To migrate the entire AI-powered swing trade signal generation logic from the client-side (`services/geminiService.ts`) to a secure **Supabase Edge Function**. This follows the Backend-for-Frontend (BFF) pattern, ensuring all API keys and sensitive logic are kept on the server.

## Architecture Overview
The current client-side process will be refactored into a secure client-server model.

1.  **Client-Side (Initiator):** The user configures parameters in the UI. When they click "Get AI Signal," the frontend will no longer call the Gemini API directly. Instead, it will make a single, authenticated `fetch` request to our own `generate-signal` Edge Function, passing the user's parameters in the request body.
2.  **Backend (Supabase Edge Function):** The `generate-signal` function will be the new orchestrator.
    -   It receives the `UserParams` from the client.
    -   It securely calls the appropriate exchange API (Binance or Bybit) to fetch multi-timeframe market data.
    -   It constructs the detailed prompt for the Gemini API.
    -   Using the Gemini API key stored securely in Supabase environment variables, it calls the Gemini model with the market data and prompt.
    -   It receives the structured JSON response from Gemini, validates it, and returns the final `Signal` object to the client.

---

## Step 1: Create the `generate-signal` Edge Function

This function will encapsulate all the logic previously found in `services/geminiService.ts`.

1.  Create a new Supabase Edge Function named `generate-signal`.
2.  The function will handle `POST` requests, expecting `UserParams` in the body.
3.  It will require the `GEMINI_API_KEY` to be set in the Supabase project's environment variables.
4.  The logic will mirror the existing `generateSignal` function but will be adapted for the Deno runtime.

#### `supabase/functions/generate-signal/index.ts` (Conceptual)
```typescript
import { GoogleGenAI, Type } from "@google/genai";
import { corsHeaders } from '../_shared/cors.ts';
import type { UserParams, Signal } from '../../../types.ts'; // Adjust path as needed
import { fetchData } from '../../../services/exchangeService.ts'; // Assume exchangeService is adapted for Deno

// The main function that will be executed when the endpoint is called
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const params: UserParams = await req.json();
    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY') });

    // 1. Fetch Market Data (same logic as before, but on the server)
    const primaryData = await fetchData(params.exchange, params.symbol, params.timeframe, 150);
    const livePrice = primaryData.length > 0 ? primaryData[primaryData.length - 1].close : 0;
    
    // ... (logic to fetch HTF/LTF data) ...

    // 2. Build the Prompt for Gemini
    const prompt = buildPrompt(params, primaryData, null, null, livePrice); // Pass other data frames
    const responseSchema = getResponseSchema();

    // 3. Securely Call the Gemini API
    const response = await ai.models.generateContent({
        model: params.model,
        contents: prompt,
        config: {
            systemInstruction: "...", // Your trading knowledge context
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    // 4. Parse and Return the Signal
    const jsonString = response.text.trim();
    const signal: Signal = JSON.parse(jsonString); // Add validation

    return new Response(JSON.stringify(signal), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper functions (buildPrompt, getResponseSchema) would be defined here or imported.
```

---

## Step 2: Update the Frontend to Call the Edge Function

The `useGenerateSignalMutation` hook needs to be updated to call our new backend endpoint instead of the client-side Gemini service.

1.  Modify the `generateSignalMutationFn` in `hooks/useGenerateSignalMutation.ts`.
2.  This function will now use `fetch` (or the Supabase client's `invoke` method) to make a `POST` request to `/api/generate-signal`.
3.  The `services/geminiService.ts` file, which previously handled direct Gemini calls from the client, can now be deprecated for this function.

#### `hooks/useGenerateSignalMutation.ts` (Updated Logic)
```typescript
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient'; // Assuming client is available
import type { UserParams, Signal } from '@/types';

// ... (interface definitions) ...

const generateSignalMutationFn = async ({ params }: GenerateSignalVariables): Promise<GenerateSignalResult> => {
  // Call the Supabase Edge Function instead of the Gemini service directly
  const { data: generatedSignal, error } = await supabase.functions.invoke('generate-signal', {
    body: params,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch the latest price client-side for immediate UI update
  const lastClose = await exchangeService.fetchLivePrice(params.exchange, params.symbol);

  const result: GenerateSignalResult = {
    generatedSignal,
    params,
    lastClose,
    lastCandleTime: null, // This detail is now abstracted in the backend
  };

  return result;
};

// ... (rest of the hook) ...
```

## Outcome
The signal generation process will be faster (as data fetching happens server-to-server) and significantly more secure. The client is simplified to only making a request and displaying the result, while the complex logic and secret keys are protected within the Supabase backend. This aligns with our BFF architecture and sets a pattern for migrating other AI features.
