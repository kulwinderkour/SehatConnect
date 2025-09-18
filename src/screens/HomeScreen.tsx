import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import DoctorList from '../components/consultations/DoctorList';
import ScheduleModal from '../components/home/ScheduleModal';
import { useI18n } from '../i18n';
import { useAppointments } from '../contexts/AppointmentContext';
import { Doctor, AppointmentBookingForm, HealthSummary } from '../types/health';

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
  onPress
}: { 
  icon: string; 
  title: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.actionButtonContainer} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.actionIconContainer}>
      <Text style={styles.actionIcon}>{icon}</Text>
    </View>
    <Text style={styles.actionLabel}>{title}</Text>
  </TouchableOpacity>
);

// Custom health metric component
const HealthMetricItem = ({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string; 
  status: 'normal' | 'warning' | 'upcoming'; 
}) => {
  const statusColor = useMemo(() => {
    switch (status) {
      case 'normal': return '#5a9e31';
      case 'warning': return '#f59e0b';
      case 'upcoming': return '#3b82f6';
      default: return '#6b7280';
    }
  }, [status]);

  return (
    <View style={styles.metricItem}>
      <View style={styles.metricInfo}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
};

// Main home screen component
export default function HomeScreen() {
  const navigation = useNavigation();
  const { getText } = useI18n();
  const { addAppointment } = useAppointments();
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();

  // Custom health data configuration
  const healthMetrics = useMemo(() => [
    { 
      label: getText('healthBloodPressure'), 
      value: '120/80', 
      status: 'normal' as const 
    },
    { 
      label: getText('healthNextAppointment'), 
      value: `${getText('timeTomorrow')} 2:00 PM`, 
      status: 'upcoming' as const 
    },
    { 
      label: getText('healthMedicinesDue'), 
      value: `2 ${getText('timePending')}`, 
      status: 'warning' as const 
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

  // Handle video consult press
  const handleVideoConsultPress = useCallback(() => {
    navigation.navigate('Consult', { screen: 'VideoConsult' });
  }, [navigation]);

  // Custom quick actions configuration
  const quickActions = useMemo(() => [
    { 
      icon: '📹', 
      title: getText('actionVideoConsult'),
      onPress: handleVideoConsultPress
    },
    { 
      icon: '⚡', 
      title: getText('actionEmergency'),
      onPress: () => Alert.alert('Emergency', 'Calling emergency services...')
    },
    { 
      icon: '🤖', 
      title: getText('actionAIChecker'),
      onPress: () => Alert.alert('AI Checker', 'Opening AI health checker...')
    },
    { 
      icon: '📅', 
      title: getText('actionSchedule'),
      onPress: handleSchedulePress
    },
  ], [getText, handleSchedulePress, handleVideoConsultPress]);


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
        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              title={action.title}
              onPress={action.onPress}
            />
          ))}
        </View>

        {/* Health Summary Section */}
        <Text style={styles.sectionTitle}>{getText('healthSummaryTitle')}</Text>
        <View style={styles.healthSummaryCard}>
          {healthMetrics.map((metric, index) => (
            <HealthMetricItem
              key={index}
              label={metric.label}
              value={metric.value}
              status={metric.status}
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
const styles = StyleSheet.create({
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  actionButtonContainer: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5a9e31',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    color: '#fff',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  healthSummaryCard: {
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
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
    marginRight: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingDisplay: {
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
  availabilityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5a9e31',
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a9e31',
  },
});