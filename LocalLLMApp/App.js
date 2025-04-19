// App.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ensureDirectories } from './utils/FileUtils';
import ModelScreen from './screens/ModelScreen';
import ModelLoadingScreen from './screens/ModelLoadingScreen';
import ChatScreen from './screens/ChatScreen';
import AutopredictScreen from './screens/AutoPredictScreen';
import { useModelStore } from './state/ModelState';
import { useLlamaEngine } from './state/LlamaState';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [screen, setScreen] = useState('models');
  
  const { selectedModel, selectModel } = useModelStore();
  const { model } = useLlamaEngine();
  
  useEffect(() => {
    const setupApp = async () => {
      await ensureDirectories();
      setAppReady(true);
    };
    
    setupApp();
  }, []);
  
  useEffect(() => {
    // If a model is loaded, go to chat screen
    if (model) {
      setScreen('chat');
    }
  }, [model]);
  
  if (!appReady) {
    return <View style={styles.container} />;
  }
  
  if (screen === 'models') {
    return (
      <ModelScreen 
        onSelectModel={(model) => {
          selectModel(model);
          setScreen('load');
        }}
      />
    );
  }
  
  if (screen === 'load' && selectedModel) {
    return (
      <ModelLoadingScreen 
        model={selectedModel}
        onLoaded={() => setScreen('chat')}
        onBack={() => {
          selectModel(null);
          setScreen('models');
        }}
      />
    );
  }
  
  if (screen === 'chat') {
    return (
      <ChatScreen 
        onBack={() => {
          setScreen('models');
        }}
        onSwitchToPredict={() => setScreen('predict')} 
      />
    );
  }
  
  if (screen === 'predict') {
    return (
      <AutopredictScreen 
        onBack={() => {
          setScreen('chat');
        }}
      />
    );
  }
  
  return <ModelScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  }
});