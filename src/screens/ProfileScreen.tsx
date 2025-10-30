import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import LinearGradient from 'react-native-linear-gradient'; // Commented out as unused
import Header from '../components/common/Header';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ProfilePhotoService, ProfilePhotoConfig } from '../services/ProfilePhotoService';

export default function ProfileScreen() {
  const { userProfile, updateProfileImage } = useUserProfile();
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const availablePhotos = ProfilePhotoService.getAvailablePhotos();
  // navigation is a stack navigator inside the Profile tab; typing here is kept permissive to allow
  // navigation to stack screens added in ProfileStackNavigator (PersonalInfo, Language, etc.).
  // Narrow typing can be added if a shared ParamList is declared.
  const navigation = useNavigation<any>();

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
        'Please add a photo to src/assets/images/profile-photos/rajinder_singh.jpg',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoPress}>
            <Image 
              source={{ uri: userProfile.profileImage }}
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
                    source={{ uri: photo.uri }} 
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
  profileHeader: {
    backgroundColor: '#fff', borderRadius: 15, padding: 25, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  avatarContainer: {
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#5a9e31',
  },
  avatar: { 
    width: 94, 
    height: 94, 
    borderRadius: 47,
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
    borderWidth: 2,
    borderColor: '#fff',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
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
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  photoDimensions: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
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
});
