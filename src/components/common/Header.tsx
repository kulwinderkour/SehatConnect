import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, Animated, Image } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useI18n, getLanguageDisplayName } from '../../i18n';
import { useNavigation } from '@react-navigation/native';
import { useUserProfile } from '../../contexts/UserProfileContext';

// Custom header component with original design patterns
export default function Header() {
  const { currentLanguage, changeLanguage, getText } = useI18n();
  const navigation = useNavigation();
  const { userProfile } = useUserProfile();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Custom language display name
  const currentLanguageName = useMemo(() => 
    getLanguageDisplayName(currentLanguage, currentLanguage), 
    [currentLanguage]
  );

  // Custom modal animation handlers
  const showLanguageModal = useCallback(() => {
    setIsLanguageModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const hideLanguageModal = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLanguageModalVisible(false);
    });
  }, [fadeAnim]);

  // Custom language selection handler
  const handleLanguageSelect = useCallback((lang: 'en' | 'hi' | 'pa') => {
    changeLanguage(lang);
    hideLanguageModal();
  }, [changeLanguage, hideLanguageModal]);

  // Custom profile navigation handler
  const handleProfilePress = useCallback(() => {
    try {
      navigation.navigate('Profile' as never);
    } catch (error) {
      console.warn('Navigation to Profile failed:', error);
    }
  }, [navigation]);

  // Custom back button handler with safety check
  const handleBackPress = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.warn('Navigation goBack failed:', error);
    }
  }, [navigation]);

  return (
    <>
      {/* Back button when nested and can go back */}
      {navigation.canGoBack && navigation.canGoBack() && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ position: 'absolute', left: 8, top: 12, zIndex: 30, padding: 8 }}
        >
          <Text style={{ color: '#333', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
      )}
      
      {/* Modern header section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          {/* Left side - Avatar and user info */}
          <View style={styles.leftSection}>
            <TouchableOpacity 
              style={styles.profilePhotoContainer}
              onPress={handleProfilePress}
              activeOpacity={0.6}
            >
              <Image 
                source={typeof userProfile.profileImage === 'string' ? { uri: userProfile.profileImage } : userProfile.profileImage}
                style={styles.profilePhoto}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userGreeting}>Hi, {userProfile.shortName}</Text>
              <View style={styles.patientBadge}>
                <Text style={styles.patientIdText}>Patient ID: {userProfile.patientId}</Text>
              </View>
            </View>
          </View>

          {/* Right side - Language selector and Bell icon */}
          <View style={styles.rightSection}>
            <Pressable 
              style={styles.languageSelector}
              onPress={showLanguageModal}
              android_ripple={{ color: 'rgba(90, 158, 49, 0.1)' }}
            >
              <Text style={styles.languageText}>{currentLanguageName} ▾</Text>
            </Pressable>
            <TouchableOpacity 
              style={styles.notificationButton}
              activeOpacity={0.6}
            >
              <Bell size={22} color="#f59e0b" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Language selection modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={hideLanguageModal}
      >
        <Animated.View 
          style={[styles.modalOverlay, { opacity: fadeAnim }]}
        >
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={hideLanguageModal}
          >
            <View style={styles.modalContent}>
              {(['en', 'hi', 'pa'] as const).map((lang) => (
                <Pressable
                  key={lang}
                  style={[
                    styles.languageOption,
                    currentLanguage === lang && styles.languageOptionActive
                  ]}
                  onPress={() => handleLanguageSelect(lang)}
                  android_ripple={{ color: '#f0f0f0' }}
                >
                  <Text style={[
                    styles.languageOptionText,
                    currentLanguage === lang && styles.languageOptionTextActive
                  ]}>
                    {getLanguageDisplayName(lang, currentLanguage)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}

// Custom styles with modern white design
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePhotoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    marginLeft: 0,
  },
  profilePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e2e8f0',
  },
  userInfoContainer: {
    flex: 1,
  },
  userGreeting: {
    color: '#1e293b',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  patientBadge: {
    marginTop: 4,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  patientIdText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  languageSelector: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginRight: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    minWidth: 220,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  languageOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  languageOptionActive: {
    backgroundColor: '#f8f9fa',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  languageOptionTextActive: {
    color: '#5a9e31',
    fontWeight: '600',
  },
});