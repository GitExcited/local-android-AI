import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const { LLMModule } = NativeModules;

class LLMService {
  constructor() {
    this.isInitialized = false;
    this.modelPath = null;
  }

  async initialize() {
    try {
      // Ensure model exists
      const modelExists = await this.ensureModelExists();
      if (!modelExists) {
        console.error('Failed to get model file');
        return false;
      }
      
      console.log('Starting initialization, checking model at:', this.modelPath);
      console.log('Initializing LLM with model:', this.modelPath);
      const success = await LLMModule.init(this.modelPath);
      this.isInitialized = success;
      console.log('LLM initialization result:', success);
      return success;
    } catch (error) {
      console.error('Error initializing LLM:', error);
      return false;
    }
  }
  
  async ensureModelExists() {
    try {
      const modelDir = `${FileSystem.documentDirectory}models/`;
      
      // Check if directory exists and create if needed
      const dirInfo = await FileSystem.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      }
      
      // First, check if we already have ANY model file (not just phi-2)
      const dirContents = await FileSystem.readDirectoryAsync(modelDir);
      const modelFiles = dirContents.filter(file => file.endsWith('.gguf'));
      
      if (modelFiles.length > 0) {
        // Use the first found model
        this.modelPath = `${modelDir}${modelFiles[0]}`;
        console.log('Using existing model:', this.modelPath);
        return true;
      }
      
      // No models found, check the default path
      const defaultModelFileName = 'phi-2.Q4_0.gguf';
      this.modelPath = `${modelDir}${defaultModelFileName}`;
      
      // Try to copy from Downloads as last resort
      console.log('No models found, attempting to copy from Downloads...');
      const hasPermission = await this.requestStoragePermission();
      if (hasPermission) {
        const copied = await this.copyModelFromDownloads();
        if (copied) return true;
      }
      
      console.log('No model available. Please upload using the UI.');
      return false;
    } catch (error) {
      console.error('Error ensuring model exists:', error);
      return false;
    }
  }
  
  async requestStoragePermission() {
    try {
      // For Android 10+ (API level 29+)
      if (Platform.OS === 'android' && Platform.Version >= 29) {
        // Request specific permission to access Download folder
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "This app needs to access your Downloads folder to load the AI model",
            buttonPositive: "OK"
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission not granted, showing instructions to user');
          return false;
        }
        return true;
      } else {
        // Older Android versions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error requesting permission:', err);
      return false;
    }
  }
  
  async copyModelFromDownloads() {
    try {
      // Path to your specific model
      const sourceFile = '/sdcard/Download/phi-2.Q4_0.gguf';

      // Check if source file exists
      const sourceInfo = await FileSystem.getInfoAsync(sourceFile);
      if (!sourceInfo.exists) {
        console.log('Model not found in Downloads folder');
        return false;
      }

      // Copy to app's directory
      await FileSystem.copyAsync({
        from: sourceFile,
        to: this.modelPath
      });
      console.log('Copied model to app directory');
      return true;
    } catch (error) {
      console.error('Error copying model:', error);
      return false;
    }
  }

  async getNextWordPredictions(text, count = 10) {
    try {
      if (!this.isInitialized) {
        console.log('LLM not initialized, initializing now...');
        const initialized = await this.initialize();
        if (!initialized) {
          console.error('Failed to initialize LLM');
          return [];
        }
      }
      
      console.log('Getting predictions for:', text);
      const predictions = await LLMModule.getNextWordPredictions(text, count);
      console.log('Received predictions:', predictions);
      return predictions || [];
    } catch (error) {
      console.error('Error getting predictions:', error);
      return [];
    }
  }

  async cleanup() {
    try {
      if (this.isInitialized) {
        console.log('Cleaning up LLM resources');
        await LLMModule.cleanup();
        this.isInitialized = false;
      }
      return true;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return false;
    }
  }
}

export default new LLMService();