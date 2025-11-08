import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient'; // Commented out as unused
import Header from '../../components/common/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useAppointments } from '../../contexts/AppointmentContext';
import { useNavigation } from '@react-navigation/native';

// Screen dimensions (unused variable removed to avoid lint warning)

// Doctor dashboard component
export default function DoctorDashboardScreen() {
  const { user } = useAuth();
  const [currentTime] = useState(new Date());

  // Mock data for doctor dashboard
  const dashboardData = useMemo(() => ({
    todayAppointments: 8,
    completedAppointments: 5,
    pendingAppointments: 3,
    totalPatients: 156,
    newPatients: 4,
    prescriptionsWritten: 12,
    nextAppointment: {
      time: '2:30 PM',
      patient: 'Rajinder Singh',
      type: 'Follow-up'
    }
  }), []);

  // Quick action handlers
  const handleViewPatients = useCallback(() => {
    Alert.alert('Patients', 'Opening patient management...');
  }, []);

  const handleWritePrescription = useCallback(() => {
    Alert.alert('Prescription', 'Opening prescription writer...');
  }, []);

  const handleEmergency = useCallback(() => {
    Alert.alert('Emergency', 'Emergency protocols activated...');
  }, []);

  const handleViewAppointments = useCallback(() => {
    // Navigate to the Appointments tab
    // @ts-ignore
    navigation.navigate('Appointments');
  }, [navigation]);

  // Stats card component
  const StatsCard = ({ title, value, subtitle, color, icon }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    icon: string;
  }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsIcon}>{icon}</Text>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
      <Text style={styles.statsTitle}>{title}</Text>
      <Text style={styles.statsSubtitle}>{subtitle}</Text>
    </View>
  );

  // Quick action button component
  const QuickActionButton = ({ 
    icon, 
    title, 
    subtitle,
    onPress,
    color = '#2563eb',
    badgeCount = 0,
  }: { 
    icon: string; 
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
    badgeCount?: number;
  }) => (
    <TouchableOpacity 
      style={[styles.actionButton, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionContent}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
        <Text style={styles.actionArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  // Navigation & appointments
  const navigation = useNavigation();
  const { fetchAppointmentsForDoctor, state: appointmentState } = useAppointments();
  const [todayCount, setTodayCount] = useState<number>(0);

  useEffect(() => {
    let intervalId: any;
    const load = async () => {
      if (user && (user as any).role === 'doctor') {
        const doctorId = (user as any).patientId;
        await fetchAppointmentsForDoctor(doctorId);
      }
    };

    load();

    // Poll every 15 seconds for new appointments
    intervalId = setInterval(() => {
      if (user && (user as any).role === 'doctor') {
        const doctorId = (user as any).patientId;
        fetchAppointmentsForDoctor(doctorId);
      }
    }, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, fetchAppointmentsForDoctor]);

  // compute today's appointments count when appointments change
  useEffect(() => {
    const today = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const count = appointmentState.appointments.filter((apt) => {
      try {
        const aptDate = new Date(apt.date);
        return isSameDay(aptDate, today);
      } catch (e) {
        return false;
      }
    }).length;

    setTodayCount(count);
  }, [appointmentState.appointments]);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, Dr. {user?.shortName}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {user?.specialty} • {user?.hospital}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            title="Today's Appointments"
            value={dashboardData.todayAppointments}
            subtitle={`${dashboardData.completedAppointments} completed`}
            color="#10b981"
            icon="📅"
          />
          <StatsCard
            title="Total Patients"
            value={dashboardData.totalPatients}
            subtitle={`${dashboardData.newPatients} new this week`}
            color="#3b82f6"
            icon="👥"
          />
          <StatsCard
            title="Prescriptions"
            value={dashboardData.prescriptionsWritten}
            subtitle="Written today"
            color="#8b5cf6"
            icon="💊"
          />
          <StatsCard
            title="Pending"
            value={dashboardData.pendingAppointments}
            subtitle="Appointments pending"
            color="#f59e0b"
            icon="⏳"
          />
        </View>

        {/* Next Appointment */}
        <View style={styles.nextAppointmentCard}>
          <Text style={styles.sectionTitle}>Next Appointment</Text>
          <View style={styles.appointmentInfo}>
            <View style={styles.appointmentTime}>
              <Text style={styles.appointmentTimeText}>{dashboardData.nextAppointment.time}</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentPatient}>{dashboardData.nextAppointment.patient}</Text>
              <Text style={styles.appointmentType}>{dashboardData.nextAppointment.type}</Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="📅"
            title="Today's Schedule"
            subtitle="View all appointments"
            onPress={handleViewAppointments}
            color="#10b981"
            badgeCount={todayCount}
          />
          <QuickActionButton
            icon="👥"
            title="Patient Management"
            subtitle="Manage patient records"
            onPress={handleViewPatients}
            color="#3b82f6"
          />
          <QuickActionButton
            icon="💊"
            title="Write Prescription"
            subtitle="Create new prescription"
            onPress={handleWritePrescription}
            color="#8b5cf6"
          />
          <QuickActionButton
            icon="🚨"
            title="Emergency"
            subtitle="Emergency protocols"
            onPress={handleEmergency}
            color="#ef4444"
          />
        </View>
      </ScrollView>
    </View>
  );
}

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
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
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
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsIcon: {
    fontSize: 20,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  nextAppointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 16,
  },
  appointmentTimeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 14,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
