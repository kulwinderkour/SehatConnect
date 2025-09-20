import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import DoctorList from '../components/consultations/DoctorList';
import ScheduleModal from '../components/home/ScheduleModal';
import { useI18n } from '../i18n';
import { useAppointments } from '../contexts/AppointmentContext';
import { Doctor, AppointmentBookingForm } from '../types/health';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');

// Custom doctor card component with original design
const MedicalProfessionalCard = ({ 
  name, 
  specialty, 
  rating, 
  price, 
  image 
}: { 
  name: string; 
  specialty: string; 
  rating: number; 
  price: string; 
  image: string; 
}) => (
  <TouchableOpacity style={styles.professionalCard} activeOpacity={0.8}>
    <View style={styles.professionalImageContainer}>
      <Text style={styles.professionalImage}>{image}</Text>
    </View>
    <Text style={styles.professionalName}>{name}</Text>
    <Text style={styles.professionalSpecialty}>{specialty}</Text>
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingIcon}>⭐</Text>
      <Text style={styles.ratingValue}>{rating}</Text>
    </View>
    <Text style={styles.professionalPrice}>{price}</Text>
  </TouchableOpacity>
);

// Custom quick action component with original design
const QuickActionButton = ({ 
  icon, 
  title,
  subtitle,
  color,
  onPress
}: { 
  icon: string; 
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.actionGridCard, { borderLeftColor: color }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.actionGridHeader}>
      <Text style={styles.actionGridIcon}>{icon}</Text>
      <Text style={styles.actionGridValue}>{title.split(' ')[0]}</Text>
    </View>
    <Text style={styles.actionGridLabel}>{title}</Text>
    <Text style={styles.actionGridSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// Modern health metric card component (like doctor dashboard)
const HealthMetricCard = ({ 
  label, 
  value, 
  status,
  icon,
  color
}: { 
  label: string; 
  value: string; 
  status: 'normal' | 'warning' | 'upcoming'; 
  icon: string;
  color: string;
}) => {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricSubtitle}>
        {status === 'normal' ? 'Normal' : status === 'warning' ? 'Needs attention' : 'Upcoming'}
      </Text>
    </View>
  );
};

