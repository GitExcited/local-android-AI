// screens/ModelLoadingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useModelStore } from '../state/ModelState';
import { useLlamaEngine } from '../state/LlamaState';

export default function ModelLoadingScreen({ model, onLoaded, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loadProgress, load } = useLlamaEngine();
  
  // Verify model file exists on mount
  useEffect(() => {
    const checkFile = async () => {
      try {
        console.log("Checking model path:", model.path);
        const fileInfo = await FileSystem.getInfoAsync(model.path);
        console.log("File exists:", fileInfo.exists, "Size:", fileInfo.size);
        
        if (!fileInfo.exists) {
          setError("Model file not found at path: " + model.path);
        } else if (fileInfo.size < 1000) {
          // Very small file likely isn't a valid model
          setError("Model file appears to be invalid (too small)");
        }
      } catch (err) {
        console.error("Error checking model file:", err);
        setError("Failed to check model file: " + err.message);
      }
    };
    
    checkFile();
  }, [model]);
  
  const handleLoadModel = async () => {
    try {
      console.log("Starting to load model:", model.name);
      setLoading(true);
      setError(null);
      
      const success = await load(model);
      
      console.log("Model load completed, success:", success);
      
      if (success) {
        // Don't show alert here - just call onLoaded
        if (onLoaded) onLoaded();
      } else {
        setError("Failed to load model - check console for details");
        setLoading(false); // Only reset loading if failed
      }
    } catch (err) {
      console.error("Exception during model loading:", err);
      setLoading(false);
      setError(err.message || "Unknown error occurred");
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Load Model</Text>
      
      <View style={styles.modelInfo}>
        <Text style={styles.modelName}>{model.name}</Text>
        <Text style={styles.modelPath}>{model.path}</Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
          <Text style={styles.loadingText}>Loading model: {loadProgress}%</Text>
          {loadProgress === 0 && loading && (
            <Text style={styles.loadingHint}>
              This may take several minutes for the first load
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.loadButton, (loading || error) && styles.disabledButton]}
          onPress={handleLoadModel}
          disabled={loading === true}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Load Model'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 40,
  },
  modelInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  modelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modelPath: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: '#e1f5fe',
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  loadingHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#757575',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bbdefb',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});