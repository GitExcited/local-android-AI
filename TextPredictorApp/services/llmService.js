// llmService.js
import axios from 'axios';
import * as Linking from 'expo-linking';

// API configuration
const API_BASE_URL = 'http://localhost:8080';

// Helper to check if llama.cpp UI is running
export const checkLlamaServer = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/models`, {
      timeout: 2000, // 2 second timeout
    });
    return response.status === 200;
  } catch (error) {
    console.log('Server check failed:', error.message);
    return false;
  }
};

// Launch llama.cpp UI via URI scheme
// THIS IS THE CODE THAT LAUNCHES LLAMA.CPP IN THE BACKGROUND
export const launchLlamaApp = async () => {
  try {
    // This URI scheme works for llama.cpp UI
    const result = await Linking.canOpenURL('llamacpp://');
    
    if (result) {
      await Linking.openURL('llamacpp://');
      return true;
    }
    return false;
  } catch (error) {
    console.log('Error launching llama.cpp UI:', error);
    return false;
  }
};

// Get text prediction
export const getTextPrediction = async (text, options = {}) => {
  const defaultOptions = {
    maxTokens: 20,
    temperature: 0.5,
    topP: 0.9,
    stopSequences: ['\n', '.', '?', '!'],
    timeoutMs: 10000,
  };
  
  const settings = { ...defaultOptions, ...options };
  
  try {
    // Check if server is running
    const isServerRunning = await checkLlamaServer();
    
    if (!isServerRunning) {
      // Try to launch the app
      await launchLlamaApp();
      
      // Wait for app to start (adjust time as needed)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check again
      const retryCheck = await checkLlamaServer();
      if (!retryCheck) {
        throw new Error('Unable to connect to llama.cpp UI server');
      }
    }
    
    // Prepare the prompt for text prediction
    const prompt = `Complete this text naturally: "${text}"`;
    
    // Make request to the API
    const response = await axios.post(
      `${API_BASE_URL}/v1/completions`,
      {
        prompt: prompt,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        top_p: settings.topP,
        stop: settings.stopSequences,
      },
      {
        timeout: settings.timeoutMs,
      }
    );
    
    // Extract the generated text
    const generatedText = response.data.choices[0].text;
    
    return generatedText.trim();
  } catch (error) {
    console.error('Error getting prediction:', error.message);
    throw error;
  }
};

// Get multiple word predictions
export const getWordPredictions = async (text, count = 3) => {
  try {
    // Generate multiple predictions with different temperatures
    const predictions = [];
    
    // Get the first prediction
    const mainPrediction = await getTextPrediction(text, {
      maxTokens: 5,
      temperature: 0.4,
    });
    
    // Extract first word and add to predictions
    const firstWord = mainPrediction.split(' ')[0];
    predictions.push(firstWord);
    
    // If we need more predictions, get them with different parameters
    if (count > 1) {
      const secondPrediction = await getTextPrediction(text, {
        maxTokens: 5,
        temperature: 0.7,
      });
      
      const secondWord = secondPrediction.split(' ')[0];
      // Make sure we don't add duplicates
      if (secondWord && secondWord !== firstWord) {
        predictions.push(secondWord);
      }
    }
    
    if (count > 2) {
      const thirdPrediction = await getTextPrediction(text, {
        maxTokens: 5,
        temperature: 1.0,
      });
      
      const thirdWord = thirdPrediction.split(' ')[0];
      // Make sure we don't add duplicates
      if (thirdWord && !predictions.includes(thirdWord)) {
        predictions.push(thirdWord);
      }
    }
    
    // Fill with empty strings if we don't have enough predictions
    while (predictions.length < count) {
      predictions.push('');
    }
    
    return predictions;
  } catch (error) {
    console.error('Error getting word predictions:', error.message);
    return Array(count).fill('');
  }
};