import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';

const QuickAction = ({ icon, title }: { icon: string; title: string }) => (
  <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
    <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.actionIcon}>
      <Text style={{ color: '#fff', fontSize: 18 }}>{icon}</Text>
    </LinearGradient>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.quickGrid}>
          <QuickAction icon="📹" title="Video Consult" />
          <QuickAction icon="⚡" title="Emergency" />
          <QuickAction icon="🤖" title="AI Checker" />
          <QuickAction icon="📅" title="Schedule" />
        </View>

        <Text style={styles.sectionTitle}>Health Summary</Text>
        <View style={styles.card}>
          {[
            { label: 'Blood Pressure', value: '120/80' },
            { label: 'Next Appointment', value: 'Tomorrow 2:00 PM' },
            { label: 'Medicines Due', value: '2 pending' },
          ].map((m, i, arr) => (
            <View key={m.label} style={[styles.metricRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Nearby Services</Text>
        <View style={styles.serviceCard}>
          <View>
            <Text style={{ fontWeight: '600', fontSize: 14, color: '#333' }}>Dr. Sharma Available</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>General Medicine • 2.5 km</Text>
          </View>
          <View style={styles.dot} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  actionCard: {
    width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  metricLabel: { fontSize: 14, color: '#666' },
  metricValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  serviceCard: {
    backgroundColor: '#fff', borderRadius: 15, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50' },
});
