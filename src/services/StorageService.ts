// Temporarily disabled until app is rebuilt
// import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service - Handles persistent data storage
 * 
 * TEMPORARY: Using in-memory storage until app is rebuilt with AsyncStorage
 * 
 * TO ENABLE FULL PERSISTENCE:
 * 1. Stop Metro (Ctrl+C)
 * 2. Run: cd android && ./gradlew clean && cd ..
 * 3. Run: npx react-native run-android
 * 4. Then uncomment the AsyncStorage code below
 */

// Temporary in-memory storage
const storage: { [key: string]: any } = {};

export class StorageService {
  /**
   * Save profile image URI
   */
  static async saveProfileImage(userId: string, imageUri: string): Promise<void> {
    try {
      const key = `profile_image_${userId}`;
      const uriString = typeof imageUri === 'number' ? `local:${imageUri}` : imageUri;
      storage[key] = uriString;
      console.log('✅ Profile image saved (in-memory):', key);
    } catch (error) {
      console.error('❌ Error saving profile image:', error);
    }
  }

  /**
   * Get saved profile image URI
   */
  static async getProfileImage(userId: string): Promise<any | null> {
    try {
      const key = `profile_image_${userId}`;
      const savedUri = storage[key];
      
      if (savedUri) {
        console.log('✅ Profile image loaded (in-memory):', key);
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
      storage[key] = JSON.stringify(profileData);
      console.log('✅ User profile saved (in-memory):', key);
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
    }
  }

  /**
   * Get user profile data
   */
  static async getUserProfile(userId: string): Promise<any | null> {
    try {
      const key = `user_profile_${userId}`;
      const data = storage[key];
      
      if (data) {
        console.log('✅ User profile loaded (in-memory):', key);
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
      delete storage[`profile_image_${userId}`];
      delete storage[`user_profile_${userId}`];
      console.log('ℹ️ User data cleared');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  }

  /**
   * Clear all storage
   */
  static async clearAll(): Promise<void> {
    try {
      Object.keys(storage).forEach(key => delete storage[key]);
      console.log('✅ All storage cleared');
    } catch (error) {
      console.error('❌ Error clearing all storage:', error);
    }
  }

  /**
   * Get all keys in storage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = Object.keys(storage);
      console.log('📦 Storage keys:', keys);
      return keys;
    } catch (error) {
      console.error('❌ Error getting all keys:', error);
      return [];
    }
  }
}

