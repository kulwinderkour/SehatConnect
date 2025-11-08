/**
 * useChatbot.ts
 * Custom hook for managing chatbot interactions
 */

import { useState, useCallback, useEffect } from 'react';
import { chatbotService, ChatMessage } from '../services/ChatbotService';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
    // Check backend status silently (don't show errors if backend is down)
    checkBackendStatus().catch(() => {
      // Silently ignore health check failures
    });
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      chatbotService.saveChatHistory(messages);
    }
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await chatbotService.loadChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Add welcome message if no history
        addBotMessage(
          "👋 Hello! I'm Sehat, your medical assistant.\n\n" +
          "I can help you understand your symptoms and suggest possible conditions.\n\n" +
          "⚠️ Remember: I'm an AI assistant. Always consult a qualified doctor for proper diagnosis and treatment.\n\n" +
          "How are you feeling today?"
        );
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const checkBackendStatus = async () => {
    try {
      const status = await chatbotService.checkBackendStatus();
      setIsOnline(status);
    } catch (error) {
      // Silently handle health check failures - backend might not be running
      setIsOnline(false);
    }
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addUserMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addBotMessage = (text: string, confidence?: number) => {
    const botMessage: ChatMessage = {
      id: generateMessageId(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      confidence,
    };
    setMessages(prev => [...prev, botMessage]);
    return botMessage;
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    
    // Add user message
    addUserMessage(text);
    
    // Show typing indicator
    setIsTyping(true);

    try {
      // Try to get response from backend
      const response = await chatbotService.sendMessage(text);
      
      // Add bot response
      addBotMessage(response.reply, response.confidence);
      setIsOnline(true);
      
    } catch (error: any) {
      console.error('Send message error:', error);
      
      // Use fallback response in offline mode
      const fallbackResponse = chatbotService.getFallbackResponse(text);
      addBotMessage(fallbackResponse.reply, fallbackResponse.confidence);
      setIsOnline(false);
      setError(error.message || 'Failed to send message');
      
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearChat = useCallback(async () => {
    setMessages([]);
    await chatbotService.clearChatHistory();
    
    // Add welcome message again
    addBotMessage(
      "👋 Chat cleared! How can I help you today?\n\n" +
      "Describe your symptoms and I'll try to help."
    );
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.sender === 'user');
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.text);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isTyping,
    isOnline,
    error,
    sendMessage,
    clearChat,
    retryLastMessage,
    checkBackendStatus,
  };
};

export default useChatbot;
