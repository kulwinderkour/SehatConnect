import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Header from '../../components/common/Header';

// Mock appointment data
const mockAppointments = [
  {
    id: '1',
    patientName: 'Rajinder Singh',
    time: '09:00 AM',
    duration: 30,
    type: 'Follow-up',
    status: 'Scheduled',
    condition: 'Hypertension',
    notes: 'Blood pressure check'
  },
  {
    id: '2',
    patientName: 'Priya Sharma',
    time: '10:30 AM',
    duration: 45,
    type: 'Consultation',
    status: 'In Progress',
    condition: 'Diabetes',
    notes: 'Medication review'
  },
  {
    id: '3',
    patientName: 'Amit Kumar',
    time: '02:00 PM',
    duration: 30,
    type: 'New Patient',
    status: 'Scheduled',
    condition: 'General Checkup',
    notes: 'Initial consultation'
  },
  {
    id: '4',
    patientName: 'Sneha Patel',
    time: '03:30 PM',
    duration: 30,
    type: 'Follow-up',
    status: 'Completed',
    condition: 'Migraine',
    notes: 'Prescription refill'
  }
];

export default function AppointmentManagementScreen() {
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    let filtered = mockAppointments;

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(apt => apt.status === selectedStatus);
    }

    return filtered;
  }, [selectedStatus]);

  const handleAppointmentPress = (appointment: any) => {
    Alert.alert('Appointment Details', `Viewing details for ${appointment.patientName}`);
  };

  const handleStartAppointment = (appointment: any) => {
    Alert.alert('Start Appointment', `Starting appointment with ${appointment.patientName}`);
  };

  const handleReschedule = (appointment: any) => {
    Alert.alert('Reschedule', `Rescheduling appointment with ${appointment.patientName}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <TouchableOpacity 
      style={styles.appointmentCard}
      onPress={() => handleAppointmentPress(appointment)}
      activeOpacity={0.7}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.timeContainer}>
          <Text style={styles.appointmentTime}>{appointment.time}</Text>
          <Text style={styles.appointmentDuration}>{appointment.duration} min</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(appointment.status) }
        ]}>
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>
      
      <View style={styles.appointmentBody}>
        <Text style={styles.patientName}>{appointment.patientName}</Text>
        <Text style={styles.appointmentType}>{appointment.type}</Text>
        <Text style={styles.conditionText}>Condition: {appointment.condition}</Text>
        {appointment.notes && (
          <Text style={styles.notesText}>Notes: {appointment.notes}</Text>
        )}
      </View>

      {appointment.status === 'Scheduled' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => handleStartAppointment(appointment)}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rescheduleButton}
            onPress={() => handleReschedule(appointment)}
          >
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      )}

      {appointment.status === 'In Progress' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleStartAppointment(appointment)}
          >
            <Text style={styles.joinButtonText}>Join Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <View style={styles.filterButtons}>
            {['Today', 'Tomorrow', 'This Week'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statusFilter}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.statusButtons}>
              {['All', 'Scheduled', 'In Progress', 'Completed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    selectedStatus === status && styles.statusButtonActive
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    selectedStatus === status && styles.statusButtonTextActive
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Appointments List */}
        <Text style={styles.sectionTitle}>
          Appointments ({filteredAppointments.length})
        </Text>
        <View style={styles.appointmentsList}>
          {filteredAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </View>

        {filteredAppointments.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No appointments found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedStatus !== 'All' ? 'Try adjusting your filters' : 'No appointments scheduled'}
            </Text>
          </View>
        )}
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
  filterSection: {
    marginBottom: 24,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  statusFilter: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    alignItems: 'flex-start',
  },
  appointmentTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  appointmentDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  appointmentBody: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rescheduleButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rescheduleButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
