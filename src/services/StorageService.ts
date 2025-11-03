import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service - Handles persistent data storage using AsyncStorage
 */

export class StorageService {
  /**
   * Save profile image URI
   */
  static async saveProfileImage(userId: string, imageUri: string | number): Promise<void> {
    try {
      const key = `profile_image_${userId}`;
      // Handle both local require() numbers and string URIs
      const uriString = typeof imageUri === 'number' ? `local:${imageUri}` : imageUri;
      await AsyncStorage.setItem(key, uriString);
      console.log('✅ Profile image saved to AsyncStorage:', key);
    } catch (error) {
      console.error('❌ Error saving profile image:', error);
      throw error;
    }
  }

  /**
   * Get saved profile image URI
   */
  static async getProfileImage(userId: string): Promise<any | null> {
    try {
      const key = `profile_image_${userId}`;
      const savedUri = await AsyncStorage.getItem(key);
      
      if (savedUri) {
        // Handle local require() format
        if (savedUri.startsWith('local:')) {
          const localId = parseInt(savedUri.replace('local:', ''), 10);
          console.log('✅ Profile image loaded from AsyncStorage (local):', key);
          return localId;
        }
        console.log('✅ Profile image loaded from AsyncStorage:', key);
        return savedUri;
      } else {
        console.log('ℹ️ No saved profile image found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting profile image:', error);
      return null;
    }
  }

  /**
   * Save user profile data
   */
  static async saveUserProfile(userId: string, profileData: any): Promise<void> {
    try {
      const key = `user_profile_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(profileData));
      console.log('✅ User profile saved to AsyncStorage:', key);
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile data
   */
  static async getUserProfile(userId: string): Promise<any | null> {
    try {
      const key = `user_profile_${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        console.log('✅ User profile loaded from AsyncStorage:', key);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Clear user data (on logout)
   */
  static async clearUserData(userId: string): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        `profile_image_${userId}`,
        `user_profile_${userId}`
      ]);
      console.log('✅ User data cleared from AsyncStorage');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ All storage cleared from AsyncStorage');
    } catch (error) {
      console.error('❌ Error clearing all storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys in storage
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('📦 Storage keys from AsyncStorage:', keys);
      return keys;
    } catch (error) {
      console.error('❌ Error getting all keys:', error);
      return [];
    }
  }
}

