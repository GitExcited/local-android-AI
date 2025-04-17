// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity, Modal } from 'react-native';
import TextPredictor from './screens/TextPredictorScreen';
import SetupGuide from './screens/SetupGuideScreen';
import { checkLlamaServer } from './services/llmService';

export default function App() {
  const [isSetupModalVisible, setIsSetupModalVisible] = useState(false);
  const [isServerReady, setIsServerReady] = useState(false);
  
  // Check if server is configured on app launch
  useEffect(() => {
    checkServerStatus();
  }, []);
  
  // Check server status
  const checkServerStatus = async () => {
    const isRunning = await checkLlamaServer();
    setIsServerReady(isRunning);
    
    // If this is first launch and server isn't ready, show setup guide
    if (!isRunning) {
      // You could use AsyncStorage to check if this is first launch
      setIsSetupModalVisible(true);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Text Prediction</Text>
        <TouchableOpacity onPress={() => setIsSetupModalVisible(true)}>
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>
      
      <TextPredictor />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by llama.cpp UI
        </Text>
      </View>
      
      {/* Setup Guide Modal */}
      <Modal
        visible={isSetupModalVisible}
        animationType="slide"
        transparent={false}
      >
        <SetupGuide onClose={() => setIsSetupModalVisible(false)} />
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  helpText: {
    color: '#0066cc',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
  },
});