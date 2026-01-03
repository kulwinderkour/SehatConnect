import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient'; // Commented out as unused
import { CalendarX, Video } from 'lucide-react-native';
import Header from '../components/common/Header';
import DoctorList from '../components/consultations/DoctorList';
import AppointmentCard from '../components/consultations/AppointmentCard';
import { Doctor, Appointment, AppointmentStatus, AppointmentType } from '../types/health';
import { useI18n } from '../i18n';
import { useAppointments } from '../contexts/AppointmentContext';
import { optimizedScrollViewProps } from '../utils/performanceUtils';
import { safeAlert } from '../utils/safeAlert';
import { DOCTORS_DATA } from '../data/doctors';
import { useNavigation } from '@react-navigation/native';

const ConsultationsScreen = memo(() => {
  const { getText } = useI18n();
  const { state } = useAppointments();
  const navigation = useNavigation();

  // Use shared doctors data
  const doctors = useMemo(() => DOCTORS_DATA, []);

  // Get upcoming video appointments from context (no mock data)
  const bookedVideoAppointment = useMemo(() => {
    const appointments = state.appointments;
    const now = new Date();

    // Filter for upcoming VIDEO appointments that are confirmed or scheduled
    const upcomingVideoAppointments = appointments.filter(apt => {
      const aptDateTime = new Date(`${apt.date}T${apt.time}`);
      return (
        apt.type === 'video-consultation' &&
        (apt.status === 'confirmed' || apt.status === 'scheduled') &&
        aptDateTime >= now
      );
    });

    // Sort by date and time, return the nearest one
    if (upcomingVideoAppointments.length > 0) {
      upcomingVideoAppointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });
      return upcomingVideoAppointments[0];
    }
    return null;
  }, [state.appointments]);

  // Get all appointments for "My Appointments" section
  const allAppointments = useMemo(() => {
    return state.appointments;
  }, [state.appointments]);

  // Format appointment date/time for display
  const formatAppointmentDateTime = (date: string, time: string) => {
    const aptDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format time to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const timeStr = `${hour12}:${minutes} ${ampm}`;

    // Check if today or tomorrow
    if (aptDate.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (aptDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      const dateStr = aptDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return `${dateStr}, ${timeStr}`;
    }
  };

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    safeAlert('Doctor Details', `Viewing details for ${doctor.name}`);
  }, []);

  const handleConsultPress = useCallback((doctor: Doctor) => {
    safeAlert('Consultation', `Starting consultation with ${doctor.name}`);
  }, []);

  const handleJoinCall = useCallback(() => {
    if (!bookedVideoAppointment) return;

    // Navigate to VideoCallScreen with WebRTC parameters
    navigation.navigate('VideoCall', {
      appointmentId: bookedVideoAppointment.id,
      patientId: bookedVideoAppointment.patientId,
      doctorId: bookedVideoAppointment.doctorId,
    });
  }, [bookedVideoAppointment, navigation]);

  const handleAppointmentPress = useCallback((appointment: Appointment) => {
    safeAlert('Appointment Details', `Viewing appointment with ${appointment.doctorName}`);
  }, []);

  const handleAppointmentAction = useCallback((appointment: Appointment) => {
    if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
      if (appointment.type === 'video-consultation') {
        handleJoinCall();
      } else {
        safeAlert('Appointment', `This is a ${appointment.type} appointment`);
      }
    } else {
      safeAlert('Appointment Details', `Viewing details for ${appointment.doctorName}`);
    }
  }, [handleJoinCall]);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        {...optimizedScrollViewProps}
      >
        {/* Booked Video Consultation Section - Shows at top if exists */}
        {bookedVideoAppointment && (
          <View style={styles.bookedConsultSection}>
            <Text style={styles.sectionTitle}>Your Video Consultation</Text>
            <View style={styles.bookedConsultCard}>
              <View style={styles.consultHeader}>
                <View style={styles.consultHeaderLeft}>
                  <Text style={styles.doctorEmoji}>👨‍⚕️</Text>
                  <View style={styles.consultHeaderInfo}>
                    <Text style={styles.consultDoctorName}>{bookedVideoAppointment.doctorName}</Text>
                    <Text style={styles.consultDoctorSpecialty}>{bookedVideoAppointment.doctorSpecialty}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {bookedVideoAppointment.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.consultDetails}>
                <View style={styles.consultDetailRow}>
                  <Text style={styles.consultDetailLabel}>📅 Date & Time</Text>
                  <Text style={styles.consultDetailValue}>
                    {formatAppointmentDateTime(bookedVideoAppointment.date, bookedVideoAppointment.time)}
                  </Text>
                </View>
                <View style={styles.consultDetailRow}>
                  <Text style={styles.consultDetailLabel}>⏱️ Duration</Text>
                  <Text style={styles.consultDetailValue}>{bookedVideoAppointment.duration} minutes</Text>
                </View>
                <View style={styles.consultDetailRow}>
                  <Text style={styles.consultDetailLabel}>📱 Type</Text>
                  <Text style={styles.consultDetailValue}>Video Consultation</Text>
                </View>
              </View>

              {/* Join Call Button */}
              <TouchableOpacity
                style={styles.joinCallButton}
                onPress={handleJoinCall}
                activeOpacity={0.8}
              >
                <View style={styles.joinCallButtonContent}>
                  <Video size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.joinCallButtonText}>Join Video Call</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}


        {/* Available Doctors Section */}
        <View style={styles.doctorsSection}>
          <DoctorList
            doctors={doctors}
            onDoctorPress={handleDoctorPress}
            onConsultPress={handleConsultPress}
            title="Available Doctors"
            showFilters={true}
          />
        </View>
      </ScrollView>
    </View>
  );
});

export default ConsultationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  bookedConsultSection: {
    marginBottom: 24,
  },
  bookedConsultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  consultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  consultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  consultHeaderInfo: {
    flex: 1,
  },
  consultDoctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  consultDoctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  consultDetails: {
    marginBottom: 20,
  },
  consultDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  consultDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  consultDetailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  joinCallButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinCallButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinCallButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  doctorsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    marginTop: 24,
    letterSpacing: -0.5,
  },
  appointmentsContainer: {
    gap: 12,
  },
  emptyAppointments: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 8,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyAppointmentsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyAppointmentsSubtext: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },
});
