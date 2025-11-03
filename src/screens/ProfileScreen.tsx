import React, { useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert, Platform, Pressable } from 'react-native';
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
  ChevronRight 
} from 'lucide-react-native';
// import LinearGradient from 'react-native-linear-gradient'; // Commented out as unused
import Header from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ProfilePhotoService, ProfilePhotoConfig } from '../services/ProfilePhotoService';
import { safeAlert } from '../utils/safeAlert';

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
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoPress} activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={typeof userProfile.profileImage === 'string' ? { uri: userProfile.profileImage } : userProfile.profileImage}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.cameraIconContainer}>
              <Camera size={18} color="#fff" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userProfile.fullName}</Text>
          <View style={styles.patientIdContainer}>
            <Text style={styles.patientIdLabel}>Patient ID: </Text>
            <Text style={styles.patientId}>{userProfile.patientId}</Text>
          </View>
          <Text style={styles.editHint}>Tap photo to change</Text>
        </View>

        {/* Account Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<User size={22} color="#5a9e31" strokeWidth={2} />}
              title="Personal Information"
              onPress={() => navigation.navigate('PersonalInfo')}
            />
            <MenuDivider />
            <MenuItem
              icon={<Users size={22} color="#3b82f6" strokeWidth={2} />}
              title="Family Members"
              onPress={() => navigation.navigate('FamilyMembers')}
            />
            <MenuDivider />
            <MenuItem
              icon={<Heart size={22} color="#ef4444" strokeWidth={2} />}
              title="Insurance Info"
              onPress={() => navigation.navigate('InsuranceInfo')}
            />
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Settings size={22} color="#8b5cf6" strokeWidth={2} />}
              title="App Settings"
              onPress={() => navigation.navigate('AppSettings')}
            />
            <MenuDivider />
            <MenuItem
              icon={<Globe size={22} color="#06b6d4" strokeWidth={2} />}
              title="Language"
              subtitle="English"
              onPress={() => navigation.navigate('Language')}
            />
            <MenuDivider />
            <MenuItem
              icon={<Shield size={22} color="#f59e0b" strokeWidth={2} />}
              title="Privacy & Security"
              onPress={() => navigation.navigate('PrivacySecurity')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<HelpCircle size={22} color="#64748b" strokeWidth={2} />}
              title="Help & Support"
              onPress={() => {}}
            />
            <MenuDivider />
            <MenuItem
              icon={<Info size={22} color="#64748b" strokeWidth={2} />}
              title="About SehatConnect"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<LogOut size={22} color="#ef4444" strokeWidth={2} />}
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
    padding: 20,
    paddingBottom: 40,
  },

  // Profile Card - Modern Material Design
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  // Avatar - Elevated with gradient border effect
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    backgroundColor: 'linear-gradient(135deg, #5a9e31 0%, #4a8028 100%)',
    shadowColor: '#5a9e31',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#f1f5f9',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5a9e31',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Profile Info
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  patientIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  patientIdLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  patientId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  editHint: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Section
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },

  // Menu Card - Material Design
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 64,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748b',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 76, // 20 padding + 40 icon + 16 margin
  },

  // Logout Text
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },

  // Version Text
  versionText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
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
