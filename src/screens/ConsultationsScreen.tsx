import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient'; // Commented out as unused
import { CalendarX } from 'lucide-react-native';
import Header from '../components/common/Header';
import DoctorList from '../components/consultations/DoctorList';
import AppointmentCard from '../components/consultations/AppointmentCard';
import { Doctor, Appointment, AppointmentStatus, AppointmentType } from '../types/health';
import { useI18n } from '../i18n';
import { useAppointments } from '../contexts/AppointmentContext';
import { optimizedScrollViewProps } from '../utils/performanceUtils';
import { safeAlert } from '../utils/safeAlert';
import { DOCTORS_DATA } from '../data/doctors';

const ConsultationsScreen = memo(() => {
  const { getText } = useI18n();
  const { getAppointments } = useAppointments();

  // Use shared doctors data
  const doctors = useMemo(() => DOCTORS_DATA, []);

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
          type: "video-consultation" as AppointmentType,
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
              <View style={styles.emptyIconContainer}>
                <CalendarX size={48} color="#9ca3af" strokeWidth={1.5} />
              </View>
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
