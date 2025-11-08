/**
 * ChatbotService.ts
 * Service to handle communication with the medical chatbot backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  confidence?: number;
}

export interface ChatbotResponse {
  reply: string;
  confidence?: number;
}

// Get the correct backend URL based on platform
const getBackendURL = () => {
  // For Android Emulator, use 10.0.2.2 to access host machine's localhost
  // For iOS Simulator, use localhost
  // For Physical Devices, use your computer's actual IP address (e.g., 192.168.x.x)
  
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android Emulator - Use special alias to host machine
      return 'http://10.0.2.2:8000';
    } else {
      // iOS Simulator - Use localhost
      return 'http://localhost:8000';
    }
  }
  
  // Production - Update with your production chatbot URL
  return 'https://your-production-chatbot-api.com';
};

const BACKEND_URL = getBackendURL();

const CHAT_HISTORY_KEY = '@sehat_chat_history';
const REQUEST_TIMEOUT = 15000; // 15 seconds for better reliability

class ChatbotService {
  private static instance: ChatbotService;
  private isBackendOnline: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  private constructor() {
    // Initial health check - DISABLED to prevent console errors
    // Uncomment when backend is running:
    // this.checkBackendStatus();
  }

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  /**
   * Send a message to the chatbot backend with optimized error handling
   */
  public async sendMessage(message: string): Promise<ChatbotResponse> {
    const requestUrl = `${BACKEND_URL}/chat`;
    console.log('='.repeat(60));
    console.log('🤖 ChatbotService - SENDING MESSAGE');
    console.log('='.repeat(60));
    console.log('📍 Backend URL:', BACKEND_URL);
    console.log('📍 Request URL:', requestUrl);
    console.log('📱 Platform:', Platform.OS);
    console.log('📱 DEV Mode:', __DEV__);
    console.log('💬 Message:', message);
    console.log('🌐 Online Status:', this.isBackendOnline);
    console.log('='.repeat(60));
    
    // Check cache status - DISABLED to prevent console errors
    // Uncomment when backend is running:
    // const now = Date.now();
    // if (now - this.lastHealthCheck > this.healthCheckInterval) {
    //   this.checkBackendStatus();
    //   this.lastHealthCheck = now;
    // }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      console.log('📡 Fetching:', requestUrl);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('✅ Response received - Status:', response.status);
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 ChatbotService - Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Server error'}`);
      }

      const data = await response.json();
      console.log('✅ SUCCESS! Response data:', JSON.stringify(data, null, 2));
      console.log('='.repeat(60));
      
      this.isBackendOnline = true;
      
      return {
        reply: data.reply || 'Sorry, I could not process your request.',
        confidence: data.confidence,
      };
    } catch (error: any) {
      console.log('='.repeat(60));
      console.error('❌ ERROR IN CHATBOT SERVICE');
      console.log('='.repeat(60));
      console.error('❌ Error object:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.log('='.repeat(60));
      
      this.isBackendOnline = false;
      
      if (error.name === 'AbortError') {
        throw new Error('⏱️ Request timeout - Server is slow. Please try again.');
      }
      
      // Return better error message
      throw new Error('🔌 Unable to connect to Sehat AI. Server may be offline. Please retry.');
    }
  }

  /**
   * Save chat history to AsyncStorage
   */
  public async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(messages);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  /**
   * Load chat history from AsyncStorage
   */
  public async loadChatHistory(): Promise<ChatMessage[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (jsonValue) {
        const messages = JSON.parse(jsonValue);
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Clear chat history
   */
  public async clearChatHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  /**
   * Check if backend is available (with caching)
   */
  public async checkBackendStatus(): Promise<boolean> {
    // Skip health check if backend URL is not configured or in production
    if (!BACKEND_URL || BACKEND_URL.includes('your-production-api.com')) {
      this.isBackendOnline = false;
      return false;
    }

    const healthUrl = `${BACKEND_URL}/health`;
    
    // Only log in development mode
    if (__DEV__) {
      console.log('🔍 Checking backend health:', healthUrl);
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced to 5 seconds

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const isOnline = response.ok;
      this.isBackendOnline = isOnline;
      this.lastHealthCheck = Date.now();
      
      if (__DEV__ && isOnline) {
        console.log('✅ Backend is online');
      }
      
      return isOnline;
    } catch (error: any) {
      // Don't log as error - backend might not be running, which is expected
      // Only log in development mode
      if (__DEV__) {
        console.log('⚠️ Backend health check failed (backend may not be running):', error.message);
      }
      this.isBackendOnline = false;
      this.lastHealthCheck = Date.now();
      return false;
    }
  }
  
  /**
   * Get cached backend status
   */
  public getCachedBackendStatus(): boolean {
    return this.isBackendOnline;
  }

  /**
   * Generate fallback response for offline mode
   */
  public getFallbackResponse(query: string): ChatbotResponse {
    const lowerQuery = query.toLowerCase();
    
    // Simple keyword-based fallback responses
    if (lowerQuery.includes('fever') || lowerQuery.includes('temperature')) {
      return {
        reply: "⚠️ Offline Mode Active\n\n🌡️ For fever symptoms, it's recommended to:\n• Rest and stay hydrated\n• Monitor your temperature regularly\n• Take paracetamol if needed\n• Consult a doctor if fever persists >3 days\n\n🔌 Reconnect to get AI-powered diagnosis from Sehat.",
        confidence: 0,
      };
    }
    
    if (lowerQuery.includes('headache') || lowerQuery.includes('pain')) {
      return {
        reply: "⚠️ Offline Mode Active\n\n😔 For pain or headache:\n• Rest in a quiet, dark room\n• Stay well hydrated\n• Avoid bright screens\n• Consider mild pain relief\n• Consult a doctor if pain persists\n\n🔌 Reconnect to get AI-powered diagnosis from Sehat.",
        confidence: 0,
      };
    }
    
    if (lowerQuery.includes('cough') || lowerQuery.includes('cold')) {
      return {
        reply: "⚠️ Offline Mode Active\n\n🤧 For cough or cold symptoms:\n• Stay hydrated with warm fluids\n• Get adequate rest\n• Use a humidifier if available\n• Avoid cold environments\n• See a doctor if symptoms worsen\n\n🔌 Reconnect to get AI-powered diagnosis from Sehat.",
        confidence: 0,
      };
    }

    return {
      reply: "⚠️ Offline Mode Active\n\n🔌 I'm currently unable to connect to the Sehat AI medical assistant.\n\n📱 Please check:\n• Your internet connection\n• That the backend server is running\n• Then try again\n\n🚨 For immediate medical concerns, please consult a healthcare professional or call emergency services.",
      confidence: 0,
    };
  }
}

export const chatbotService = ChatbotService.getInstance();
export default ChatbotService;
