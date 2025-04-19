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
        
        // THIS IS THE IMPORTANT PART - MAKE SURE YOU HAVE THIS:
        const progressCallback = (progress) => {
          // Convert progress to a number explicitly
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