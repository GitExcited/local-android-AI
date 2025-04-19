// screens/ModelScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useModelStore } from '../state/ModelState';
import { importModelFile, readableFileSize } from '../utils/FileUtils';

export default function ModelScreen({ onSelectModel }) {
  const { models, loadModels, addModel, selectModel } = useModelStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const handleImportModel = async () => {
    const file = await importModelFile();
    if (file) {
      setLoading(true);
      const success = await addModel(file.uri, file.name);
      setLoading(false);
      
      if (success) {
        Alert.alert('Success', 'Model imported successfully');
      } else {
        Alert.alert('Error', 'Failed to import model');
      }
    }
  };

  const renderModelItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.modelItem}
      onPress={() => {
          selectModel(item);
          if (onSelectModel) onSelectModel(item);
      }}
    >
      <View>
        <Text style={styles.modelName}>{item.name}</Text>
        <Text style={styles.modelInfo}>{readableFileSize(item.file_size)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LLM Models</Text>
      
      <FlatList
        data={models}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderModelItem}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No models found. Import a model to get started.</Text>
        }
      />
      
      <TouchableOpacity 
        style={styles.importButton}
        onPress={handleImportModel}
        disabled={loading}
      >
        <Text style={styles.importButtonText}>
          {loading ? 'Importing...' : 'Import Model'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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
  list: {
    flex: 1,
  },
  modelItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontStyle: 'italic',
  },
  importButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  importButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000
  },
});