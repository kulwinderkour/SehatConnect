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
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
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
  header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  langPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
  langText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  sheet: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, minWidth: 200, overflow: 'hidden' },
  option: { paddingVertical: 12, paddingHorizontal: 16 },
  optionText: { fontSize: 14, color: '#111827' },
});
