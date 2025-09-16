import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useI18n, getLanguageName } from '../../i18n';

export default function Header() {
  const { language, cycleLanguage } = useI18n();
  const languageLabel = useMemo(() => getLanguageName(language, language), [language]);
  return (
    <>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <Text style={styles.title}>SehatConnect</Text>
        <View style={styles.langPill} onTouchEnd={cycleLanguage}>
          <Text style={styles.langText}>{languageLabel} ▾</Text>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  langPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
  langText: { color: '#fff', fontSize: 12, fontWeight: '500' },
});
