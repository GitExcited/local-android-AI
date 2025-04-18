import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Text, View } from 'react-native';
import TextPredictorTest from './TextPredictorTest';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>LLM Word Predictor</Text>
      </View>
      <TextPredictorTest />
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
});