import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Header from '../../components/common/Header';

// Mock prescription data
const mockPrescriptions = [
  {
    id: '1',
    patientName: 'Rajinder Singh',
    date: '2024-01-15',
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
    ],
    status: 'Active'
  },
  {
    id: '2',
    patientName: 'Priya Sharma',
    date: '2024-01-14',
    medications: [
      { name: 'Insulin', dosage: '20 units', frequency: 'Before meals' }
    ],
    status: 'Active'
  },
  {
    id: '3',
    patientName: 'Amit Kumar',
    date: '2024-01-10',
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed' }
    ],
    status: 'Completed'
  }
];

export default function PrescriptionScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    let filtered = mockPrescriptions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(prescription =>
        prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(prescription => prescription.status === selectedFilter);
    }

    return filtered;
  }, [searchQuery, selectedFilter]);

  const handlePrescriptionPress = (prescription: any) => {
    Alert.alert('Prescription Details', `Viewing prescription for ${prescription.patientName}`);
  };

  const handleWritePrescription = () => {
    Alert.alert('Write Prescription', 'Opening prescription writer...');
  };

  const handleRefillPrescription = (prescription: any) => {
    Alert.alert('Refill Prescription', `Refilling prescription for ${prescription.patientName}`);
  };

  const PrescriptionCard = ({ prescription }: { prescription: any }) => (
    <TouchableOpacity 
      style={styles.prescriptionCard}
      onPress={() => handlePrescriptionPress(prescription)}
      activeOpacity={0.7}
    >
      <View style={styles.prescriptionHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{prescription.patientName}</Text>
          <Text style={styles.prescriptionDate}>{prescription.date}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: prescription.status === 'Active' ? '#10b981' : '#6b7280' }
        ]}>
          <Text style={styles.statusText}>{prescription.status}</Text>
        </View>
      </View>

      <View style={styles.medicationsList}>
        {prescription.medications.map((med: any, index: number) => (
          <View key={index} style={styles.medicationItem}>
            <Text style={styles.medicationName}>{med.name}</Text>
            <Text style={styles.medicationDetails}>
              {med.dosage} • {med.frequency}
            </Text>
          </View>
        ))}
      </View>

      {prescription.status === 'Active' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.refillButton}
            onPress={() => handleRefillPrescription(prescription)}
          >
            <Text style={styles.refillButtonText}>Refill</Text>
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
        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search prescriptions..."
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

        {/* Write Prescription Button */}
        <TouchableOpacity style={styles.writeButton} onPress={handleWritePrescription}>
          <Text style={styles.writeButtonIcon}>✍️</Text>
          <Text style={styles.writeButtonText}>Write New Prescription</Text>
        </TouchableOpacity>

        {/* Prescriptions List */}
        <Text style={styles.sectionTitle}>
          Prescriptions ({filteredPrescriptions.length})
        </Text>
        <View style={styles.prescriptionsList}>
          {filteredPrescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </View>

        {filteredPrescriptions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No prescriptions found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Write your first prescription'}
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
  writeButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  writeButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  writeButtonText: {
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
  prescriptionsList: {
    gap: 12,
  },
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  prescriptionHeader: {
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
  prescriptionDate: {
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
  medicationsList: {
    marginBottom: 12,
  },
  medicationItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  medicationDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  refillButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  refillButtonText: {
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
