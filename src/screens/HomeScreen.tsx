import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import { useI18n } from '../i18n';

const QuickAction = ({ icon, title }: { icon: string; title: string }) => (
  <TouchableOpacity style={styles.actionCard} activeOpacity={0.85}>
    <LinearGradient 
      colors={['#4CAF50', '#E8F5E8']} 
      style={styles.outerCircle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.innerCircle}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
    </LinearGradient>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.actionsRow}>
          <QuickAction icon="📹" title={t('videoConsult')} />
          <QuickAction icon="⚡" title={t('emergency')} />
          <QuickAction icon="🤖" title={t('aiChecker')} />
          <QuickAction icon="📅" title={t('schedule')} />
        </View>

        <Text style={styles.sectionTitle}>{t('healthSummary')}</Text>
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
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, marginBottom: 25 },
  actionCard: { width: 76, alignItems: 'center' },
  outerCircle: {
    width: 56, height: 56, borderRadius: 28, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  innerCircle: {
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 22, color: '#0F172A' },
  actionTitle: { fontSize: 11, fontWeight: '500', color: '#333', textAlign: 'center' },
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
