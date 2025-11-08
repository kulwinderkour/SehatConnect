/**
 * Backend Chatbot Service
 * Handles AI chatbot conversations with the main backend API
 */

import apiService from './ApiService';

export interface BackendChatMessage {
  _id?: string;
  role: 'user' | 'bot';
  content: string;
  timestamp?: string;
  metadata?: {
    symptoms?: string[];
    predictedDiseases?: Array<{
      disease: string;
      confidence: number;
    }>;
    recommendations?: string[];
  };
}

export interface BackendChatbotConversation {
  _id?: string;
  title?: string;
  messages: BackendChatMessage[];
  context?: {
    symptoms: string[];
    currentIssue?: string;
    relevantHistory?: string[];
  };
  isActive?: boolean;
  lastMessageAt?: string;
  createdAt?: string;
}

export interface SymptomAnalysis {
  symptoms: string[];
  predictions: Array<{
    disease: string;
    confidence: number;
    description?: string;
  }>;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  shouldConsultDoctor: boolean;
}

class BackendChatbotService {
  /**
   * Get all conversations
   */
  async getConversations(params?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<{
        conversations: BackendChatbotConversation[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>('/chatbot/conversations', params as any);
      return response;
    } catch (error) {
      console.error('Get conversations failed:', error);
      throw error;
    }
  }

  /**
   * Create new conversation
   */
  async createConversation(data?: {
    title?: string;
    initialMessage?: string;
  }) {
    try {
      const response = await apiService.post<{ conversation: BackendChatbotConversation }>(
        '/chatbot/conversations',
        data || {}
      );
      return response;
    } catch (error) {
      console.error('Create conversation failed:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(id: string) {
    try {
      const response = await apiService.get<{ conversation: BackendChatbotConversation }>(
        `/chatbot/conversations/${id}`
      );
      return response;
    } catch (error) {
      console.error('Get conversation failed:', error);
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(id: string) {
    try {
      const response = await apiService.delete(
        `/chatbot/conversations/${id}`
      );
      return response;
    } catch (error) {
      console.error('Delete conversation failed:', error);
      throw error;
    }
  }

  /**
   * Send message in conversation
   */
  async sendMessage(conversationId: string, message: string) {
    try {
      const response = await apiService.post<{
        message: BackendChatMessage;
        botResponse: BackendChatMessage;
        conversation: BackendChatbotConversation;
      }>(`/chatbot/conversations/${conversationId}/messages`, {
        message,
      });
      return response;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }

  /**
   * Analyze symptoms and predict diseases
   */
  async analyzeSymptoms(symptoms: string[]) {
    try {
      const response = await apiService.post<{
        analysis: SymptomAnalysis;
      }>('/chatbot/analyze-symptoms', {
        symptoms,
      });
      return response;
    } catch (error) {
      console.error('Analyze symptoms failed:', error);
      throw error;
    }
  }

  /**
   * Get health recommendations
   */
  async getHealthRecommendations(data: {
    symptoms?: string[];
    conditions?: string[];
    age?: number;
    gender?: string;
  }) {
    try {
      const response = await apiService.post<{
        recommendations: string[];
        lifestyle: string[];
        dietaryAdvice: string[];
      }>('/chatbot/recommendations', data);
      return response;
    } catch (error) {
      console.error('Get health recommendations failed:', error);
      throw error;
    }
  }

  /**
   * Quick chat without conversation context
   */
  async quickChat(message: string) {
    try {
      // Create a new conversation
      const conversationResponse = await this.createConversation({
        title: 'Quick Chat',
        initialMessage: message,
      });

      // Send message
      const messageResponse = await this.sendMessage(
        conversationResponse.data.conversation._id!,
        message
      );

      return messageResponse;
    } catch (error) {
      console.error('Quick chat failed:', error);
      throw error;
    }
  }

  /**
   * Get emergency services nearby
   */
  async getEmergencyServices(latitude: number, longitude: number, radius: number = 10000) {
    try {
      const response = await apiService.get<{
        services: Array<{
          type: 'hospital' | 'ambulance' | 'blood_bank' | 'pharmacy';
          name: string;
          address: string;
          phone: string;
          distance: number;
          isAvailable: boolean;
        }>;
      }>('/emergency/nearby', {
        latitude,
        longitude,
        radius,
      } as any);
      return response;
    } catch (error) {
      console.error('Get emergency services failed:', error);
      throw error;
    }
  }

  /**
   * Search emergency services
   */
  async searchEmergencyServices(params: {
    type?: 'hospital' | 'ambulance' | 'blood_bank' | 'pharmacy';
    city?: string;
    search?: string;
  }) {
    try {
      const response = await apiService.get<{
        services: Array<{
          type: string;
          name: string;
          address: string;
          phone: string;
          email?: string;
        }>;
      }>('/emergency/search', params as any);
      return response;
    } catch (error) {
      console.error('Search emergency services failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const backendChatbotService = new BackendChatbotService();

export default backendChatbotService;
