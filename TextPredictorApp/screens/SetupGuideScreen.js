// SetupGuide.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const SetupGuide = ({ onClose }) => {
  // Open Play Store to download llama.cpp UI
  const openPlayStore = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.llamacpp.llama.cpp.ui');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Setting Up llama.cpp UI</Text>
      
      <Text style={styles.subtitle}>Step 1: Install llama.cpp UI</Text>
      <Text style={styles.paragraph}>
        Our app uses llama.cpp UI to provide text predictions. You'll need to install it from the Google Play Store.
      </Text>
      <TouchableOpacity style={styles.button} onPress={openPlayStore}>
        <Text style={styles.buttonText}>Download from Play Store</Text>
      </TouchableOpacity>
      
      <Text style={styles.subtitle}>Step 2: Set Up llama.cpp UI</Text>
      <Text style={styles.paragraph}>
        After installing, open llama.cpp UI and follow these steps:
      </Text>
      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>1. Tap the "+" button to download a model</Text>
        <Text style={styles.instruction}>2. Choose "Download from the Hub"</Text>
        <Text style={styles.instruction}>3. Select a small model like "TinyLlama"</Text>
        <Text style={styles.instruction}>4. Choose the "Q4_K_M" quantization</Text>
        <Text style={styles.instruction}>5. Tap "Download" and wait for it to complete</Text>
      </View>
      
      <Text style={styles.subtitle}>Step 3: Enable the API Server</Text>
      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>1. Tap on your downloaded model</Text>
        <Text style={styles.instruction}>2. Tap the three dots in the top right</Text>
        <Text style={styles.instruction}>3. Select "Settings"</Text>
        <Text style={styles.instruction}>4. Find "API Server" and toggle it ON</Text>
        <Text style={styles.instruction}>5. Set the port to 8080</Text>
      </View>
      
      <Text style={styles.paragraph}>
        That's it! Now our app will automatically connect to llama.cpp UI when you need text predictions.
      </Text>
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Got it</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  instructionContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SetupGuide;