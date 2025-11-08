import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PatientMedicationCard from '../components/PatientMedicationCard';
import api from '../services/api';

/**
 * Patient Health Record Screen
 * Shows active medications, medical history, and health records
 */

const TABS = {
  ACTIVE_MEDICATIONS: 'active_medications',
  PRESCRIPTIONS: 'prescriptions',
  RECORDS: 'records',
  HISTORY: 'history',
};

const PatientHealthRecordScreen = ({ route, navigation }) => {
  const { patientId } = route.params || {};
  
  const [activeTab, setActiveTab] = useState(TABS.ACTIVE_MEDICATIONS);
  const [activeMedications, setActiveMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadActiveMedications = async () => {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}/active-medications`);
      setActiveMedications(response.data.data);
    } catch (error) {
      console.error('Error loading active medications:', error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}`);
      setPrescriptions(response.data.data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === TABS.ACTIVE_MEDICATIONS) {
        await loadActiveMedications();
      } else if (activeTab === TABS.PRESCRIPTIONS) {
        await loadPrescriptions();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activeTab])
  );

  const renderTabButton = (tab, label, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon
        name={icon}
        size={20}
        color={activeTab === tab ? '#007AFF' : '#666'}
      />
      <Text
        style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderActiveMedications = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (activeMedications.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="pill-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No Active Medications</Text>
          <Text style={styles.emptySubtext}>
            Your prescribed medications will appear here
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.medicationsHeader}>
          <Text style={styles.medicationsCount}>
            {activeMedications.length} Active Medication{activeMedications.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {activeMedications.map((medication, index) => (
          <PatientMedicationCard
            key={`${medication.prescriptionId}-${medication.medicineIndex}`}
            medication={medication}
            onUpdate={loadActiveMedications}
          />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    );
  };

  const renderPrescriptions = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (prescriptions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="file-document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No Prescriptions</Text>
          <Text style={styles.emptySubtext}>
            Your prescription history will appear here
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {prescriptions.map((prescription) => (
          <TouchableOpacity
            key={prescription._id}
            style={styles.prescriptionCard}
            onPress={() =>
              navigation.navigate('PrescriptionDetail', {
                prescriptionId: prescription._id,
              })
            }
          >
            <View style={styles.prescriptionHeader}>
              <View style={styles.doctorInfo}>
                <Icon name="doctor" size={20} color="#007AFF" />
                <Text style={styles.doctorName}>
                  Dr. {prescription.doctorId?.name}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  prescription.status === 'active' && styles.statusBadgeActive,
                  prescription.status === 'completed' && styles.statusBadgeCompleted,
                ]}
              >
                <Text style={styles.statusText}>{prescription.status}</Text>
              </View>
            </View>

            <Text style={styles.diagnosis}>{prescription.diagnosis}</Text>

            <View style={styles.prescriptionMeta}>
              <View style={styles.metaItem}>
                <Icon name="pill" size={16} color="#666" />
                <Text style={styles.metaText}>
                  {prescription.medications?.length || 0} medicine(s)
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="calendar" size={16} color="#666" />
                <Text style={styles.metaText}>
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case TABS.ACTIVE_MEDICATIONS:
        return renderActiveMedications();
      case TABS.PRESCRIPTIONS:
        return renderPrescriptions();
      case TABS.RECORDS:
        return (
          <View style={styles.emptyContainer}>
            <Icon name="file-document" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Medical Records</Text>
            <Text style={styles.emptySubtext}>Coming soon</Text>
          </View>
        );
      case TABS.HISTORY:
        return (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Intake History</Text>
            <Text style={styles.emptySubtext}>Coming soon</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Records</Text>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton(TABS.ACTIVE_MEDICATIONS, 'Active Meds', 'pill')}
          {renderTabButton(TABS.PRESCRIPTIONS, 'Prescriptions', 'file-document')}
          {renderTabButton(TABS.RECORDS, 'Records', 'folder')}
          {renderTabButton(TABS.HISTORY, 'History', 'history')}
        </ScrollView>
      </View>

      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  medicationsHeader: {
    marginBottom: 16,
  },
  medicationsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  prescriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  statusBadgeActive: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeCompleted: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  diagnosis: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  prescriptionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default PatientHealthRecordScreen;
