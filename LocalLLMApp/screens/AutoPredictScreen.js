// screens/AutopredictScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useLlamaEngine } from '../state/LlamaState';

export default function AutopredictScreen({ onBack }) {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { model, predictNextTokens } = useLlamaEngine();
  
  const handlePredict = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    try {
      // Get top 5 predictions
      const results = await predictNextTokens(input.trim(), 5);
      setPredictions(results);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const addPrediction = (text) => {
    setInput(input + text);
  };
  
  const renderPredictionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.predictionItem}
      onPress={() => addPrediction(item.text)}
    >
      <Text style={styles.predictionText}>{item.text}</Text>
      <Text style={styles.scoreText}>Score: {item.score.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{model?.name || 'Word Prediction'}</Text>
        <View style={{ width: 50 }} />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Enter text here..."
          multiline
        />
        
        <TouchableOpacity 
          style={[styles.predictButton, !input.trim() && styles.disabledButton]} 
          onPress={handlePredict}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Predict Next</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Predictions:</Text>
        
        <FlatList
          data={predictions}
          keyExtractor={(item, index) => `prediction-${index}`}
          renderItem={renderPredictionItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? 'Generating predictions...' : 'Press "Predict Next" to see word suggestions'}
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2196F3',
    paddingTop: 50,
  },
  backButton: {
    width: 50,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  predictButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdbdbd',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  predictionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionText: {
    fontSize: 16,
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
});