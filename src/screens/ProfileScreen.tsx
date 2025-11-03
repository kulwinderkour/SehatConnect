import React, { useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
// import LinearGradient from 'react-native-linear-gradient'; // Commented out as unused
import Header from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ProfilePhotoService, ProfilePhotoConfig } from '../services/ProfilePhotoService';
import { safeAlert } from '../utils/safeAlert';

const ProfileScreen = memo(() => {
  const { user, logout } = useAuth();
  const { userProfile, updateProfileImage } = useUserProfile();
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const availablePhotos = ProfilePhotoService.getAvailablePhotos();
  // navigation is a stack navigator inside the Profile tab; typing here is kept permissive to allow
  // navigation to stack screens added in ProfileStackNavigator (PersonalInfo, Language, etc.).
  // Narrow typing can be added if a shared ParamList is declared.
  const navigation = useNavigation<any>();

  const handlePhotoSelect = useCallback((photo: ProfilePhotoConfig) => {
    updateProfileImage(photo.uri);
    setIsPhotoModalVisible(false);
    safeAlert('Success', 'Profile photo updated successfully!');
  }, [updateProfileImage]);

  // Open camera to take a new photo
  const openCamera = useCallback(async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        includeBase64: false,
        useFrontCamera: true,
        mediaType: 'photo',
      });
      
      updateProfileImage(image.path);
      setIsPhotoModalVisible(false);
      safeAlert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Camera error:', error);
        safeAlert('Error', 'Failed to take photo. Please try again.');
      }
    }
  }, [updateProfileImage]);

  // Open gallery to select existing photo
  const openGallery = useCallback(async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        includeBase64: false,
        mediaType: 'photo',
      });
      
      updateProfileImage(image.path);
      setIsPhotoModalVisible(false);
      safeAlert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Gallery error:', error);
        safeAlert('Error', 'Failed to select photo. Please try again.');
      }
    }
  }, [updateProfileImage]);

  const handlePhotoPress = useCallback(() => {
    // Show modal with camera and gallery options
    setIsPhotoModalVisible(true);
  }, []);

  const handleLogout = useCallback(() => {
    safeAlert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logging out...');
            logout();
            console.log('Logout complete, AppNavigator will handle navigation');
            // Force a small delay to ensure state updates are processed
            setTimeout(() => {
              console.log('Logout state should be updated by now');
            }, 100);
          },
        },
      ]
    );
  }, [logout]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoPress}>
            <Image 
              source={typeof userProfile.profileImage === 'string' ? { uri: userProfile.profileImage } : userProfile.profileImage}
              style={styles.avatar}
              resizeMode="contain"
            />
            <View style={styles.editIcon}>
              <Text style={styles.editIconText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{userProfile.fullName}</Text>
          <Text style={styles.pid}>Patient ID: {userProfile.patientId}</Text>
          <Text style={styles.editHint}>Tap photo to change</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PersonalInfo') }>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>👤</Text>
              <Text>Personal Information</Text>
            </View>
            <Text>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FamilyMembers') }>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>👨‍👩‍👧‍👦</Text>
              <Text>Family Members</Text>
            </View>
            <Text>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('InsuranceInfo') }>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>🏥</Text>
              <Text>Insurance Info</Text>
            </View>
            <Text>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AppSettings')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>⚙️</Text>
              <Text>App Settings</Text>
            </View>
            <Text>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Language')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>🌐</Text>
              <Text>Language: English</Text>
            </View>
            <Text>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PrivacySecurity')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>🔒</Text>
              <Text>Privacy & Security</Text>
            </View>
            <Text>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>❓</Text>
              <Text>Help & Support</Text>
            </View>
            <Text>›</Text>
          </View>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>ℹ️</Text>
              <Text>About SehatConnect</Text>
            </View>
            <Text>›</Text>
          </View>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
            <Text>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Profile Photo</Text>
            <Text style={styles.modalSubtitle}>Choose how you want to update your photo</Text>
            
            <TouchableOpacity
              style={styles.photoOptionButton}
              onPress={openCamera}
            >
              <View style={styles.photoOptionIcon}>
                <Text style={styles.photoOptionEmoji}>📷</Text>
              </View>
              <View style={styles.photoOptionText}>
                <Text style={styles.photoOptionTitle}>Take Photo</Text>
                <Text style={styles.photoOptionDescription}>Use camera to take a new photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoOptionButton}
              onPress={openGallery}
            >
              <View style={styles.photoOptionIcon}>
                <Text style={styles.photoOptionEmoji}>🖼️</Text>
              </View>
              <View style={styles.photoOptionText}>
                <Text style={styles.photoOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.photoOptionDescription}>Select from your photo library</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default ProfileScreen;

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: '#fff', borderRadius: 15, padding: 25, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  avatarContainer: {
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 15,
    shadowColor: '#5a9e31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#5a9e31',
    position: 'relative',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { 
    width: 92, 
    height: 92, 
    borderRadius: 46,
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5a9e31',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editIconText: {
    fontSize: 14,
  },
  name: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 5 },
  pid: { fontSize: 14, color: '#666' },
  editHint: { fontSize: 12, color: '#999', marginTop: 5, fontStyle: 'italic' },
  menuSection: {
    backgroundColor: '#fff', borderRadius: 15, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  menuItem: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  photoOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoOptionEmoji: {
    fontSize: 24,
  },
  photoOptionText: {
    flex: 1,
  },
  photoOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  photoOptionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutText: {
    color: '#ef4444',
  },
});
