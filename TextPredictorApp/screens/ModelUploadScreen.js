import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const ModelUploadScreen = ({ onModelUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');

  const pickAndUploadModel = async () => {
    try {
      setIsUploading(true);
      setStatus('Selecting file...');
      
      // Let user pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        setStatus('File selection canceled');
        setIsUploading(false);
        return;
      }
      
      setStatus(`Selected ${result.assets[0].name}. Copying...`);
      
      // Define the destination path
      const modelDir = `${FileSystem.documentDirectory}models/`;
      
      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      }
      
      // Copy the file
      const destPath = `${modelDir}${result.assets[0].name}`;
      await FileSystem.copyAsync({
        from: result.assets[0].uri,
        to: destPath
      });
      
      setStatus('Model uploaded successfully!');
      
      // Notify parent component
      if (onModelUploaded) {
        onModelUploaded(destPath);
      }
    } catch (error) {
      console.error('Error picking/uploading file:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Model File</Text>
      
      <Text style={styles.description}>
        Select a model file from your device to use for text prediction.
      </Text>
      
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={pickAndUploadModel}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>
          {isUploading ? 'Uploading...' : 'Select Model File'}
        </Text>
      </TouchableOpacity>
      
      {isUploading && (
        <ActivityIndicator style={styles.loader} size="large" color="#0066cc" />
      )}
      
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  status: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
    textAlign: 'center',
  },
});

export default ModelUploadScreen;