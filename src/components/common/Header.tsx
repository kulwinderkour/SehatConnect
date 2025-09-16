import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useI18n, getLanguageName } from '../../i18n';

export default function Header() {
  const { language, cycleLanguage } = useI18n();
  const languageLabel = useMemo(() => getLanguageName(language, language), [language]);
  const { setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <LinearGradient colors={['#5a9e31', '#4a8a2a']} style={styles.header}>
        <Text style={styles.title}>SehatConnect</Text>
        <View style={styles.langPill} onTouchEnd={() => setOpen(true)}>
          <Text style={styles.langText}>{languageLabel} ▾</Text>
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
    paddingHorizontal: 24, 
    paddingVertical: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  langPill: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  langText: { 
    color: '#fff', 
    fontSize: 14, 
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
