import { NativeModules } from 'react-native';

const { LLMModule } = NativeModules;

class LLMService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize(modelPath = '/path/to/mock/model.bin') {
    try {
      console.log('Initializing LLM with model:', modelPath);
      const success = await LLMModule.init(modelPath);
      this.isInitialized = success;
      console.log('LLM initialization result:', success);
      return success;
    } catch (error) {
      console.error('Error initializing LLM:', error);
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