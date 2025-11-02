import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProfilePhotoService } from '../services/ProfilePhotoService';

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

  const updateProfileImage = (imageUri: any) => {
    setUserProfile(prev => ({
      ...prev,
      profileImage: imageUri
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <UserProfileContext.Provider value={{ userProfile, updateProfileImage, updateProfile }}>
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
