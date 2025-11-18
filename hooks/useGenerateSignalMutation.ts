import { useMutation } from '@tanstack/react-query';
import { generateSignal } from '@/services/geminiService';
import * as exchangeService from '@/services/exchangeService';
import type { UserParams, AiModel, Signal } from '@/types';

interface GenerateSignalVariables {
  params: UserParams;
  model: AiModel; // Kept for consistency, though the backend model might be fixed
}

interface GenerateSignalResult {
  generatedSignal: Signal;
  params: UserParams;
  lastClose: number;
  lastCandleTime: number | null;
}

/**
 * The mutation function now calls the client-side service, which contains the full Gemini logic.
 */
const generateSignalMutationFn = async ({ params }: GenerateSignalVariables): Promise<GenerateSignalResult> => {
  // Call the restored client-side service function
  const generatedSignal = await generateSignal(params);
  
  // Fetch the latest price to return with the result for UI state consistency
  const lastClose = await exchangeService.fetchLivePrice(params.exchange, params.symbol);

  const result: GenerateSignalResult = {
    generatedSignal,
    params,
    lastClose,
    lastCandleTime: null, // This info is abstracted away in the service, not critical for the hook
  };

  return result;
};


/**
 * A TanStack Query mutation hook for generating cryptocurrency trading signals.
 * This hook encapsulates the asynchronous logic of calling the Gemini API
 * to generate a signal, providing `isLoading`, `error`, and `mutate` functions.
 */
export const useGenerateSignalMutation = () => {
  return useMutation<GenerateSignalResult, Error, GenerateSignalVariables>({
    mutationFn: generateSignalMutationFn,
  });
};