// Main home screen component
export default function HomeScreen() {
  const { getText } = useI18n();
  const { addAppointment } = useAppointments();
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();

  // Modern health metrics with grid layout
  const healthMetrics = useMemo(() => [
    { 
      label: getText('healthBloodPressure'), 
      value: '120/80', 
      status: 'normal' as const,
      icon: '🩸',
      color: '#10b981'
    },
    { 
      label: getText('healthNextAppointment'), 
      value: 'Tomorrow 2:00 PM', 
      status: 'upcoming' as const,
      icon: '📅',
      color: '#3b82f6'
    },
    { 
      label: getText('healthMedicinesDue'), 
      value: '2 Pending', 
      status: 'warning' as const,
      icon: '💊',
      color: '#f59e0b'
    },
    { 
      label: 'Last Checkup', 
      value: '2 weeks ago', 
      status: 'normal' as const,
      icon: '🏥',
      color: '#8b5cf6'
    },
  ], [getText]);

  // Enhanced medical professionals data with proper types
  const medicalProfessionals: Doctor[] = useMemo(() => [
    { 
      id: "1",
      name: "Dr. Rajesh Sharma", 
      specialty: getText('specialtyGeneralMedicine'), 
      rating: 4.8,
      reviewCount: 127,
      experience: 12,
      consultationFee: 0,
      languages: ['English', 'Hindi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '2:00 PM',
        workingHours: { start: '09:00', end: '18:00' },
        workingDays: [1, 2, 3, 4, 5, 6],
        timeSlots: []
      },
      emoji: "👨‍⚕️",
      isOnline: true,
      nextAvailableSlot: "Today 2:00 PM",
      hospital: "Apollo Hospital",
      distance: 2.5,
      qualifications: ['MBBS', 'MD General Medicine']
    },
    { 
      id: "2",
      name: "Dr. Priya Kaur", 
      specialty: getText('specialtyPediatrics'), 
      rating: 4.9,
      reviewCount: 89,
      experience: 8,
      consultationFee: 0,
      languages: ['English', 'Hindi', 'Punjabi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '3:30 PM',
        workingHours: { start: '10:00', end: '19:00' },
        workingDays: [1, 2, 3, 4, 5, 6],
        timeSlots: []
      },
      emoji: "👩‍⚕️",
      isOnline: false,
      nextAvailableSlot: "Tomorrow 10:00 AM",
      hospital: "Fortis Hospital",
      distance: 1.8,
      qualifications: ['MBBS', 'MD Pediatrics']
    },
    { 
      id: "3",
      name: "Dr. Amit Singh", 
      specialty: getText('specialtyCardiology'), 
      rating: 4.7,
      reviewCount: 156,
      experience: 15,
      consultationFee: 0,
      languages: ['English', 'Hindi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '4:00 PM',
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: [1, 2, 3, 4, 5],
        timeSlots: []
      },
      emoji: "👨‍⚕️",
      isOnline: true,
      nextAvailableSlot: "Today 4:00 PM",
      hospital: "Max Hospital",
      distance: 3.2,
      qualifications: ['MBBS', 'MD Cardiology', 'DM Cardiology']
    }
  ], [getText]);

  // Handler functions
  const handleSchedulePress = useCallback(() => {
    setScheduleModalVisible(true);
  }, []);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setScheduleModalVisible(true);
  }, []);

  const handleConsultPress = useCallback((doctor: Doctor) => {
    // Navigate to consultation screen or start video call
    Alert.alert('Consultation', `Starting consultation with ${doctor.name}`);
  }, []);

  const handleBookAppointment = useCallback(async (form: AppointmentBookingForm) => {
    try {
      const doctor = medicalProfessionals.find(doc => doc.id === form.doctorId);
      if (!doctor) {
        Alert.alert('Error', 'Doctor not found');
        return;
      }

      await addAppointment(form, doctor);
      
      Alert.alert(
        'Appointment Booked!', 
        `Your appointment with ${doctor.name} has been scheduled for ${form.date} at ${form.time}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScheduleModalVisible(false);
              setSelectedDoctor(undefined);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    }
  }, [addAppointment, medicalProfessionals]);

  // Modern quick actions configuration (like doctor dashboard)
  const quickActions = useMemo(() => [
    { 
      icon: '📹', 
      title: getText('actionVideoConsult'),
      subtitle: 'Start video call',
      color: '#10b981',
      onPress: () => Alert.alert('Video Consult', 'Starting video consultation...')
    },
    { 
      icon: '⚡', 
      title: getText('actionEmergency'),
      subtitle: 'Emergency services',
      color: '#ef4444',
      onPress: () => Alert.alert('Emergency', 'Calling emergency services...')
    },
    { 
      icon: '🤖', 
      title: getText('actionAIChecker'),
      subtitle: 'AI health check',
      color: '#8b5cf6',
      onPress: () => Alert.alert('AI Checker', 'Opening AI health checker...')
    },
    { 
      icon: '📅', 
      title: getText('actionSchedule'),
      subtitle: 'Book appointment',
      color: '#3b82f6',
      onPress: handleSchedulePress
    },
  ], [getText, handleSchedulePress]);


  // Custom section header component
  const SectionHeader = ({ 
    title, 
    actionText, 
    onActionPress 
  }: { 
    title: string; 
    actionText: string; 
    onActionPress: () => void; 
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onActionPress}>
        <Text style={styles.sectionAction}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );

  // Custom service card component
  const NearbyServiceCard = () => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>
          Dr. Sharma {getText('statusAvailable')}
        </Text>
        <Text style={styles.serviceSubtitle}>
          {getText('specialtyGeneralMedicine')} • 2.5 km
        </Text>
        <View style={styles.serviceRating}>
          <Text style={styles.ratingDisplay}>⭐ 4.8</Text>
          <Text style={styles.ratingText}>• 15 {getText('statusMinAway')}</Text>
        </View>
      </View>
      <View style={styles.serviceStatus}>
        <View style={styles.availabilityIndicator} />
        <Text style={styles.availabilityText}>{getText('statusAvailable')}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Quick Actions - Grid Layout */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionGridCard
              key={index}
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              color={action.color}
              onPress={action.onPress}
            />
          ))}
        </View>

        {/* Health Summary Section - Modern Grid */}
        <Text style={styles.sectionTitle}>{getText('healthSummaryTitle')}</Text>
        <View style={styles.healthMetricsGrid}>
          {healthMetrics.map((metric, index) => (
            <HealthMetricCard
              key={index}
              label={metric.label}
              value={metric.value}
              status={metric.status}
              icon={metric.icon}
              color={metric.color}
            />
          ))}
        </View>

        {/* Top Doctors Section */}
          <DoctorList
            doctors={medicalProfessionals}
            onDoctorPress={handleDoctorPress}
            onConsultPress={handleConsultPress}
            variant="default"
            title={getText('doctorsTopDoctors')}
            onSeeAllPress={() => {}}
          />

        {/* Nearby Services Section */}
        <Text style={styles.sectionTitle}>{getText('servicesNearby')}</Text>
        <NearbyServiceCard />
      </ScrollView>

      {/* Schedule Modal */}
      <ScheduleModal
        visible={scheduleModalVisible}
        onClose={() => setScheduleModalVisible(false)}
        doctors={medicalProfessionals}
        onBookAppointment={handleBookAppointment}
        selectedDoctor={selectedDoctor}
      />
    </View>
  );
}

// Custom styles with original design patterns
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  // Grid-based quick actions (like doctor dashboard)
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionGridCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionGridIcon: {
    fontSize: 20,
  },
  actionGridValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  actionGridLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  actionGridSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  // Modern health metrics grid (like doctor dashboard)
  healthMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9e31',
  },
  professionalsScroll: {
    marginBottom: 24,
  },
  professionalCard: {
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
  professionalImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  professionalImage: {
    fontSize: 28,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  professionalSpecialty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  professionalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5a9e31',
  },
  // Services grid layout
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  // Modern service card (like doctor dashboard)
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 20,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  serviceStatus: {
    alignItems: 'center',
  },
  availabilityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingDisplay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
  },
});