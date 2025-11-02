import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Header from '../../components/common/Header';
import { useI18n } from '../../i18n';

export default function LanguageScreen() {
  const { currentLanguage, changeLanguage } = useI18n();

  const languageNames: Record<'en' | 'hi' | 'pa', string> = {
    en: 'English',
    hi: 'Hindi',
    pa: 'Punjabi',
  };

  const handleChange = (lang: 'en' | 'hi' | 'pa') => {
    try {
      changeLanguage(lang);
      Alert.alert('Language changed', `Language changed to ${languageNames[lang]}`);
    } catch (e) {
      console.warn('Language change failed', e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Language</Text>

        <TouchableOpacity style={styles.row} onPress={() => handleChange('en')}>
          <Text style={styles.rowText}>English {currentLanguage === 'en' ? '✓' : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handleChange('hi')}>
          <Text style={styles.rowText}>Hindi {currentLanguage === 'hi' ? '✓' : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handleChange('pa')}>
          <Text style={styles.rowText}>Punjabi {currentLanguage === 'pa' ? '✓' : ''}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowText: { fontSize: 16, color: '#111827' },
});
