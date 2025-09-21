import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient'; // Commented out as unused
import Header from '../components/common/Header';
import DoctorList from '../components/consultations/DoctorList';
import AppointmentCard from '../components/consultations/AppointmentCard';
import { Doctor, Appointment, AppointmentStatus } from '../types/health';
import { useI18n } from '../i18n';
import { useAppointments } from '../contexts/AppointmentContext';
import { optimizedScrollViewProps } from '../utils/performanceUtils';
import { safeAlert } from '../utils/safeAlert';

const ConsultationsScreen = memo(() => {
  const { getText } = useI18n();
  const { getAppointments } = useAppointments();

  // Mock doctors data
  const doctors: Doctor[] = useMemo(() => [
    {
      id: "1",
      name: "Dr. Rajesh Sharma",
      specialty: "General Medicine",
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
      specialty: "Pediatrics",
      rating: 4.9,
      reviewCount: 89,
      experience: 8,
      consultationFee: 0,
      languages: ['English', 'Hindi', 'Punjabi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '3:30 PM',
        workingHours: { start: '10:00', end: '19:00' },
        workingDays: [1, 2, 3, 4, 5],
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
      specialty: "Cardiology",
      rating: 4.7,
      reviewCount: 156,
      experience: 15,
      consultationFee: 0,
      languages: ['English', 'Hindi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '4:00 PM',
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: [1, 2, 3, 4, 5, 6],
        timeSlots: []
      },
      emoji: "👨‍⚕️",
      isOnline: true,
      nextAvailableSlot: "Today 4:00 PM",
      hospital: "Max Hospital",
      distance: 3.2,
      qualifications: ['MBBS', 'MD Cardiology', 'DM Cardiology']
    },
  ], []);

  // Get appointments from context
  const appointments = useMemo(() => {
    const contextAppointments = getAppointments();
    // Add some mock appointments if none exist
    if (contextAppointments.length === 0) {
      return [
        {
          id: "mock-1",
          doctorId: "1",
          doctorName: "Dr. Rajesh Sharma",
          doctorSpecialty: "General Medicine",
          patientId: "patient1",
          patientName: "Rajinder Singh",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
          time: "14:00",
          duration: 30,
          status: "confirmed" as AppointmentStatus,
          type: "video-consultation",
          notes: "Follow up for blood pressure medication",
          symptoms: ["High blood pressure", "Headache"],
          followUpRequired: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    return contextAppointments;
  }, [getAppointments]);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    safeAlert('Doctor Details', `Viewing details for ${doctor.name}`);
  }, []);

  const handleConsultPress = useCallback((doctor: Doctor) => {
    safeAlert('Consultation', `Starting consultation with ${doctor.name}`);
  }, []);

  const handleAppointmentPress = useCallback((appointment: Appointment) => {
    safeAlert('Appointment Details', `Viewing appointment with ${appointment.doctorName}`);
  }, []);

  const handleAppointmentAction = useCallback((appointment: Appointment) => {
    if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
      safeAlert('Join Appointment', `Joining appointment with ${appointment.doctorName}`);
    } else {
      safeAlert('Appointment Details', `Viewing details for ${appointment.doctorName}`);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        {...optimizedScrollViewProps}
      >
        <View style={styles.doctorsSection}>
          <DoctorList
            doctors={doctors}
            onDoctorPress={handleDoctorPress}
            onConsultPress={handleConsultPress}
            title="Available Doctors"
            showFilters={true}
            variant="vertical"
          />
        </View>

        <Text style={styles.sectionTitle}>My Appointments</Text>
        <View style={styles.appointmentsContainer}>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <AppointmentCard
                key={`appointment-${appointment.id}`}
                appointment={appointment}
                onPress={handleAppointmentPress}
                onActionPress={handleAppointmentAction}
                variant="upcoming"
              />
            ))
          ) : (
            <View style={styles.emptyAppointments}>
              <Text style={styles.emptyAppointmentsText}>No appointments scheduled</Text>
              <Text style={styles.emptyAppointmentsSubtext}>Book an appointment with a doctor to get started</Text>
            </View>
          )}
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
  doctorsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    marginTop: 24,
  },
  appointmentsContainer: {
    gap: 12,
  },
  emptyAppointments: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyAppointmentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyAppointmentsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
