import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Header from '../../components/common/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { ProfilePhotoService, ProfilePhotoConfig } from '../../services/ProfilePhotoService';
import { reset } from '../../services/NavigationService';

export default function DoctorProfileScreen() {
  const { user, logout } = useAuth();
  const { userProfile, updateProfileImage } = useUserProfile();
  const navigation = useNavigation();
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const availablePhotos = ProfilePhotoService.getAvailablePhotos();

  const handlePhotoSelect = (photo: ProfilePhotoConfig) => {
    updateProfileImage(photo.uri);
    setIsPhotoModalVisible(false);
    Alert.alert('Success', 'Profile photo updated successfully!');
  };

  const handlePhotoPress = () => {
    // Automatically select the uploaded photo
    if (availablePhotos.length > 0) {
      handlePhotoSelect(availablePhotos[0]);
    } else {
      Alert.alert(
        'No Photos Available',
        'Please add a photo to src/assets/images/profile-photos/',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleMenuPress = (menuItem: string) => {
    if (menuItem === 'Logout') {
      handleLogout();
    } else {
      Alert.alert(menuItem, 'This feature will be available soon!');
    }
  };

  const handleLogout = () => {
    Alert.alert(
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
            logout();
            // Navigate to Login screen using navigation service
            reset('Login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Doctor Profile Header */}
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
          <Text style={styles.name}>Dr. {user?.fullName || userProfile.fullName}</Text>
          <Text style={styles.specialty}>{user?.specialty || 'General Medicine'}</Text>
          <Text style={styles.hospital}>{user?.hospital || 'SehatConnect Hospital'}</Text>
          <Text style={styles.doctorId}>Doctor ID: {user?.patientId || 'DOC001'}</Text>
          <Text style={styles.editHint}>Tap photo to change</Text>
        </View>

        {/* Professional Information */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Medical License')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>📋</Text>
              <Text style={styles.menuText}>Medical License</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Specialization')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>🎓</Text>
              <Text style={styles.menuText}>Specialization & Qualifications</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Experience')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>💼</Text>
              <Text style={styles.menuText}>Work Experience</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Availability')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>⏰</Text>
              <Text style={styles.menuText}>Availability Schedule</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Personal Information')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Personal Information</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Contact Details')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>📞</Text>
              <Text style={styles.menuText}>Contact Details</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Banking Information')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>🏦</Text>
              <Text style={styles.menuText}>Banking Information</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Notification Settings')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>Notification Settings</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Privacy & Security')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>🔒</Text>
              <Text style={styles.menuText}>Privacy & Security</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Language')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>🌐</Text>
              <Text style={styles.menuText}>Language: English</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support & Help */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support & Help</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Help & Support')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('About SehatConnect')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>ℹ️</Text>
              <Text style={styles.menuText}>About SehatConnect</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('Logout')}
          >
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Selection Modal */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Profile Photo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {availablePhotos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoOption}
                  onPress={() => handlePhotoSelect(photo)}
                >
                  <Image 
                    source={typeof photo.uri === 'string' ? { uri: photo.uri } : photo.uri} 
                    style={styles.photoPreview} 
                    resizeMode="contain" 
                  />
                  <Text style={styles.photoName}>{photo.name}</Text>
                  <Text style={styles.photoDimensions}>
                    {photo.dimensions.width}x{photo.dimensions.height}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#2563eb',
    position: 'relative',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  editIcon: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
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
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  specialty: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  hospital: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorId: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
    textAlign: 'center',
  },
  editHint: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutText: {
    color: '#ef4444',
  },
  menuArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  photoScroll: {
    marginBottom: 20,
  },
  photoOption: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  photoName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  photoDimensions: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
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
});
