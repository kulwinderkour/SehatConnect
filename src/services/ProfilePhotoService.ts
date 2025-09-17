import { PROFILE_PHOTO_URI } from '../assets/images/profile-photos';

export interface ProfilePhotoConfig {
  name: string;
  uri: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number; // in bytes
}

// Single user profile photo - only one photo needed!
// The system will automatically resize it for different contexts
export const PROFILE_PHOTOS: ProfilePhotoConfig[] = [
  {
    name: 'rajinder_singh',
    uri: PROFILE_PHOTO_URI,
    dimensions: { width: 400, height: 400 },
    fileSize: 45000
  }
];

// For your uploaded photo, you can replace the above with:
// {
//   name: 'rajinder_singh',
//   uri: 'https://your-domain.com/path/to/rajinder_singh.jpg',
//   dimensions: { width: 400, height: 400 },
//   fileSize: 45000
// }

// Default placeholder photo
export const DEFAULT_PROFILE_PHOTO = {
  name: 'default_placeholder',
  uri: 'https://via.placeholder.com/200x200/5a9e31/ffffff?text=R',
  dimensions: { width: 200, height: 200 },
  fileSize: 0
};

export class ProfilePhotoService {
  /**
   * Get all available profile photos
   */
  static getAvailablePhotos(): ProfilePhotoConfig[] {
    return PROFILE_PHOTOS;
  }

  /**
   * Get a specific profile photo by name
   */
  static getPhotoByName(name: string): ProfilePhotoConfig | null {
    return PROFILE_PHOTOS.find(photo => photo.name === name) || null;
  }

  /**
   * Get the default placeholder photo
   */
  static getDefaultPhoto(): ProfilePhotoConfig {
    return DEFAULT_PROFILE_PHOTO;
  }

  /**
   * Validate photo dimensions
   */
  static validatePhotoDimensions(width: number, height: number): boolean {
    const minSize = 100;
    const maxSize = 1000;
    const aspectRatio = width / height;
    
    return (
      width >= minSize && width <= maxSize &&
      height >= minSize && height <= maxSize &&
      aspectRatio >= 0.8 && aspectRatio <= 1.2 // Allow some flexibility in aspect ratio
    );
  }

  /**
   * Get recommended photo dimensions for different contexts
   */
  static getRecommendedDimensions(context: 'header' | 'profile' | 'thumbnail'): { width: number; height: number } {
    switch (context) {
      case 'header':
        return { width: 50, height: 50 };
      case 'profile':
        return { width: 80, height: 80 };
      case 'thumbnail':
        return { width: 200, height: 200 };
      default:
        return { width: 200, height: 200 };
    }
  }

  /**
   * Instructions for adding local photos
   */
  static getLocalPhotoInstructions(): string {
    return `
To add your own profile photos:

1. Place your photos in: src/assets/images/profile-photos/
2. Recommended dimensions: 200x200 pixels (minimum) or 400x400 pixels (optimal)
3. Supported formats: JPG, PNG, WebP
4. File size: Under 2MB recommended
5. Naming: Use descriptive names like 'rajinder_singh.jpg'

Example local photo setup:
- src/assets/images/profile-photos/rajinder_singh.jpg (400x400)
- src/assets/images/profile-photos/user_001.png (200x200)
- src/assets/images/profile-photos/profile_placeholder.jpg (200x200)

Then update the PROFILE_PHOTOS array to use:
uri: require('../assets/images/profile-photos/your_photo.jpg')
    `;
  }
}