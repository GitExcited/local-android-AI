// state/LlamaState.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompletionParams, ContextParams, initLlama } from 'cui-llama.rn';
import { mmkvStorage } from '../utils/Storage';

export const useLlamaEngine = create(
  persist(
    (set, get) => ({
      context: undefined,
      model: null,
      loadProgress: 0,
      
      config: {
        contextLength: 4096,
        threads: 4,
        gpuLayers: 0,
        batch: 512,
      },
      
      setConfig: (config) => set({ config }),
      
      load: async (model) => {
        const { unload, config } = get();
        
        // First unload any existing model
        await unload();
        
        const params = {
          model: model.path,
          contextSize: config.contextLength,
          batchSize: config.batch,
          threads: config.threads,
          gpuLayers: config.gpuLayers,
        };
        
        const progressCallback = (progress) => {
          const numericProgress = typeof progress === 'number' ? progress : Number(progress);
          
          // Make sure it's a valid number before storing
          if (!isNaN(numericProgress)) {
            console.log("Load progress:", numericProgress);
            set({ loadProgress: Math.floor(numericProgress) });
          } else {
            console.warn("Received invalid progress value:", progress);
          }
        };

        try {
          const llamaContext = await initLlama(params, progressCallback);
          set({
            context: llamaContext,
            model: {
              id: model.id,
              name: model.name,
              path: model.path,
              file_size: model.file_size
            },
          });
          return true;
        } catch (error) {
          console.error(`Could Not Load Model: ${error}`);
          return false;
        }
      },
      
      unload: async () => {
        const { context } = get();
        if (context) {
          await context.release();
        }
        set({
          context: undefined,
          model: null,
        });
      },
      
      completion: async (prompt, params, onToken, onComplete) => {
        const { context } = get();
        if (!context) {
          console.error('No model loaded');
          return false;
        }
        
        const completionParams = {
          prompt,
          temperature: params?.temperature ?? 0.7,
          topK: params?.topK ?? 40,
          topP: params?.topP ?? 0.9,
          maxTokens: params?.maxTokens ?? 800,
          repeatPenalty: params?.repeatPenalty ?? 1.1,
        };
        
        try {
          return context
            .completion(completionParams, (data) => {
              if (onToken) onToken(data.token);
            })
            .then((result) => {
              if (onComplete) onComplete(result.text, result.timings);
              return result;
            });
        } catch (error) {
          console.error('Completion error:', error);
          return false;
        }
      },
      
      stopCompletion: async () => {
        const { context } = get();
        if (context) {
          await context.stopCompletion();
        }
      },
      
      setLoadProgress: (progress) => set({ loadProgress: progress }),

      predictNextTokens: async (prompt, numPredictions = 5) => {
        const { context } = get();
        if (!context) {
          console.error('No model loaded');
          return [];
        }
        
        try {
          // Use the completion method with n_probs parameter
          const completionParams = {
            prompt,
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxTokens: 1,  // Just generate one token
            repeatPenalty: 1.1,
            n_probs: numPredictions * 2,  // Get probabilities for top tokens
          };
          
          // Run the completion
          const result = await context.completion(completionParams);
          
          // Extract the predictions from completion_probabilities
          if (result.completion_probabilities && result.completion_probabilities.length > 0) {
            // Get the first token's probability list
            const probsList = result.completion_probabilities[0].probs;
            
            // Map to the expected format and limit to numPredictions
            return probsList.slice(0, numPredictions).map(prob => ({
              text: prob.tok_str,
              score: prob.prob
            }));
          }
          
          return [];
        } catch (error) {
          console.error('Prediction error:', error);
          return [];
        }
      }
    }),
    {
      name: 'llama-storage',
      storage: {
        getItem: mmkvStorage.getItem,
        setItem: mmkvStorage.setItem,
        removeItem: mmkvStorage.removeItem,
      },
      partialize: (state) => ({
        config: state.config,
        loadProgress: state.loadProgress,
        model: state.model ? {
          id: state.model.id,
          name: state.model.name,
          path: state.model.path,
          file_size: state.model.file_size
        } : null,
      }),
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => JSON.parse(str),
    }
  )
);