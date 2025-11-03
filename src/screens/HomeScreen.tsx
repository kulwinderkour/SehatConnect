import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/common/Header';
import DoctorList from '../components/consultations/DoctorList';
import ScheduleModal from '../components/home/ScheduleModal';
import SmartSOSWizard from '../components/common/SmartSOSWizard';
import { useI18n } from '../i18n';
import { useAppointments } from '../contexts/AppointmentContext';
import { Doctor, AppointmentBookingForm } from '../types/health';
import { EmergencyLocation } from '../types/emergency';
import { Video, AlertCircle, Calendar, Users, Heart, CalendarDays, Pill, Hospital } from 'lucide-react-native';
import { emergencyLocationService } from '../services/EmergencyService';
import { emergencyAudioService } from '../services/AudioService';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = screenWidth < 375;

// Custom quick action component with original design
const QuickActionButton = ({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: React.ReactNode; // ✅ allow JSX components
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
      <View style={styles.actionGridIcon}>{icon}</View>
    </View>
    <View style={styles.actionGridContent}>
      <Text style={styles.actionGridLabel} numberOfLines={2}>{title}</Text>
      <Text style={styles.actionGridSubtitle} numberOfLines={2}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// Modern health metric card component (like doctor dashboard)
const HealthMetricCard = ({
  label,
  value,
  status,
  icon,
  color,
}: {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'upcoming';
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIcon}>{icon}</View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricSubtitle}>
        {status === 'normal'
          ? 'Normal'
          : status === 'warning'
          ? 'Needs attention'
          : 'Upcoming'}
      </Text>
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
  const [emergencyWizardVisible, setEmergencyWizardVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<EmergencyLocation | null>(null);

  // Simple health summary data
  const healthMetrics = useMemo(() => [
    { 
      label: 'Blood Pressure', 
      value: '120/80',
      status: 'normal' as const,
      icon: <Heart size={20} color="#10b981" />,
      color: '#10b981',
    },
    { 
      label: 'Next Appointment', 
      value: 'Tomorrow 2:00 PM',
      status: 'upcoming' as const,
      icon: <CalendarDays size={20} color="#3b82f6" />,
      color: '#3b82f6',
    },
    { 
      label: 'Medicines Due', 
      value: '2 pending',
      status: 'warning' as const,
      icon: <Pill size={20} color="#f59e0b" />,
      color: '#f59e0b',
    },
  ], []);

  // Enhanced medical professionals data with proper types
  const medicalProfessionals: Doctor[] = useMemo(
    () => [
      {
        id: '1',
        name: 'Dr. Rajesh Sharma',
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
          timeSlots: [],
        },
        emoji: '👨‍⚕️',
        isOnline: true,
        nextAvailableSlot: 'Today 2:00 PM',
        hospital: 'Apollo Hospital',
        distance: 2.5,
        qualifications: ['MBBS', 'MD General Medicine'],
      },
      {
        id: '2',
        name: 'Dr. Priya Kaur',
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
          timeSlots: [],
        },
        emoji: '👩‍⚕️',
        isOnline: false,
        nextAvailableSlot: 'Tomorrow 10:00 AM',
        hospital: 'Fortis Hospital',
        distance: 1.8,
        qualifications: ['MBBS', 'MD Pediatrics'],
      },
      {
        id: '3',
        name: 'Dr. Amit Singh',
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
          timeSlots: [],
        },
        emoji: '👨‍⚕️',
        isOnline: true,
        nextAvailableSlot: 'Today 4:00 PM',
        hospital: 'Max Hospital',
        distance: 3.2,
        qualifications: ['MBBS', 'MD Cardiology', 'DM Cardiology'],
      },
    ],
    [getText],
  );

  // Emergency service initialization
  useEffect(() => {
    const initializeEmergencyServices = async () => {
      try {
        await emergencyAudioService.initialize();
        
        // Don't request location permission on home screen load
        // Location will be requested only when emergency features are used
      } catch (error) {
        console.error('Failed to initialize emergency services:', error);
      }
    };

    initializeEmergencyServices();
  }, []);


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

  const handleEmergencyPress = useCallback(async () => {
    try {
      // Initialize emergency services if not already done
      await emergencyAudioService.initialize();
      
      // Open the Smart SOS Wizard first
      setEmergencyWizardVisible(true);
      
      // Request location permission and get current location for emergency
      // This will happen in background while wizard is open
      setTimeout(async () => {
        try {
          const hasPermission = await emergencyLocationService.requestLocationPermission();
          if (hasPermission) {
            const location = await emergencyLocationService.getCurrentLocation();
            setUserLocation(location);
          }
          
          // Play emergency alert after location is handled
          await emergencyAudioService.playEmergencyAlert('General Emergency', 'en');
        } catch (locationError) {
          console.error('Location permission error:', locationError);
        }
      }, 100);
      
    } catch (error) {
      console.error('Emergency initialization error:', error);
      Alert.alert(
        'Emergency Service',
        'Unable to initialize emergency services. Would you like to call emergency services directly?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call 108', onPress: () => Alert.alert('Calling', 'Would open dialer with 108') }
        ]
      );
    }
  }, []);



  const handlePlayAudio = useCallback(async (audioKey: string) => {
    try {
      // Map audio keys to actual instructions
      const audioMap: { [key: string]: string } = {
        'road_accident_step_1': 'Ensure scene safety - check for ongoing danger',
        'chest_pain_step_1': 'Call emergency services immediately',
        'snake_bite_step_1': 'Keep the person calm and still',
        // Add more mappings as needed
      };

      const instruction = audioMap[audioKey] || 'Follow the instruction shown on screen';
      await emergencyAudioService.playFirstAidInstruction(instruction, 'en');
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }, []);

  const handleBookAppointment = useCallback(
    async (form: AppointmentBookingForm) => {
      try {
        const doctor = medicalProfessionals.find(
          doc => doc.id === form.doctorId,
        );
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
              },
            },
          ],
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to book appointment. Please try again.');
      }
    },
    [addAppointment, medicalProfessionals],
  );

  // Modern quick actions configuration (like doctor dashboard)
  const quickActions = useMemo(
    () => [
      {
        icon: <Video size={24} color="#10b981" />,
        title: getText('actionVideoConsult'),
        subtitle: 'Start video call',
        color: '#10b981',
        onPress: () => navigation.navigate('Consult' as never),
      },

      {
        icon: <AlertCircle size={24} color="#ef4444" />,
        title: getText('actionEmergency'),
        subtitle: 'Smart SOS Workflow',
        color: '#ef4444',
        onPress: handleEmergencyPress,
      },
      {
        icon: <Users size={24} color="#8b5cf6" />,
        title: 'Government Schemes',
        subtitle: 'Public health programs',
        color: '#8b5cf6',
        onPress: () => navigation.navigate('GovernmentSchemes' as never),
      },
      {
        icon: <Calendar size={24} color="#3b82f6" />,
        title: getText('actionSchedule'),
        subtitle: 'Book appointment',
        color: '#3b82f6',
        onPress: handleSchedulePress,
      },
    ],
    [getText, handleSchedulePress, navigation, handleEmergencyPress],
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Actions - Grid Layout */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              color={action.color}
              onPress={action.onPress}
            />
          ))}
        </View>

        {/* Health Summary Section - Simple List */}
        <Text style={styles.sectionTitle}>Health Summary</Text>
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
      </ScrollView>

      {/* Schedule Modal */}
      <ScheduleModal
        visible={scheduleModalVisible}
        onClose={() => setScheduleModalVisible(false)}
        doctors={medicalProfessionals}
        onBookAppointment={handleBookAppointment}
        selectedDoctor={selectedDoctor}
      />

      {/* Smart SOS Emergency Wizard */}
      <SmartSOSWizard
        visible={emergencyWizardVisible}
        onClose={() => setEmergencyWizardVisible(false)}
        userLocation={userLocation || undefined}
        onPlayAudio={handlePlayAudio}
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  // Grid-based quick actions with improved alignment and responsive design
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: isSmallScreen ? 6 : 8,
  },
  actionGridCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    width: '48%',
    minHeight: isSmallScreen ? 90 : 100,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
  },
  actionGridHeader: {
    marginBottom: 12,
  },
  actionGridIcon: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  actionGridContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionGridLabel: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: isSmallScreen ? 18 : 20,
  },
  actionGridSubtitle: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#6b7280',
    lineHeight: isSmallScreen ? 14 : 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  // Health metrics grid
  healthMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
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
    marginBottom: 12,
  },
  metricIcon: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
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
  // Service card layout
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  // Show More/Less Doctors Button
  showMoreButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  showMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});
