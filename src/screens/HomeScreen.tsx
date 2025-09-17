import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import { useI18n } from '../i18n';

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
  title 
}: { 
  icon: string; 
  title: string; 
}) => (
  <TouchableOpacity style={styles.actionButtonContainer} activeOpacity={0.7}>
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
  const { getText } = useI18n();

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

  // Custom quick actions configuration
  const quickActions = useMemo(() => [
    { icon: '📹', title: getText('actionVideoConsult') },
    { icon: '⚡', title: getText('actionEmergency') },
    { icon: '🤖', title: getText('actionAIChecker') },
    { icon: '📅', title: getText('actionSchedule') },
  ], [getText]);

  // Custom medical professionals data
  const medicalProfessionals = useMemo(() => [
    { 
      name: "Dr. William James", 
      specialty: getText('specialtyCardiologist'), 
      rating: 4.8, 
      price: `$50/${getText('doctorsSession')}`, 
      image: "👨‍⚕️" 
    },
    { 
      name: "Dr. Sarah Johnson", 
      specialty: getText('specialtyNeurologist'), 
      rating: 4.9, 
      price: `$60/${getText('doctorsSession')}`, 
      image: "👩‍⚕️" 
    },
    { 
      name: "Dr. Michael Chen", 
      specialty: getText('specialtyDermatologist'), 
      rating: 4.7, 
      price: `$45/${getText('doctorsSession')}`, 
      image: "👨‍⚕️" 
    },
  ], [getText]);

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
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              title={action.title}
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
        <SectionHeader
          title={getText('doctorsTopDoctors')}
          actionText={getText('doctorsSeeAll')}
          onActionPress={() => {}}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.professionalsScroll}
        >
          {medicalProfessionals.map((professional, index) => (
            <MedicalProfessionalCard
              key={index}
              name={professional.name}
              specialty={professional.specialty}
              rating={professional.rating}
              price={professional.price}
              image={professional.image}
            />
          ))}
        </ScrollView>

        {/* Nearby Services Section */}
        <Text style={styles.sectionTitle}>{getText('servicesNearby')}</Text>
        <NearbyServiceCard />
      </ScrollView>
    </View>
  );
}

// Custom styles with original design patterns
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
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