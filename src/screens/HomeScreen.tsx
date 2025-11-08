import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
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
import { Video, AlertCircle, Calendar, Users, Heart, CalendarDays, Pill, Hospital, Activity, CheckCircle } from 'lucide-react-native';
import { emergencyLocationService } from '../services/EmergencyService';
import { emergencyAudioService } from '../services/AudioService';
import { DOCTORS_DATA } from '../data/doctors';

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

// Modern health summary card with rich UI and animations
const HealthSummaryCard = ({
  healthMetrics,
  onReschedule,
  onMarkTaken,
}: {
  healthMetrics: Array<{
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    gradientColors: string[];
    status?: string;
    statusColor?: string;
    subtitle?: string;
    action?: string;
    trend?: number[];
  }>;
  onReschedule?: () => void;
  onMarkTaken?: () => void;
}) => {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Pulse animation for BP icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderSparkline = (trend?: number[]) => {
    if (!trend) return null;
    return (
      <View style={styles.sparklineContainer}>
        {trend.map((value, index) => (
          <View
            key={index}
            style={[
              styles.sparklineBar,
              { height: `${(value / Math.max(...trend)) * 100}%` },
            ]}
          />
        ))}
      </View>
    );
  };



  return (
    <View style={styles.healthSummaryCard}>
      {/* Header with overall health status */}
      <View style={styles.healthSummaryHeader}>
        <View style={styles.headerLeft}>
          <Activity size={20} color="#10b981" style={styles.headerIcon} />
          <Text style={styles.healthSummaryTitle}>Health Summary</Text>
        </View>
        <View style={styles.overallHealthBadge}>
          <View style={styles.healthIndicator} />
          <Text style={styles.overallHealthText}>Good</Text>
        </View>
      </View>

      {/* Health metrics rows */}
      {healthMetrics.map((metric, index) => (
        <View key={index}>
          <View style={styles.healthSummaryRow}>
            <View style={styles.healthSummaryLeft}>
              {/* Animated icon container for BP */}
              <Animated.View
                style={[
                  styles.healthSummaryIconContainer,
                  {
                    transform: index === 0 ? [{ scale: pulseAnim }] : [],
                  },
                ]}
              >
                <View
                  style={[
                    styles.gradientIconBg,
                    {
                      backgroundColor: metric.gradientColors[0],
                    },
                  ]}
                >
                  {metric.icon}
                </View>
              </Animated.View>

              <View style={styles.metricContent}>
                <Text style={styles.healthSummaryLabel}>{metric.label}</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.healthSummaryValue}>{metric.value}</Text>
                  {metric.status && (
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: `${metric.statusColor}20` },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: metric.statusColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: metric.statusColor },
                        ]}
                      >
                        {metric.status}
                      </Text>
                    </View>
                  )}
                </View>
                {metric.subtitle && (
                  <Text style={styles.metricSubtitle}>{metric.subtitle}</Text>
                )}
              </View>
            </View>

            <View style={styles.healthSummaryRight}>
              {/* Sparkline for BP */}
              {metric.trend && renderSparkline(metric.trend)}

              {/* Action buttons */}
              {metric.action && index === 1 && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onReschedule}
                >
                  <Text style={styles.actionButtonText}>{metric.action}</Text>
                </TouchableOpacity>
              )}

              {metric.action && index === 2 && (
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={onMarkTaken}
                >
                  <CheckCircle size={20} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {index < healthMetrics.length - 1 && (
            <View style={styles.healthSummaryDivider} />
          )}
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
  const [emergencyWizardVisible, setEmergencyWizardVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<EmergencyLocation | null>(null);

  // Enhanced health summary data with rich UI elements
  const healthMetrics = useMemo(() => [
    { 
      label: 'Blood Pressure', 
      value: '120/80',
      icon: <Heart size={22} color="#fff" />,
      color: '#ef4444',
      gradientColors: ['#f87171', '#dc2626'],
      status: 'Normal',
      statusColor: '#10b981',
      trend: [118, 120, 122, 119, 120, 121, 120], // Past week BP data
    },
    { 
      label: 'Next Appointment', 
      value: 'Tomorrow, 2:00 PM',
      icon: <CalendarDays size={22} color="#fff" />,
      color: '#3b82f6',
      gradientColors: ['#60a5fa', '#2563eb'],
      subtitle: 'Dr. Mehta – Cardiologist',
      action: 'Reschedule',
    },
    { 
      label: 'Medicines Due', 
      value: '2 pending',
      icon: <Pill size={22} color="#fff" />,
      color: '#f59e0b',
      gradientColors: ['#fbbf24', '#f59e0b'],
      action: 'Mark Taken',
    },
  ], []);

  // Enhanced medical professionals data with proper types
  const medicalProfessionals: Doctor[] = useMemo(() => DOCTORS_DATA, []);

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

  const handleRescheduleAppointment = useCallback(() => {
    Alert.alert('Reschedule Appointment', 'Opening appointment rescheduling...');
    setScheduleModalVisible(true);
  }, []);

  const handleMarkMedicineTaken = useCallback(() => {
    Alert.alert('Medicine Reminder', 'Marked as taken! 1 pending remaining.');
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

        {/* Health Summary Section - Tabular Layout */}
        <Text style={styles.sectionTitle}>Health Summary</Text>
        <HealthSummaryCard 
          healthMetrics={healthMetrics}
          onReschedule={handleRescheduleAppointment}
          onMarkTaken={handleMarkMedicineTaken}
        />

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
  // Health Summary Card - Modern Dashboard Design
  healthSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f9ff',
  },
  healthSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  healthSummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter',
  },
  overallHealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  healthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  overallHealthText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  healthSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    minHeight: 80,
  },
  healthSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  healthSummaryIconContainer: {
    marginRight: 14,
    flexShrink: 0,
  },
  gradientIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  metricContent: {
    flex: 1,
  },
  healthSummaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  healthSummaryValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  healthSummaryRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    gap: 3,
  },
  sparklineBar: {
    width: 4,
    backgroundColor: '#10b981',
    borderRadius: 2,
    minHeight: 4,
  },
  actionButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthSummaryDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 0,
  },
  // Old Health metrics grid (kept for compatibility)
  healthMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
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
