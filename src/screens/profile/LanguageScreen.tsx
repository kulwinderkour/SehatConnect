import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { ArrowLeft, Globe, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../../i18n';
import ModernDialog from '../../components/common/ModernDialog';
import { useDialog } from '../../hooks/useDialog';

export default function LanguageScreen() {
  const navigation = useNavigation();
  const { currentLanguage, changeLanguage } = useI18n();
  const { visible, dialogOptions, hideDialog, showSuccess } = useDialog();

  const languages = [
    { code: 'en' as const, name: 'English', native: 'English' },
    { code: 'hi' as const, name: 'Hindi', native: 'हिंदी' },
    { code: 'pa' as const, name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ];

  const handleChange = (lang: 'en' | 'hi' | 'pa', langName: string) => {
    try {
      changeLanguage(lang);
      showSuccess('Language Changed', `Language changed to ${langName}`);
    } catch (e) {
      console.warn('Language change failed', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Globe size={20} color="#1976d2" strokeWidth={2} />
          <Text style={styles.infoBannerText}>
            Choose your preferred language for the app
          </Text>
        </View>

        {/* Language List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT LANGUAGE</Text>
          <View style={styles.card}>
            {languages.map((lang, index) => (
              <React.Fragment key={lang.code}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.languageItem}
                  onPress={() => handleChange(lang.code, lang.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.languageNative}>{lang.native}</Text>
                  </View>
                  {currentLanguage === lang.code && (
                    <View style={styles.checkContainer}>
                      <Check size={24} color="#5a9e31" strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            The app will restart to apply the language changes across all screens.
          </Text>
        </View>
      </ScrollView>

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 72,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 16,
    color: '#666',
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  noteCard: {
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffd666',
  },
  noteText: {
    fontSize: 13,
    color: '#8c6900',
    lineHeight: 18,
  },
});
