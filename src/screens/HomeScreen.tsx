import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import { useI18n } from '../i18n';

const DoctorCard = ({ name, specialty, rating, price, image }: { name: string; specialty: string; rating: number; price: string; image: string }) => (
  <TouchableOpacity style={styles.doctorCard} activeOpacity={0.8}>
    <View style={styles.doctorImageContainer}>
      <Text style={styles.doctorImage}>{image}</Text>
    </View>
    <Text style={styles.doctorName}>{name}</Text>
    <Text style={styles.doctorSpecialty}>{specialty}</Text>
    <View style={styles.doctorRating}>
      <Text style={styles.ratingStar}>⭐</Text>
      <Text style={styles.ratingText}>{rating}</Text>
    </View>
    <Text style={styles.doctorPrice}>{price}</Text>
  </TouchableOpacity>
);

const QuickAction = ({ icon, title }: { icon: string; title: string }) => (
  <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
    <LinearGradient 
      colors={['#5a9e31', '#E8F5E8']} 
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.actionsRow}>
          <QuickAction icon="📹" title={t('videoConsult')} />
          <QuickAction icon="⚡" title={t('emergency')} />
          <QuickAction icon="🤖" title={t('aiChecker')} />
          <QuickAction icon="📅" title={t('schedule')} />
        </View>

        <Text style={styles.sectionTitle}>{t('healthSummary')}</Text>
        <View style={styles.card}>
          {[
            { label: 'Blood Pressure', value: '120/80', status: 'normal' },
            { label: 'Next Appointment', value: 'Tomorrow 2:00 PM', status: 'upcoming' },
            { label: 'Medicines Due', value: '2 pending', status: 'warning' },
          ].map((m, i, arr) => (
            <View key={m.label} style={[styles.metricRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <View style={[styles.statusDot, { backgroundColor: m.status === 'normal' ? '#5a9e31' : m.status === 'warning' ? '#f59e0b' : '#3b82f6' }]} />
              </View>
              <Text style={styles.metricValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsScroll}>
          <DoctorCard name="Dr. William James" specialty="Cardiologist" rating={4.8} price="$50/session" image="👨‍⚕️" />
          <DoctorCard name="Dr. Sarah Johnson" specialty="Neurologist" rating={4.9} price="$60/session" image="👩‍⚕️" />
          <DoctorCard name="Dr. Michael Chen" specialty="Dermatologist" rating={4.7} price="$45/session" image="👨‍⚕️" />
        </ScrollView>

        <Text style={styles.sectionTitle}>Nearby Services</Text>
        <View style={styles.serviceCard}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>Dr. Sharma Available</Text>
            <Text style={styles.serviceSubtitle}>General Medicine • 2.5 km</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ 4.8</Text>
              <Text style={styles.ratingText}>• 15 min away</Text>
            </View>
          </View>
          <View style={styles.serviceStatus}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>Available</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actionCard: { 
    width: 80, 
    alignItems: 'center' 
  },
  outerCircle: {
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12,
    shadowColor: '#5a9e31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  innerCircle: {
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  iconText: { 
    fontSize: 20, 
    color: '#1f2937' 
  },
  actionTitle: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#374151', 
    textAlign: 'center',
    lineHeight: 14,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 20,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 16, 
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: { 
    fontSize: 14, 
    color: '#374151',
    fontWeight: '600',
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricValue: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827' 
  },
  serviceCard: {
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 16, 
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 4,
  },
  serviceSubtitle: { 
    fontSize: 14, 
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  serviceStatus: {
    alignItems: 'center',
  },
  availableDot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#5a9e31',
    marginBottom: 4,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a9e31',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9e31',
  },
  doctorsScroll: {
    marginBottom: 24,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  doctorImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doctorImage: {
    fontSize: 28,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  doctorPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5a9e31',
  },
});
