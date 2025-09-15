import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function Header() {
  return (
    <>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.statusBar}>
        <Text style={styles.status}>9:41 AM</Text>
        <Text style={styles.status}>📶 🔋 88%</Text>
      </LinearGradient>

      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.header}>
        <Text style={styles.title}>SehatConnect</Text>
        <View style={styles.langPill}>
          <Text style={styles.langText}>English ▾</Text>
        </View>
      </LinearGradient>

      {Platform.OS !== 'android' && <View style={styles.notch} />}
    </>
  );
}

const styles = StyleSheet.create({
  statusBar: { height: 44, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { color: '#fff', fontSize: 14, fontWeight: '500' },
  header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  langPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
  langText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  notch: { position: 'absolute', top: 0, left: '50%', marginLeft: -75, width: 150, height: 30, backgroundColor: '#000', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, zIndex: 10 },
});
