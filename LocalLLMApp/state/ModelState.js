// state/ModelState.js
import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import { AppDirectory } from '../utils/FileUtils';

export const useModelStore = create((set, get) => ({
  models: [],
  selectedModel: null,
  loadModels: async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(AppDirectory.ModelPath);
      const modelFiles = files.filter(file => 
        file.endsWith('.bin') || file.endsWith('.gguf')
      );
      
      const modelsList = modelFiles.map((file, index) => ({
        id: index,
        name: file.replace('.gguf', '').replace('.bin', ''),
        path: `${AppDirectory.ModelPath}${file}`,
        file: file,
        file_size: 0, // We'll update this later
      }));
      
      // Get file sizes
      for (let model of modelsList) {
        const info = await FileSystem.getInfoAsync(model.path);
        model.file_size = info.size || 0;
      }
      
      set({ models: modelsList });
    } catch (error) {
      console.error('Failed to load models:', error);
      set({ models: [] });
    }
  },
  addModel: async (sourceUri, fileName) => {
    try {
      const destinationUri = `${AppDirectory.ModelPath}${fileName}`;
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destinationUri
      });
      
      // Refresh the models list
      await get().loadModels();
      return true;
    } catch (error) {
      console.error('Failed to add model:', error);
      return false;
    }
  },
  selectModel: (model) => set({ selectedModel: model }),
}));