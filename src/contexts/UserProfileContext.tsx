import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProfilePhotoService } from '../services/ProfilePhotoService';
import { StorageService } from '../services/StorageService';

interface UserProfile {
  fullName: string;
  patientId: string;
  shortName: string;
  profileImage: any; // Can be string (for remote) or number (for local require())
  email?: string;
  phone?: string;
}

interface UserProfileContextType {
  userProfile: UserProfile;
  updateProfileImage: (imageUri: any) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loadSavedProfile: (userId: string) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  // Get the first available photo from the service
  const defaultPhoto = ProfilePhotoService.getAvailablePhotos()[0];
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "Rajinder Singh",
    patientId: "SH001234",
    shortName: "Rajinder",
    profileImage: defaultPhoto?.uri || require('../assets/images/profile-photos/rajinder_singh.jpg'),
    email: "rajinder.singh@example.com",
    phone: "+91 98765 43210"
  });

  const updateProfileImage = async (imageUri: any) => {
    console.log('Updating profile image:', imageUri);
    
    setUserProfile(prev => {
      const updated = {
        ...prev,
        profileImage: imageUri
      };
      
      // Save to storage
      StorageService.saveProfileImage(prev.patientId, imageUri).catch(err => 
        console.error('Failed to save profile image:', err)
      );
      
      return updated;
    });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    console.log('Updating profile:', updates);
    
    setUserProfile(prev => {
      const updated = {
        ...prev,
        ...updates
      };
      
      // Save profile image if it was updated
      if (updates.profileImage) {
        StorageService.saveProfileImage(updated.patientId, updates.profileImage).catch(err =>
          console.error('Failed to save profile image:', err)
        );
      }
      
      return updated;
    });
  };

  const loadSavedProfile = async (userId: string) => {
    console.log('Loading saved profile for user:', userId);
    
    try {
      // Load saved profile image
      const savedImage = await StorageService.getProfileImage(userId);
      
      if (savedImage) {
        console.log('Found saved profile image:', savedImage);
        setUserProfile(prev => ({
          ...prev,
          profileImage: savedImage
        }));
      } else {
        console.log('No saved profile image found, using default');
      }
    } catch (error) {
      console.error('Error loading saved profile:', error);
    }
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, updateProfileImage, updateProfile, loadSavedProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
