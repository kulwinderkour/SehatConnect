import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import DoctorList from '../components/consultations/DoctorList';
import ScheduleModal from '../components/home/ScheduleModal';
import { useI18n } from '../i18n';
import { useAppointments } from '../contexts/AppointmentContext';
import { Doctor, AppointmentBookingForm } from '../types/health';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;

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

// Custom quick action component with improved alignment
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
    </View>
    <View style={styles.actionGridContent}>
      <Text style={styles.actionGridLabel} numberOfLines={2}>{title}</Text>
      <Text style={styles.actionGridSubtitle} numberOfLines={2}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// Simple health summary list component
const HealthSummaryCard = ({ 
  metrics
}: { 
  metrics: Array<{
    label: string;
    value: string;
  }>;
}) => {
  return (
    <View style={styles.healthSummaryCard}>
      {metrics.map((metric, index) => (
        <View key={index} style={styles.healthSummaryRow}>
          <Text style={styles.healthSummaryLabel}>{metric.label}</Text>
          <Text style={styles.healthSummaryValue}>{metric.value}</Text>
        </View>
      ))}
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
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  // Simple health summary data
  const healthSummaryData = useMemo(() => [
    { 
      label: 'Blood Pressure', 
      value: '120/80'
    },
    { 
      label: 'Next Appointment', 
      value: 'Tomorrow 2:00 PM'
    },
    { 
      label: 'Medicines Due', 
      value: '2 pending'
    },
  ], []);

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

  // Filter doctors based on showAllDoctors state
  const displayedDoctors = useMemo(() => {
    const result = showAllDoctors ? medicalProfessionals : medicalProfessionals.slice(0, 2);
    console.log('displayedDoctors updated:', {
      showAllDoctors,
      totalDoctors: medicalProfessionals.length,
      displayedCount: result.length
    });
    return result;
  }, [medicalProfessionals, showAllDoctors]);

  // Toggle show all doctors
  const toggleShowAllDoctors = useCallback(() => {
    console.log('Toggle button pressed, current state:', showAllDoctors);
    setShowAllDoctors(prev => {
      console.log('Setting showAllDoctors to:', !prev);
      return !prev;
    });
  }, [showAllDoctors]);

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

  // Modern quick actions configuration (like doctor dashboard)
  const quickActions = useMemo(() => [
    { 
      icon: '📹', 
      title: getText('actionVideoConsult'),
      subtitle: 'Start video call',
      color: '#10b981',
      onPress: handleVideoConsultPress
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
          Dr. Sharma
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
        <HealthSummaryCard metrics={healthSummaryData} />

        {/* Top Doctors Section */}
          <DoctorList
            doctors={displayedDoctors}
            onDoctorPress={handleDoctorPress}
            onConsultPress={handleConsultPress}
            variant="default"
            title={getText('doctorsTopDoctors')}
            onSeeAllPress={() => {}}
            showInternalMoreButton={false}
          />

        {/* Show More/Less Doctors Button */}
        {medicalProfessionals.length > 2 && (
          <TouchableOpacity style={styles.showMoreButton} onPress={toggleShowAllDoctors}>
            <Text style={styles.showMoreButtonText}>
              {showAllDoctors 
                ? 'Show Less Doctors' 
                : `Show More Doctors (${medicalProfessionals.length - 2} more)`
              }
            </Text>
          </TouchableOpacity>
        )}

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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionGridIcon: {
    fontSize: isSmallScreen ? 20 : 24,
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
  // Simple health summary card
  healthSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  healthSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  healthSummaryLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  healthSummaryValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
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