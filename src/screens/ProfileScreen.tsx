import React, { useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { 
  Camera, 
  Image as ImageIcon, 
  User, 
  Users, 
  Heart, 
  Settings, 
  Globe, 
  Shield, 
  HelpCircle, 
  Info, 
  LogOut,
  ChevronRight,
  Activity,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ProfilePhotoService, ProfilePhotoConfig } from '../services/ProfilePhotoService';
import ModernDialog from '../components/common/ModernDialog';
import { useDialog } from '../hooks/useDialog';
import Header from '../components/common/Header';

// MenuItem Component
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  titleStyle?: object;
  onPress: () => void;
}

const MenuItem = memo(({ icon, title, subtitle, titleStyle, onPress }: MenuItemProps) => (
  <TouchableOpacity 
    style={styles.menuItem} 
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuItemTitle, titleStyle]}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <ChevronRight size={20} color="#94a3b8" strokeWidth={2} />
  </TouchableOpacity>
));

// MenuDivider Component
const MenuDivider = memo(() => (
  <View style={styles.menuDivider} />
));

const ProfileScreen = memo(() => {
  const { user, logout } = useAuth();
  const { userProfile, updateProfileImage } = useUserProfile();
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const availablePhotos = ProfilePhotoService.getAvailablePhotos();
  const navigation = useNavigation<any>();
  const { visible, dialogOptions, hideDialog, showSuccess, showError, showConfirm } = useDialog();

  const handlePhotoSelect = useCallback((photo: ProfilePhotoConfig) => {
    updateProfileImage(photo.uri);
    setIsPhotoModalVisible(false);
    showSuccess('Success', 'Profile photo updated successfully!');
  }, [updateProfileImage, showSuccess]);

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
      showSuccess('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Camera error:', error);
        showError('Error', 'Failed to take photo. Please try again.');
      }
    }
  }, [updateProfileImage, showSuccess, showError]);

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
      showSuccess('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Gallery error:', error);
        showError('Error', 'Failed to select photo. Please try again.');
      }
    }
  }, [updateProfileImage, showSuccess, showError]);

  const handlePhotoPress = useCallback(() => {
    // Show modal with camera and gallery options
    setIsPhotoModalVisible(true);
  }, []);

  const handleLogout = useCallback(() => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      () => {
        console.log('Logging out...');
        logout();
        console.log('Logout complete, AppNavigator will handle navigation');
        setTimeout(() => {
          console.log('Logout state should be updated by now');
        }, 100);
      },
      undefined,
      'LOGOUT',
      'CANCEL'
    );
  }, [logout, showConfirm]);

  return (
    <View style={styles.container}>
      {/* Use Common Header Component */}
      <Header />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Profile Card - Centered Large Avatar */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoPress} activeOpacity={0.8}>
            <Image 
              source={typeof userProfile.profileImage === 'string' ? { uri: userProfile.profileImage } : userProfile.profileImage}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.cameraIconContainer}>
              <Camera size={20} color="#fff" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userProfile.fullName}</Text>
          <View style={styles.patientIdContainer}>
            <Text style={styles.patientIdLabel}>Patient ID: </Text>
            <Text style={styles.patientId}>{userProfile.patientId}</Text>
          </View>
          <Text style={styles.editHint}>Tap photo to change</Text>
        </View>

        {/* ABDM Integration Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>HEALTH RECORDS</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Activity size={24} color="#8b5cf6" strokeWidth={2} />}
              title="Ayushman Bharat Digital Mission"
              subtitle="Link your ABHA ID"
              onPress={() => navigation.navigate('ABDMIntegration')}
            />
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<User size={24} color="#5a9e31" strokeWidth={2} />}
              title="Personal Information"
              onPress={() => navigation.navigate('PersonalInfo')}
            />
            <MenuItem
              icon={<Users size={24} color="#3b82f6" strokeWidth={2} />}
              title="Family Members"
              onPress={() => navigation.navigate('FamilyMembers')}
            />
            <MenuItem
              icon={<Heart size={24} color="#ef4444" strokeWidth={2} />}
              title="Insurance Info"
              onPress={() => navigation.navigate('InsuranceInfo')}
            />
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>APP PREFERENCES</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Settings size={24} color="#8b5cf6" strokeWidth={2} />}
              title="App Settings"
              onPress={() => navigation.navigate('AppSettings')}
            />
            <MenuItem
              icon={<Globe size={24} color="#06b6d4" strokeWidth={2} />}
              title="Language"
              onPress={() => navigation.navigate('Language')}
            />
            <MenuItem
              icon={<Shield size={24} color="#f59e0b" strokeWidth={2} />}
              title="Privacy & Security"
              onPress={() => navigation.navigate('PrivacySecurity')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<HelpCircle size={24} color="#64748b" strokeWidth={2} />}
              title="Help & Support"
              onPress={() => navigation.navigate('HelpSupport')}
            />
            <MenuItem
              icon={<Info size={24} color="#64748b" strokeWidth={2} />}
              title="About SehatConnect"
              onPress={() => navigation.navigate('AboutApp')}
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<LogOut size={24} color="#ef4444" strokeWidth={2} />}
              title="Logout"
              titleStyle={styles.logoutText}
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
                <View style={[styles.materialIconContainer, styles.cameraIconBg]}>
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
                <View style={[styles.materialIconContainer, styles.galleryIconBg]}>
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

      {/* Modern Dialog */}
      <ModernDialog
        visible={visible}
        title={dialogOptions.title}
        message={dialogOptions.message}
        type={dialogOptions.type}
        buttons={dialogOptions.buttons}
        onClose={hideDialog}
        showCloseButton={dialogOptions.showCloseButton}
      />
    </View>
  );
});

export default ProfileScreen;

const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Profile Card - Material Design
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Avatar - Large Centered
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f1f5f9',
    borderWidth: 4,
    borderColor: '#f0f0f0',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5a9e31',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  // Profile Info
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  patientIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  patientIdLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976d2',
  },
  patientId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976d2',
  },
  editHint: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Section
  sectionContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },

  // Menu Card - Clean Material Design
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 64,
    backgroundColor: '#fff',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: -0.2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#757575',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 76,
  },

  // Logout Text
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },

  // Version Text
  versionText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },

  // Modal Styles - Material Design
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '88%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },
  modalHeader: {
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  materialOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 56,
  },
  materialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cameraIconBg: {
    backgroundColor: 'rgba(90, 158, 49, 0.12)',
  },
  galleryIconBg: {
    backgroundColor: 'rgba(90, 158, 49, 0.12)',
  },
  materialOptionText: {
    flex: 1,
  },
  materialOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  materialOptionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
    lineHeight: 18,
  },
  materialDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 64,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    minHeight: 56,
  },
  materialCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  materialCancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5a9e31',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
