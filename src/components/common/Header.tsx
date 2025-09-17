import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useI18n, getLanguageName } from '../../i18n';

export default function Header() {
  const { language, setLanguage, t } = useI18n();
  const languageLabel = useMemo(() => getLanguageName(language, language), [language]);
  const [open, setOpen] = useState(false);
  
  // User profile data - should be synced with ProfileScreen
  const userName = "Rajinder Singh";
  const patientId = "SH001234";
  const shortName = userName.split(' ')[0]; // "Rajinder"
  
  return (
    <>
      <LinearGradient colors={['#5a9e31', '#4a8a2a']} style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{t('appName')}</Text>
          <Pressable style={styles.langPill} onPress={() => setOpen(true)}>
            <Text style={styles.langText}>{languageLabel} ▾</Text>
          </Pressable>
        </View>
        
        <View style={styles.bottomRow}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{t('hello')} {shortName},</Text>
            <Text style={styles.subGreeting}>{t('howAreYouToday')}</Text>
            <Text style={styles.patientId}>{t('patientId')}: {patientId}</Text>
          </View>
          <View style={styles.iconsContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {(['en','hi','pa'] as const).map(l => (
              <Pressable key={l} style={styles.option} onPress={() => { setLanguage(l); setOpen(false); }}>
                <Text style={styles.optionText}>{getLanguageName(l, l)}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { 
    paddingHorizontal: 16, 
    paddingTop: 11,
    paddingBottom: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  subGreeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
    lineHeight: 18,
  },
  patientId: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
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
  icon: {
    fontSize: 18,
    color: '#fff',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  langPill: { 
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
  langText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  backdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sheet: { 
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
  option: { 
    paddingVertical: 16, 
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: { 
    fontSize: 16, 
    color: '#1f2937',
    fontWeight: '500',
  },
});
