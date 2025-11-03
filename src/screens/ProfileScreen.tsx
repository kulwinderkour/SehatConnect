import React, { useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
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

      {/* Photo Options Modal - Material Design */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setIsPhotoModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {/* Dialog Title */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Profile Photo</Text>
              <Text style={styles.modalSubtitle}>Choose how you want to update your photo</Text>
            </View>
            
            {/* Dialog Content */}
            <View style={styles.modalBody}>
              <Pressable
                style={styles.materialOptionButton}
                onPress={openCamera}
                android_ripple={{ color: 'rgba(90, 158, 49, 0.1)' }}
              >
                <View style={[styles.materialIconContainer, styles.cameraIconContainer]}>
                  <Camera size={24} color="#5a9e31" strokeWidth={2} />
                </View>
                <View style={styles.materialOptionText}>
                  <Text style={styles.materialOptionTitle}>Take Photo</Text>
                  <Text style={styles.materialOptionDescription}>Use camera to take a new photo</Text>
                </View>
              </Pressable>

              <View style={styles.materialDivider} />

              <Pressable
                style={styles.materialOptionButton}
                onPress={openGallery}
                android_ripple={{ color: 'rgba(90, 158, 49, 0.1)' }}
              >
                <View style={[styles.materialIconContainer, styles.galleryIconContainer]}>
                  <ImageIcon size={24} color="#5a9e31" strokeWidth={2} />
                </View>
                <View style={styles.materialOptionText}>
                  <Text style={styles.materialOptionTitle}>Choose from Gallery</Text>
                  <Text style={styles.materialOptionDescription}>Select from your photo library</Text>
                </View>
              </Pressable>
            </View>

            {/* Dialog Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.materialCancelButton}
                onPress={() => setIsPhotoModalVisible(false)}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
              >
                <Text style={styles.materialCancelButtonText}>CANCEL</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
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
  // Material Design Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16, // More rounded corners for modern look
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24, // Material Design elevation for dialogs
  },
  modalHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20, // Material Design Headline 6
    fontWeight: '500', // Medium weight
    color: 'rgba(0, 0, 0, 0.87)', // Material Design text primary
    marginBottom: 4,
    letterSpacing: 0.15,
  },
  modalSubtitle: {
    fontSize: 14, // Material Design Body 2
    fontWeight: '400', // Regular weight
    color: 'rgba(0, 0, 0, 0.6)', // Material Design text secondary
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  materialOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    minHeight: 48, // Material Design minimum touch target
  },
  materialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cameraIconContainer: {
    backgroundColor: 'rgba(90, 158, 49, 0.12)',
  },
  galleryIconContainer: {
    backgroundColor: 'rgba(90, 158, 49, 0.12)',
  },
  materialOptionText: {
    flex: 1,
  },
  materialOptionTitle: {
    fontSize: 16, // Material Design Subtitle 1
    fontWeight: '400', // Regular weight
    color: 'rgba(0, 0, 0, 0.87)', // Material Design text primary
    marginBottom: 4,
    letterSpacing: 0.15,
  },
  materialOptionDescription: {
    fontSize: 14, // Material Design Body 2
    fontWeight: '400', // Regular weight
    color: 'rgba(0, 0, 0, 0.6)', // Material Design text secondary
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  materialDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)', // Material Design divider color
    marginLeft: 56, // Align with text content (40 icon + 16 margin)
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: 52, // Material Design dialog actions height
  },
  materialCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36, // Material Design button minimum height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  materialCancelButtonText: {
    fontSize: 14, // Material Design Button text
    fontWeight: '500', // Medium weight
    color: '#5a9e31', // Material Design primary color
    letterSpacing: 1.25, // Material Design button letter spacing
  },
  logoutText: {
    color: '#ef4444',
  },
});
