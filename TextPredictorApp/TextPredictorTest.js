import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import LLMService from './services/llmService';

export default function TextPredictorTest() {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Not initialized');
  
  // Initialize on component mount
  useEffect(() => {
    initializeLLM();
    
    // Cleanup on unmount
    return () => {
      LLMService.cleanup().then(() => {
        console.log('LLM cleaned up');
      });
    };
  }, []);
  
  const initializeLLM = async () => {
    setStatus('Initializing...');
    const result = await LLMService.initialize();
    setStatus(result ? 'Initialized' : 'Initialization failed');
  };
  
  const getPredictions = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setStatus('Getting predictions...');
    
    try {
      const result = await LLMService.getNextWordPredictions(input, 10);
      setPredictions(result);
      setStatus(`Got ${result.length} predictions`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.status}>Status: {status}</Text>
      
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Enter text for prediction"
        multiline
      />
      
      <Button
        title={isLoading ? "Loading..." : "Get Predictions"}
        onPress={getPredictions}
        disabled={isLoading || !input.trim()}
      />
      
      {isLoading && (
        <ActivityIndicator style={styles.loader} size="large" color="#0066cc" />
      )}
      
      <Text style={styles.resultsHeader}>Predictions:</Text>
      
      {predictions.length > 0 ? (
        <FlatList
          data={predictions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.predictionItem}>
              <Text style={styles.prediction}>{item}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noPredictions}>
          {isLoading ? "Loading predictions..." : "No predictions yet"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  status: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
  },
  loader: {
    marginVertical: 20,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  predictionItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  prediction: {
    fontSize: 16,
  },
  noPredictions: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: 20,
  },
});