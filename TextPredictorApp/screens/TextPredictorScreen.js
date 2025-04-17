// TextPredictor.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { checkLlamaServer, launchLlamaApp, getWordPredictions } from '../services/llmService';

const TextPredictor = () => {
  const [text, setText] = useState('');
  const [predictions, setPredictions] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);
  
  // Check if server is running
  const checkServerStatus = async () => {
    const status = await checkLlamaServer();
    setIsServerRunning(status);
    return status;
  };
  
  // Start the server - THIS FUNCTION LAUNCHES LLAMA.CPP
  const startServer = async () => {
    try {
      setIsLoading(true);
      // Try to launch the app
      const launched = await launchLlamaApp();
      
      if (!launched) {
        Alert.alert(
          "App Not Installed",
          "Please install llama.cpp UI from the Google Play Store to use text predictions.",
          [
            { text: "OK" }
          ]
        );
        return false;
      }
      
      // Wait for app to start and check status again
      await new Promise(resolve => setTimeout(resolve, 5000));
      const status = await checkServerStatus();
      
      if (!status) {
        Alert.alert(
          "Server Not Running",
          "Please open llama.cpp UI and enable the API server in settings.",
          [
            { text: "OK" }
          ]
        );
      }
      
      return status;
    } catch (error) {
      console.error('Error starting server:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle text changes and request predictions
  const handleTextChange = (newText) => {
    setText(newText);
    
    // Clear previous timeout to avoid multiple requests
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Only request predictions if there's text and user has stopped typing
    if (newText.trim().length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        requestPredictions(newText);
      }, 500); // Wait 500ms after typing stops
    } else {
      setPredictions(['', '', '']);
    }
  };
  
  // Request predictions from the LLM
  const requestPredictions = async (inputText) => {
    // Don't proceed if text is empty
    if (!inputText.trim()) return;
    
    // Check if server is running
    const serverRunning = isServerRunning || await checkServerStatus();
    
    if (!serverRunning) {
      // Try to start the server
      const started = await startServer();
      if (!started) return;
    }
    
    try {
      setIsLoading(true);
      
      // Get word predictions
      const words = await getWordPredictions(inputText, 3);
      setPredictions(words);
      
    } catch (error) {
      console.error('Error getting predictions:', error);
      setPredictions(['', '', '']);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply a prediction to the text
  const applyPrediction = (prediction) => {
    if (!prediction) return;
    
    const words = text.trim().split(/\s+/);
    const lastWordIncomplete = text.endsWith(' ') ? false : true;
    
    let newText;
    if (lastWordIncomplete && words.length > 0) {
      // Replace the last word
      newText = words.slice(0, -1).join(' ');
      if (newText.length > 0) newText += ' ';
      newText += prediction + ' ';
    } else {
      // Add to the end
      newText = text + prediction + ' ';
    }
    
    setText(newText);
    // Clear predictions temporarily
    setPredictions(['', '', '']);
    
    // Request new predictions after a delay
    setTimeout(() => {
      requestPredictions(newText);
    }, 500);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Server Status: {isServerRunning ? 'Connected' : 'Disconnected'}
        </Text>
        {!isServerRunning && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={startServer}
            disabled={isLoading}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={handleTextChange}
        placeholder="Type here for word predictions..."
        multiline
        autoCapitalize="none"
      />
      
      <View style={styles.predictionsContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#0066cc" />
        ) : (
          predictions.map((prediction, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.predictionButton,
                !prediction && styles.emptyPrediction
              ]}
              onPress={() => prediction && applyPrediction(prediction)}
              disabled={!prediction}
            >
              <Text style={styles.predictionText}>
                {prediction || '-'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    fontSize: 16,
  },
  predictionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
  },
  predictionButton: {
    flex: 1,
    backgroundColor: '#e1f5fe',
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emptyPrediction: {
    backgroundColor: '#f5f5f5',
  },
  predictionText: {
    fontSize: 16,
  },
});

export default TextPredictor;