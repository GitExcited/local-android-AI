// state/ChatState.js
import { create } from 'zustand';
import BackgroundService from 'react-native-background-actions';

export const useChatStore = create((set, get) => ({
  messages: [],
  currentMessage: '',
  generating: false,
  
  addMessage: (text, isUser) => set(state => ({
    messages: [...state.messages, {
      id: Date.now(),
      text,
      isUser,
      timestamp: new Date()
    }]
  })),
  
  setCurrentMessage: (text) => set({ currentMessage: text }),
  
  appendToCurrentMessage: (text) => set(state => ({
    currentMessage: state.currentMessage + text
  })),
  
  setGenerating: (value) => set({ generating: value }),
  
  clearChat: () => set({ messages: [], currentMessage: '' }),
}));