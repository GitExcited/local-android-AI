// screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLlamaEngine } from '../state/LlamaState';
import { useChatStore } from '../state/ChatState';
import BackgroundService from 'react-native-background-actions';

export default function ChatScreen({ onBack }) {
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);
  
  const { model, completion, stopCompletion } = useLlamaEngine();
  const { 
    messages, 
    currentMessage, 
    generating,
    addMessage, 
    setCurrentMessage,
    appendToCurrentMessage,
    setGenerating
  } = useChatStore();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, currentMessage]);
  
  const handleSend = async () => {
    if (!input.trim() || generating) return;
    
    const userMessage = input.trim();
    addMessage(userMessage, true);
    setInput('');
    setGenerating(true);
    
    // Build prompt from conversation history
    let prompt = "";
    messages.forEach(msg => {
      prompt += msg.isUser ? `User: ${msg.text}\n` : `Assistant: ${msg.text}\n`;
    });
    prompt += `User: ${userMessage}\nAssistant:`;
    
    // Create an empty message for the AI response
    addMessage('', false);
    setCurrentMessage('');
    
    // Run inference in background
    await BackgroundService.start(
      async () => {
        try {
          await completion(
            prompt,
            {
              temperature: 0.7,
              maxTokens: 800,
              topK: 40,
              topP: 0.9,
              repeatPenalty: 1.1,
            },
            (token) => {
              appendToCurrentMessage(token);
            },
            (text, timings) => {
              setGenerating(false);
              BackgroundService.stop();
            }
          );
        } catch (error) {
          console.error('Inference error:', error);
          setGenerating(false);
          BackgroundService.stop();
        }
      },
      {
        taskName: 'LLM Inference',
        taskTitle: 'Generating response',
        taskDesc: 'Processing your query with AI model',
        taskIcon: {
          name: 'ic_launcher',
          type: 'mipmap',
        },
      }
    );
  };
  
  const handleStop = async () => {
    await stopCompletion();
    setGenerating(false);
    BackgroundService.stop();
  };
  
  const renderMessage = ({ item, index }) => {
    const isLastAiMessage = !item.isUser && index === messages.length - 1;
    const displayText = isLastAiMessage && generating ? currentMessage : item.text;
    
    return (
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={styles.messageText}>{displayText}</Text>
        {isLastAiMessage && generating && (
          <ActivityIndicator size="small" color="#999" style={{ marginTop: 8 }} />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{model?.name || 'Chat'}</Text>
        <View style={{ width: 50 }} />
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Send a message to start chatting</Text>
        }
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline
          editable={!generating}
        />
        
        {generating ? (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && styles.disabledButton]} 
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
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
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#e1f5fe',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#f44336',
    borderRadius: 20,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdbdbd',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});