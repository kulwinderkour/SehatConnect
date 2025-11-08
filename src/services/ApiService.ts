// Base API service for SehatConnect
// This file handles all API communication with your backend

import { Doctor, Appointment, HealthMetric } from '../types/health';
import { Platform } from 'react-native';

// Base API configuration
// For Android Emulator: use 10.0.2.2 to access host machine's localhost
// For iOS Simulator: use localhost
// For Physical Device: use your computer's IP address (e.g., 192.168.x.x)
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:5000/api' // Android Emulator - Backend runs on port 5000
    : 'http://localhost:5000/api' // iOS Simulator
  : 'https://your-production-api.com/api'; // Production

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// HTTP methods
class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Authentication removed - no tokens needed

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      // Only log in development mode
      if (__DEV__) {
        console.log('🌐 API Request:', options.method || 'GET', endpoint);
      }

      let response;
      try {
        response = await fetch(url, config);
      } catch (fetchError: any) {
        // Catch network errors (backend not running, no internet, etc.)
        if (fetchError.message === 'Network request failed' || fetchError.name === 'TypeError') {
          console.warn('⚠️ Network request failed - backend may not be running:', endpoint);
          return {
            success: false,
            data: null,
            error: 'Network request failed. Please check if the backend server is running.',
            message: 'Unable to connect to server',
          } as ApiResponse<T>;
        }
        throw fetchError;
      }
      
      // Check if response is JSON before parsing
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, read as text
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text || 'Unknown error' };
        }
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        
        // Don't log errors for expected failures - silently handle them
        // Only log 500 errors as they indicate server issues
        if (__DEV__ && response.status >= 500) {
          console.warn('⚠️ Server error:', { endpoint, status: response.status });
        }
        
        // Return error response instead of throwing
        return {
          success: false,
          data: null,
          error: errorMessage,
          message: errorMessage,
        } as ApiResponse<T>;
      }

      return data;
    } catch (error: any) {
      // Only log unexpected errors (not network failures, those are handled above)
      if (!error.message?.includes('Network request failed') && !error.message?.includes('Unable to connect')) {
        if (__DEV__) {
          console.warn('⚠️ API Request failed:', {
            endpoint,
            error: error.message,
          });
        }
      }
      
      // Return error response instead of throwing
      return {
        success: false,
        data: null,
        error: error.message || 'Unknown error',
        message: error.message || 'Request failed',
      } as ApiResponse<T>;
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
      },
      body: file,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
