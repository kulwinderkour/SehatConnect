import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';

const DoctorCard = ({ emoji, name, specialty, rating }: any) => (
  <View style={styles.docCard}>
    <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.docAvatar}>
      <Text style={{ fontSize: 24, color: '#fff' }}>{emoji}</Text>
    </LinearGradient>
    <View style={{ flex: 1 }}>
      <Text style={styles.docName}>{name}</Text>
      <Text style={styles.docSpec}>{specialty}</Text>
      <Text style={styles.docRate}>{rating}</Text>
    </View>
    <TouchableOpacity style={styles.consultBtn} activeOpacity={0.9}>
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Consult</Text>
    </TouchableOpacity>
  </View>
);

export default function ConsultationsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Available Doctors</Text>

        <DoctorCard emoji="👨‍⚕️" name="Dr. Rajesh Sharma" specialty="General Medicine" rating="⭐⭐⭐⭐⭐ 4.8 (127 reviews)" />
        <DoctorCard emoji="👩‍⚕️" name="Dr. Priya Kaur" specialty="Pediatrics" rating="⭐⭐⭐⭐⭐ 4.9 (89 reviews)" />
        <DoctorCard emoji="👨‍⚕️" name="Dr. Amit Singh" specialty="Cardiology" rating="⭐⭐⭐⭐⭐ 4.7 (156 reviews)" />

        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>My Appointments</Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={{ fontWeight: '600', color: '#333' }}>Dr. Sharma - Follow up</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Tomorrow 2:00 PM</Text>
          </View>
          <View style={styles.badge}><Text style={styles.badgeText}>Confirmed</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },
  docCard: {
    backgroundColor: '#fff', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  docAvatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  docName: { fontSize: 16, fontWeight: '600', color: '#333' },
  docSpec: { fontSize: 12, color: '#666', marginTop: 4 },
  docRate: { fontSize: 12, color: '#ff9800', marginTop: 4 },
  consultBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  cardRow: {
    backgroundColor: '#fff', borderRadius: 15, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  badge: { backgroundColor: '#e8f5e8', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 },
  badgeText: { color: '#2e7d32', fontSize: 12, fontWeight: '700' },
});
