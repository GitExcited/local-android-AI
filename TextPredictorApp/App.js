import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Text, View, Button } from 'react-native';
import TextPredictorTest from './TextPredictorTest';
import ModelUploadScreen from './screens/ModelUploadScreen';
import LLMService from './services/llmService';

export default function App() {
  const [showModelUpload, setShowModelUpload] = useState(false);
  const [modelStatus, setModelStatus] = useState('No model selected');

  const handleModelUploaded = async (modelPath) => {
    setModelStatus(`Model uploaded: ${modelPath.split('/').pop()}`);
    setShowModelUpload(false);
    
    // Reset LLM service with new model
    await LLMService.cleanup();
    LLMService.modelPath = modelPath;
    const result = await LLMService.initialize();
    if (result) {
      setModelStatus(`Model initialized: ${modelPath.split('/').pop()}`);
    } else {
      setModelStatus(`Failed to initialize model: ${modelPath.split('/').pop()}`);
    }
    console.log('Model uploaded, saved at:', modelPath);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>LLM Word Predictor</Text>
        <Text style={styles.modelStatus}>{modelStatus}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={showModelUpload ? "Back to Predictor" : "Upload Model"} 
          onPress={() => setShowModelUpload(!showModelUpload)}
        />
      </View>
      
      {showModelUpload ? (
        <ModelUploadScreen onModelUploaded={handleModelUploaded} />
      ) : (
        <TextPredictorTest />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modelStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  }
});