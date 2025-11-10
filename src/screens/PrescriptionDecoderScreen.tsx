/**
 * Prescription Decoder Screen
 * Displays decoded prescription with all features
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation.d';
import prescriptionDecoderService, { DecodedPrescription, Medication } from '../services/PrescriptionDecoderService';
import medicineReminderService from '../services/MedicineReminderService';
import { useAuth } from '../contexts/AuthContext';

type PrescriptionDecoderScreenRouteProp = RouteProp<RootStackParamList, 'PrescriptionDecoder'>;
type PrescriptionDecoderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrescriptionDecoder'>;

const { width } = Dimensions.get('window');

const PrescriptionDecoderScreen = () => {
  const navigation = useNavigation<PrescriptionDecoderScreenNavigationProp>();
  const route = useRoute<PrescriptionDecoderScreenRouteProp>();
  const { user } = useAuth();
  const { prescription: initialPrescription, imageUri } = route.params;

  const [prescription, setPrescription] = useState<DecodedPrescription>(initialPrescription);
  const [isScheduling, setIsScheduling] = useState(false);
  const [remindersScheduled, setRemindersScheduled] = useState(initialPrescription.remindersScheduled || false);

  // Calculate today's health actions
  const todaysActions = useMemo(() => {
    const actions: string[] = [];
    
    // Add medication actions
    prescription.medications.forEach(med => {
      if (med.times && med.times.length > 0) {
        const todayTimes = med.times.filter(time => {
          const [hours] = time.split(':').map(Number);
          const now = new Date();
          return hours >= now.getHours();
        });
        if (todayTimes.length > 0) {
          actions.push(`Take ${med.name} ${med.dosage} by ${todayTimes[todayTimes.length - 1]}`);
        }
      }
    });

    // Add test actions
    prescription.tests.forEach(test => {
      if (test.urgency === 'urgent' || test.urgency === 'asap') {
        actions.push(`Get ${test.name} test (${test.urgency})`);
      } else {
        actions.push(`Get ${test.name} test`);
      }
    });

    return actions;
  }, [prescription]);

  // Schedule reminders for all medications
  const scheduleReminders = useCallback(async () => {
    try {
      setIsScheduling(true);

      const reminderPromises = prescription.medications.map(async (med: Medication) => {
        if (!med.times || med.times.length === 0) {
          return;
        }

        // Calculate duration in days
        let durationDays = 7; // Default
        if (med.duration) {
          const durationMatch = med.duration.match(/(\d+)\s*(day|days|week|weeks)/i);
          if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            durationDays = unit.includes('week') ? value * 7 : value;
          }
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        const reminder = {
          id: `prescription-${Date.now()}-${med.name}`,
          medicineName: med.name,
          dosage: `${med.dosage} ${med.form}`,
          frequency: med.normalizedFrequency || med.frequency,
          times: med.times,
          startDate,
          endDate,
          instructions: med.notes || '',
          beforeMeal: med.notes?.toLowerCase().includes('before') || false,
          afterMeal: med.notes?.toLowerCase().includes('after') || false,
          withMeal: med.notes?.toLowerCase().includes('with') || false,
          enableVoice: true,
        };

        await medicineReminderService.scheduleReminder(reminder);
      });

      await Promise.all(reminderPromises);

      setRemindersScheduled(true);
      setPrescription(prev => ({ ...prev, remindersScheduled: true }));

      Alert.alert(
        'Reminders Scheduled!',
        `Successfully scheduled reminders for ${prescription.medications.length} medication(s).`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error scheduling reminders:', error);
      Alert.alert('Error', 'Failed to schedule reminders. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  }, [prescription]);

  // Save prescription
  const savePrescription = useCallback(async () => {
    try {
      const response = await prescriptionDecoderService.savePrescription(prescription);
      Alert.alert(
        'Success', 
        'Prescription saved to your health records!', 
        [
          { 
            text: 'View Records', 
            onPress: () => navigation.navigate('Records' as any)
          },
          { text: 'OK' }
        ]
      );
    } catch (error: any) {
      console.error('Error saving prescription:', error);
      Alert.alert('Error', error.message || 'Failed to save prescription. Please try again.');
    }
  }, [prescription, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MediScript AI</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Confidence Score */}
        <View style={styles.confidenceCard}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>Confidence Score</Text>
            <Text style={styles.confidenceValue}>
              {prescription.confidence > 1 
                ? prescription.confidence.toFixed(0)
                : (prescription.confidence * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { 
                  width: `${prescription.confidence > 1 
                    ? prescription.confidence 
                    : prescription.confidence * 100}%` 
                },
                prescription.confidence >= 80 || prescription.confidence >= 0.8
                  ? styles.confidenceHigh
                  : prescription.confidence >= 60 || prescription.confidence >= 0.6
                  ? styles.confidenceMedium
                  : styles.confidenceLow,
              ]}
            />
          </View>
          {prescription.needsReview && (
            <Text style={styles.reviewFlag}>
              ⚠️ Needs Review: {prescription.reviewFlags?.join(', ')}
            </Text>
          )}
        </View>

        {/* Today's Health Actions */}
        {todaysActions.length > 0 && (
          <View style={styles.todaysActionsCard}>
            <View style={styles.todaysActionsHeader}>
              <Text style={styles.todaysActionsTitle}>🩺 TODAY'S PLAN</Text>
            </View>
            {todaysActions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <Text style={styles.actionBullet}>•</Text>
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Prescription Image */}
        {imageUri && (
          <View style={styles.imageCard}>
            <Text style={styles.sectionTitle}>Prescription Image</Text>
            <Image source={{ uri: imageUri }} style={styles.prescriptionImage} resizeMode="contain" />
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{prescription.summary}</Text>
        </View>

        {/* Medications */}
        <View style={styles.medicationsCard}>
          <Text style={styles.sectionTitle}>Medications ({prescription.medications.length})</Text>
          {prescription.medications.map((med, index) => (
            <View key={index} style={styles.medicationItem}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationStrength}>{med.strength}</Text>
              </View>
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationDetail}>
                  📋 <Text style={styles.detailLabel}>Dosage:</Text> {med.dosage} {med.form}
                </Text>
                <Text style={styles.medicationDetail}>
                  ⏰ <Text style={styles.detailLabel}>Frequency:</Text> {med.normalizedFrequency || med.frequency}
                  {med.times && med.times.length > 0 && ` (${med.times.join(', ')})`}
                </Text>
                {med.duration && (
                  <Text style={styles.medicationDetail}>
                    📅 <Text style={styles.detailLabel}>Duration:</Text> {med.duration}
                  </Text>
                )}
                {med.notes && (
                  <Text style={styles.medicationDetail}>
                    💡 <Text style={styles.detailLabel}>Notes:</Text> {med.notes}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Lab Tests */}
        {prescription.tests.length > 0 && (
          <View style={styles.testsCard}>
            <Text style={styles.sectionTitle}>Lab Tests ({prescription.tests.length})</Text>
            {prescription.tests.map((test, index) => (
              <View key={index} style={styles.testItem}>
                <View style={styles.testCheckbox}>
                  <Text style={styles.testCheckboxText}>☐</Text>
                </View>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  {test.urgency && (
                    <Text
                      style={[
                        styles.testUrgency,
                        test.urgency === 'urgent' || test.urgency === 'asap'
                          ? styles.testUrgencyHigh
                          : styles.testUrgencyNormal,
                      ]}
                    >
                      {test.urgency.toUpperCase()}
                    </Text>
                  )}
                  {test.notes && <Text style={styles.testNotes}>{test.notes}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Safety Alerts */}
        {prescription.safetyAlerts.length > 0 && (
          <View style={styles.alertsCard}>
            <Text style={styles.sectionTitle}>⚠️ Safety Alerts</Text>
            {prescription.safetyAlerts.map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pharmacy Ready List */}
        {prescription.pharmacyReadyList && prescription.pharmacyReadyList.length > 0 && (
          <View style={styles.pharmacyCard}>
            <Text style={styles.sectionTitle}>Pharmacy-Ready List</Text>
            {prescription.pharmacyReadyList.map((item, index) => (
              <Text key={index} style={styles.pharmacyItem}>
                {item}
              </Text>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!remindersScheduled && (
            <TouchableOpacity
              style={[styles.actionButton, styles.scheduleButton]}
              onPress={scheduleReminders}
              disabled={isScheduling}
            >
              {isScheduling ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>📅 Schedule Reminders</Text>
              )}
            </TouchableOpacity>
          )}
          {remindersScheduled && (
            <View style={styles.scheduledBadge}>
              <Text style={styles.scheduledText}>✓ Reminders Scheduled</Text>
            </View>
          )}
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={savePrescription}>
            <Text style={styles.actionButtonText}>💾 Save to Records</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1E88E5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E2A4A',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  confidenceCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E2A4A',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceHigh: {
    backgroundColor: '#4CAF50',
  },
  confidenceMedium: {
    backgroundColor: '#FF9800',
  },
  confidenceLow: {
    backgroundColor: '#F44336',
  },
  reviewFlag: {
    marginTop: 8,
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  todaysActionsCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  todaysActionsHeader: {
    marginBottom: 12,
  },
  todaysActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2A4A',
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionBullet: {
    fontSize: 16,
    color: '#2196F3',
    marginRight: 8,
    fontWeight: '700',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#1E2A4A',
    lineHeight: 20,
  },
  imageCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prescriptionImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E2A4A',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  medicationsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2A4A',
    flex: 1,
  },
  medicationStrength: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  medicationDetails: {
    marginTop: 8,
  },
  medicationDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#1E2A4A',
  },
  testsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  testCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#1E88E5',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testCheckboxText: {
    fontSize: 16,
    color: '#1E88E5',
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E2A4A',
    marginBottom: 4,
  },
  testUrgency: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  testUrgencyHigh: {
    color: '#F44336',
  },
  testUrgencyNormal: {
    color: '#FF9800',
  },
  testNotes: {
    fontSize: 13,
    color: '#666',
  },
  alertsCard: {
    backgroundColor: '#FFEBEE',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertItem: {
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
  },
  pharmacyCard: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  pharmacyItem: {
    fontSize: 14,
    color: '#1E2A4A',
    marginBottom: 8,
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleButton: {
    backgroundColor: '#1E88E5',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  scheduledBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  scheduledText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
});

export default PrescriptionDecoderScreen;

