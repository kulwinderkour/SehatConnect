import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useI18n, getLanguageDisplayName } from '../../i18n';

// Custom header component with original design patterns
export default function Header() {
  const { currentLanguage, changeLanguage, getText } = useI18n();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Custom user data management
  const userProfile = useMemo(() => ({
    fullName: "Rajinder Singh",
    patientId: "SH001234",
    shortName: "Rajinder"
  }), []);

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

  // Custom gradient configuration
  const gradientConfig = {
    colors: ['#5a9e31', '#4a8a2a'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  };

  return (
    <>
      {/* First header section - App title */}
      <LinearGradient 
        colors={gradientConfig.colors} 
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={styles.firstHeaderContainer}
      >
        <View style={styles.topSection}>
          <Text style={styles.appTitle}>{getText('appTitle')}</Text>
          <View style={styles.topRightContainer}>
            <Pressable 
              style={styles.languageSelector}
              onPress={showLanguageModal}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            >
              <Text style={styles.languageText}>{currentLanguageName} ▾</Text>
            </Pressable>
            <TouchableOpacity 
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Second header section - User greeting */}
      <LinearGradient 
        colors={gradientConfig.colors} 
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={styles.secondHeaderContainer}
      >
        <View style={styles.bottomSection}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userGreeting}>
              {getText('greetingHello')} {userProfile.shortName},
            </Text>
            <View style={styles.patientIdContainer}>
              <Text style={styles.patientIdText}>
                {getText('userPatientId')}: {userProfile.patientId}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

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

// Custom styles with original design patterns
const styles = StyleSheet.create({
  firstHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  languageSelector: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  userInfoContainer: {
    flex: 1,
    paddingRight: 12,
  },
  userGreeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  userSubGreeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
    lineHeight: 18,
  },
  patientIdContainer: {
    alignSelf: 'flex-start',
    marginLeft: -4,
  },
  patientIdText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 18,
    color: '#fff',
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