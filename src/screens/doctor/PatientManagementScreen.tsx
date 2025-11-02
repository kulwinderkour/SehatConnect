import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Header from '../../components/common/Header';

// Mock patient data
const mockPatients = [
  {
    id: '1',
    name: 'Rajinder Singh',
    age: 45,
    gender: 'Male',
    lastVisit: '2024-01-15',
    nextAppointment: '2024-01-22',
    condition: 'Hypertension',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    lastVisit: '2024-01-10',
    nextAppointment: '2024-01-25',
    condition: 'Diabetes',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    age: 28,
    gender: 'Male',
    lastVisit: '2024-01-08',
    nextAppointment: null,
    condition: 'General Checkup',
    status: 'Completed'
  }
];

export default function PatientManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter patients based on search and filter
  const filteredPatients = useMemo(() => {
    let filtered = mockPatients;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(patient => patient.status === selectedFilter);
    }

    return filtered;
  }, [searchQuery, selectedFilter]);

  const handlePatientPress = (patient: any) => {
    Alert.alert('Patient Details', `Viewing details for ${patient.name}`);
  };

  const handleAddPatient = () => {
    Alert.alert('Add Patient', 'Opening add patient form...');
  };

  const PatientCard = ({ patient }: { patient: any }) => (
    <TouchableOpacity 
      style={styles.patientCard}
      onPress={() => handlePatientPress(patient)}
      activeOpacity={0.7}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientDetails}>{patient.age} years • {patient.gender}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: patient.status === 'Active' ? '#10b981' : '#6b7280' }
        ]}>
          <Text style={styles.statusText}>{patient.status}</Text>
        </View>
      </View>
      <View style={styles.patientBody}>
        <Text style={styles.conditionText}>Condition: {patient.condition}</Text>
        <Text style={styles.lastVisitText}>Last Visit: {patient.lastVisit}</Text>
        {patient.nextAppointment && (
          <Text style={styles.nextAppointmentText}>Next: {patient.nextAppointment}</Text>
        )}
      </View>
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
        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          
          <View style={styles.filterButtons}>
            {['All', 'Active', 'Completed'].map((filter) => (
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
        </View>

        {/* Add Patient Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddPatient}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add New Patient</Text>
        </TouchableOpacity>

        {/* Patients List */}
        <Text style={styles.sectionTitle}>Patients ({filteredPatients.length})</Text>
        <View style={styles.patientsList}>
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </View>

        {filteredPatients.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No patients found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first patient'}
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
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
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
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 8,
    fontWeight: '600',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  patientsList: {
    gap: 12,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  patientDetails: {
    fontSize: 14,
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
  patientBody: {
    gap: 4,
  },
  conditionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  lastVisitText: {
    fontSize: 14,
    color: '#6b7280',
  },
  nextAppointmentText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
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
