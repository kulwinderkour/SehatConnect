/**
 * Authentication Service
 * Handles all authentication operations with the backend
 */

import apiService from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@sehatconnect:accessToken',
  REFRESH_TOKEN: '@sehatconnect:refreshToken',
  USER_DATA: '@sehatconnect:userData',
};

// Types
export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  role: 'patient' | 'doctor';
  profile: {
    fullName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    bloodGroup?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPVerification {
  userId: string;
  otp: string;
}

export interface User {
  _id: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor';
  profile: any;
  isVerified: boolean;
  doctorInfo?: any;
  patientInfo?: any;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string; // Optional for backward compatibility
}

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData) {
    try {
      const response = await apiService.post<{ userId: string; email: string; phone: string }>(
        '/auth/register',
        data
      );
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: OTPVerification) {
    try {
      const response = await apiService.post<AuthResponse>('/auth/verify-otp', data);
      
      if (response.success && response.data) {
        // Store tokens and user data
        await this.saveAuthData(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(userId: string) {
    try {
      const response = await apiService.post('/auth/resend-otp', { userId });
      return response;
    } catch (error) {
      console.error('Resend OTP failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData) {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', data);
      
      if (response.success && response.data) {
        await this.saveAuthData(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiService.post('/auth/logout');
      await this.clearAuthData();
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local data even if API call fails
      await this.clearAuthData();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const response = await apiService.get<{ user: User }>('/auth/me');
      return response;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string) {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await apiService.post<{ accessToken: string }>('/auth/refresh-token', {
        refreshToken,
      });

      if (response.success && response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
        apiService.setAuthToken(response.data.accessToken);
      }

      return response;
    } catch (error) {
      console.error('Refresh token failed:', error);
      await this.clearAuthData();
      throw error;
    }
  }

  /**
   * Save authentication data to storage
   */
  private async saveAuthData(authData: AuthResponse) {
    try {
      const dataToSave: Array<[string, string]> = [
        [STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user)],
      ];

      // Only save refresh token if it exists
      if (authData.refreshToken) {
        dataToSave.push([STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken]);
      }

      await AsyncStorage.multiSet(dataToSave);

      // Set token in API service
      apiService.setAuthToken(authData.accessToken);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  }

  /**
   * Clear authentication data
   */
  private async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      // Clear token from API service
      apiService.clearAuthToken();
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored user data
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Initialize auth service (call on app start)
   */
  async initialize() {
    try {
      const token = await this.getAccessToken();
      if (token) {
        // Just set the token, don't verify it here
        // The AuthContext will handle verification
        apiService.setAuthToken(token);
        console.log('🔑 Token loaded from storage');
      } else {
        console.log('ℹ️ No token found in storage');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
