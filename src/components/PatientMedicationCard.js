import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useReminderScheduler } from '../hooks/useReminderScheduler';

/**
 * Patient Medication Card Component
 * Displays active medication with time picker and intake tracking
 */

const PatientMedicationCard = ({ medication, onUpdate }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [tempTime, setTempTime] = useState(new Date());

  const {
    scheduleMedicationReminders,
    markAsTaken,
    snoozeReminder,
    skipDose,
    isScheduling,
  } = useReminderScheduler(medication.patientId);

  const handleSetTime = (slotIndex) => {
    const slot = medication.timeSlots[slotIndex];
    const chosenTime = medication.chosenTimes?.find(ct => ct.label === slot.label);

    if (chosenTime) {
      // Parse existing chosen time
      const [hours, minutes] = chosenTime.time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setTempTime(date);
    } else {
      // Use start of time slot as default
      const [hours, minutes] = slot.start.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setTempTime(date);
    }

    setSelectedSlotIndex(slotIndex);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setTempTime(selectedDate);
      if (Platform.OS === 'ios') {
        // On iOS, wait for user to confirm
        return;
      }
      confirmTimeSelection(selectedDate);
    }
  };

  const confirmTimeSelection = async (selectedDate = tempTime) => {
    const slot = medication.timeSlots[selectedSlotIndex];
    const selectedHours = selectedDate.getHours();
    const selectedMinutes = selectedDate.getMinutes();
    const timeString = `${String(selectedHours).padStart(2, '0')}:${String(selectedMinutes).padStart(2, '0')}`;

    // Validate time is within allowed range
    const selectedTotalMinutes = selectedHours * 60 + selectedMinutes;
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    if (selectedTotalMinutes < startTotalMinutes || selectedTotalMinutes > endTotalMinutes) {
      Alert.alert(
        'Invalid Time',
        `Please select a time between ${slot.start} and ${slot.end}`
      );
      return;
    }

    // Update chosen times
    const updatedChosenTimes = medication.chosenTimes || [];
    const existingIndex = updatedChosenTimes.findIndex(ct => ct.label === slot.label);

    if (existingIndex >= 0) {
      updatedChosenTimes[existingIndex].time = timeString;
    } else {
      updatedChosenTimes.push({
        label: slot.label,
        time: timeString,
      });
    }

    // Check if all time slots have been set
    const allSlotsSet = medication.timeSlots.every(slot =>
      updatedChosenTimes.some(ct => ct.label === slot.label)
    );

    if (allSlotsSet) {
      // Schedule reminders
      Alert.alert(
        'Schedule Reminders?',
        'All time slots are set. Would you like to schedule reminders now?',
        [
          {
            text: 'Later',
            onPress: () => {
              onUpdate({ ...medication, chosenTimes: updatedChosenTimes });
              setShowTimePicker(false);
            },
          },
          {
            text: 'Schedule',
            onPress: async () => {
              const result = await scheduleMedicationReminders(
                medication.prescriptionId,
                medication.medicineIndex,
                updatedChosenTimes
              );

              if (result.success) {
                Alert.alert(
                  'Success',
                  `Scheduled ${result.totalReminders} reminders`
                );
                onUpdate({ ...medication, chosenTimes: updatedChosenTimes });
              }
              setShowTimePicker(false);
            },
          },
        ]
      );
    } else {
      onUpdate({ ...medication, chosenTimes: updatedChosenTimes });
      setShowTimePicker(false);
    }
  };

  const handleMarkTaken = async (chosenTime) => {
    Alert.alert(
      'Mark as Taken',
      `Did you take ${medication.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            const result = await markAsTaken(
              chosenTime.intakeId,
              chosenTime.notificationId
            );

            if (result.success) {
              Alert.alert('Success', 'Medication marked as taken');
              onUpdate();
            }
          },
        },
      ]
    );
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      once_daily: 'Once daily',
      twice_daily: 'Twice daily',
      thrice_daily: 'Thrice daily',
      every_6_hours: 'Every 6 hours',
      every_8_hours: 'Every 8 hours',
      every_12_hours: 'Every 12 hours',
      as_needed: 'As needed',
    };
    return labels[frequency] || frequency;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="pill" size={24} color="#007AFF" />
          <View style={styles.headerText}>
            <Text style={styles.medicineName}>{medication.name}</Text>
            <Text style={styles.dosage}>{medication.dosage}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Icon name="clock-outline" size={16} color="#666" />
        <Text style={styles.infoText}>{getFrequencyLabel(medication.frequency)}</Text>
        <Text style={styles.separator}>•</Text>
        <Icon name="calendar" size={16} color="#666" />
        <Text style={styles.infoText}>{medication.daysLeft} days left</Text>
      </View>

      {medication.timing && (
        <View style={styles.timingBadge}>
          <Text style={styles.timingText}>{medication.timing.replace('_', ' ')}</Text>
        </View>
      )}

      {medication.instructions && (
        <View style={styles.instructionsBox}>
          <Icon name="information-outline" size={16} color="#007AFF" />
          <Text style={styles.instructions}>{medication.instructions}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <Text style={styles.slotsTitle}>Reminder Times</Text>

      {medication.timeSlots?.map((slot, index) => {
        const chosenTime = medication.chosenTimes?.find(ct => ct.label === slot.label);

        return (
          <View key={index} style={styles.slotRow}>
            <View style={styles.slotInfo}>
              <Text style={styles.slotLabel}>{slot.label}</Text>
              <Text style={styles.slotRange}>
                {formatTime(slot.start)} - {formatTime(slot.end)}
              </Text>
            </View>

            {chosenTime ? (
              <View style={styles.chosenTimeContainer}>
                <View style={styles.chosenTime}>
                  <Icon name="check-circle" size={16} color="#34C759" />
                  <Text style={styles.chosenTimeText}>{formatTime(chosenTime.time)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSetTime(index)}
                  style={styles.changeButton}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleSetTime(index)}
                style={styles.setTimeButton}
              >
                <Icon name="clock-plus-outline" size={18} color="#007AFF" />
                <Text style={styles.setTimeButtonText}>Set Time</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {medication.chosenTimes?.length > 0 && (
        <View style={styles.actionsContainer}>
          {medication.chosenTimes.map((chosenTime, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleMarkTaken(chosenTime)}
              style={styles.markTakenButton}
            >
              <Icon name="check-bold" size={18} color="#fff" />
              <Text style={styles.markTakenButtonText}>
                Mark {chosenTime.label} Taken
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal
        visible={showTimePicker && Platform.OS === 'ios'}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Time for {medication.timeSlots[selectedSlotIndex]?.label}
              </Text>
            </View>

            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              style={styles.timePicker}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmTimeSelection()}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  separator: {
    marginHorizontal: 8,
    color: '#999',
  },
  timingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  timingText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  instructionsBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  instructions: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  slotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  slotInfo: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  slotRange: {
    fontSize: 13,
    color: '#666',
  },
  chosenTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chosenTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chosenTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 4,
  },
  changeButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  setTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setTimeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  markTakenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  markTakenButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  timePicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PatientMedicationCard;
