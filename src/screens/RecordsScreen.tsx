import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';

const Category = ({ title, icon, children }: any) => (
  <View style={styles.category}>
    <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.catHeader}>
      <Text style={styles.catTitle}>{title}</Text>
      <Text style={styles.catIcon}>{icon}</Text>
    </LinearGradient>
    <View style={{ padding: 15 }}>
      {children}
    </View>
  </View>
);

const Row = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <View style={styles.row}>
    <Text style={styles.rowLeft}>{left}</Text>
    <Text style={styles.rowRight}>{right}</Text>
  </View>
);

export default function RecordsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Category title="Medical History" icon="📋">
          <Row left="Hypertension" right="Ongoing" />
          <Row left="Diabetes Type 2" right="Controlled" />
        </Category>

        <Category title="Prescriptions" icon="💊">
          <View style={styles.row}>
            <View>
              <Text style={{ fontWeight: '600', color: '#333' }}>Amlodipine 5mg</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Once daily, morning</Text>
            </View>
            <Text style={{ color: '#4CAF50' }}>Active</Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={{ fontWeight: '600', color: '#333' }}>Metformin 500mg</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Twice daily, with meals</Text>
            </View>
            <Text style={{ color: '#4CAF50' }}>Active</Text>
          </View>
        </Category>

        <Category title="Lab Reports" icon="🧪">
          <Row left="Blood Sugar Test" right="Dec 10, 2024" />
          <Row left="Lipid Profile" right="Nov 25, 2024" />
        </Category>

        <View style={styles.offlineCard}>
          <Text style={styles.offlineTitle}>📱 Offline Available</Text>
          <Text style={styles.offlineText}>All your health records are stored offline and sync when connected.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  category: {
    backgroundColor: '#fff', borderRadius: 15, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3, overflow: 'hidden',
  },
  catHeader: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  catIcon: { color: '#fff', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowLeft: { color: '#333' },
  rowRight: { color: '#666', fontSize: 12 },
  offlineCard: { backgroundColor: '#e8f5e8', padding: 15, borderRadius: 10, marginTop: 20 },
  offlineTitle: { color: '#2e7d32', fontWeight: '700', marginBottom: 5 },
  offlineText: { color: '#666', fontSize: 12 },
});
