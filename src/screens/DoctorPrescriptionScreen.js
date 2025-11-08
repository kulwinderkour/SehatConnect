import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';

/**
 * Doctor Prescription Screen
 * Allows doctors to create prescriptions with smart reminder support
 */

const FREQUENCY_OPTIONS = [
  { label: 'Once Daily', value: 'once_daily' },
  { label: 'Twice Daily', value: 'twice_daily' },
  { label: 'Thrice Daily', value: 'thrice_daily' },
  { label: 'Every 6 Hours', value: 'every_6_hours' },
  { label: 'Every 8 Hours', value: 'every_8_hours' },
  { label: 'Every 12 Hours', value: 'every_12_hours' },
  { label: 'As Needed', value: 'as_needed' },
  { label: 'Custom', value: 'custom' },
];

const TIMING_OPTIONS = [
  { label: 'Before Meal', value: 'before_meal' },
  { label: 'After Meal', value: 'after_meal' },
  { label: 'Anytime', value: 'anytime' },
];

const DEFAULT_TIME_SLOTS = {
  once_daily: [{ label: 'Morning', start: '07:00', end: '10:00' }],
  twice_daily: [
    { label: 'Morning', start: '07:00', end: '09:00' },
    { label: 'Night', start: '20:00', end: '22:00' },
  ],
  thrice_daily: [
    { label: 'Morning', start: '07:00', end: '09:00' },
    { label: 'Afternoon', start: '13:00', end: '15:00' },
    { label: 'Night', start: '20:00', end: '22:00' },
  ],
  every_6_hours: [
    { label: 'Morning', start: '06:00', end: '08:00' },
    { label: 'Noon', start: '12:00', end: '14:00' },
    { label: 'Evening', start: '18:00', end: '20:00' },
    { label: 'Night', start: '00:00', end: '02:00' },
  ],
  every_8_hours: [
    { label: 'Morning', start: '07:00', end: '09:00' },
    { label: 'Afternoon', start: '15:00', end: '17:00' },
    { label: 'Night', start: '23:00', end: '01:00' },
  ],
  every_12_hours: [
    { label: 'Morning', start: '07:00', end: '09:00' },
    { label: 'Night', start: '19:00', end: '21:00' },
  ],
};

const DoctorPrescriptionScreen = ({ route, navigation }) => {
  const { patientId, appointmentId, doctorId } = route.params;

  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([createEmptyMedication()]);

  function createEmptyMedication() {
    return {
      name: '',
      dosage: '',
      frequency: 'twice_daily',
      durationDays: '',
      duration: '',
      instructions: '',
      timing: 'after_meal',
      timeSlots: DEFAULT_TIME_SLOTS.twice_daily,
      customTimeSlots: [],
    };
  }

  const handleAddMedicine = () => {
    setMedications([...medications, createEmptyMedication()]);
  };

  const handleRemoveMedicine = (index) => {
    if (medications.length === 1) {
      Alert.alert('Error', 'At least one medication is required');
      return;
    }
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;

    // Auto-update time slots when frequency changes
    if (field === 'frequency') {
      if (value !== 'custom' && DEFAULT_TIME_SLOTS[value]) {
        updated[index].timeSlots = DEFAULT_TIME_SLOTS[value];
      } else if (value === 'custom') {
        updated[index].timeSlots = [];
      }
    }

    // Auto-calculate duration string from days
    if (field === 'durationDays') {
      const days = parseInt(value);
      if (!isNaN(days)) {
        updated[index].duration = days === 1 ? '1 day' : `${days} days`;
      }
    }

    setMedications(updated);
  };

  const handleAddCustomTimeSlot = (medIndex) => {
    const updated = [...medications];
    updated[medIndex].timeSlots.push({
      label: '',
      start: '07:00',
      end: '09:00',
    });
    setMedications(updated);
  };

  const handleTimeSlotChange = (medIndex, slotIndex, field, value) => {
    const updated = [...medications];
    updated[medIndex].timeSlots[slotIndex][field] = value;
    setMedications(updated);
  };

  const handleRemoveTimeSlot = (medIndex, slotIndex) => {
    const updated = [...medications];
    updated[medIndex].timeSlots.splice(slotIndex, 1);
    setMedications(updated);
  };

  const validateForm = () => {
    if (!diagnosis.trim()) {
      Alert.alert('Error', 'Please enter diagnosis');
      return false;
    }

    for (let i = 0; i < medications.length; i++) {
      const med = medications[i];

      if (!med.name.trim()) {
        Alert.alert('Error', `Medicine ${i + 1}: Name is required`);
        return false;
      }

      if (!med.dosage.trim()) {
        Alert.alert('Error', `Medicine ${i + 1}: Dosage is required`);
        return false;
      }

      if (!med.durationDays || parseInt(med.durationDays) <= 0) {
        Alert.alert('Error', `Medicine ${i + 1}: Valid duration is required`);
        return false;
      }

      if (med.frequency !== 'as_needed' && med.timeSlots.length === 0) {
        Alert.alert('Error', `Medicine ${i + 1}: Time slots are required`);
        return false;
      }

      // Validate time slots
      for (let j = 0; j < med.timeSlots.length; j++) {
        const slot = med.timeSlots[j];
        if (!slot.label.trim()) {
          Alert.alert('Error', `Medicine ${i + 1}, Slot ${j + 1}: Label is required`);
          return false;
        }
        if (slot.start >= slot.end) {
          Alert.alert('Error', `Medicine ${i + 1}, Slot ${j + 1}: End time must be after start time`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        patientId,
        doctorId,
        appointmentId,
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim().split(',').map(s => s.trim()).filter(Boolean),
        notes: notes.trim(),
        medications: medications.map(med => ({
          name: med.name.trim(),
          dosage: med.dosage.trim(),
          frequency: med.frequency,
          duration: med.duration,
          durationDays: parseInt(med.durationDays),
          instructions: med.instructions.trim(),
          timing: med.timing,
          timeSlots: med.timeSlots,
        })),
      };

      const response = await api.post('/prescriptions', payload);

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Prescription created successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create prescription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnosis & Symptoms</Text>
        
        <Text style={styles.label}>Diagnosis *</Text>
        <TextInput
          style={styles.input}
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="Enter diagnosis"
          multiline
        />

        <Text style={styles.label}>Symptoms (comma-separated)</Text>
        <TextInput
          style={styles.input}
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="e.g., Fever, Headache, Cough"
          multiline
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <TouchableOpacity onPress={handleAddMedicine} style={styles.addButton}>
            <Icon name="plus-circle" size={24} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>

        {medications.map((med, medIndex) => (
          <View key={medIndex} style={styles.medicineCard}>
            <View style={styles.medicineHeader}>
              <Text style={styles.medicineTitle}>Medicine {medIndex + 1}</Text>
              {medications.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveMedicine(medIndex)}>
                  <Icon name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Medicine Name / Salt *</Text>
            <TextInput
              style={styles.input}
              value={med.name}
              onChangeText={(val) => handleMedicineChange(medIndex, 'name', val)}
              placeholder="e.g., Paracetamol 500mg"
            />

            <Text style={styles.label}>Dosage *</Text>
            <TextInput
              style={styles.input}
              value={med.dosage}
              onChangeText={(val) => handleMedicineChange(medIndex, 'dosage', val)}
              placeholder="e.g., 1 tablet, 10ml"
            />

            <Text style={styles.label}>Frequency *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={med.frequency}
                onValueChange={(val) => handleMedicineChange(medIndex, 'frequency', val)}
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Duration (days) *</Text>
            <TextInput
              style={styles.input}
              value={med.durationDays}
              onChangeText={(val) => handleMedicineChange(medIndex, 'durationDays', val)}
              placeholder="e.g., 5"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Timing</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={med.timing}
                onValueChange={(val) => handleMedicineChange(medIndex, 'timing', val)}
              >
                {TIMING_OPTIONS.map(opt => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>

            {med.frequency !== 'as_needed' && (
              <>
                <View style={styles.timeSlotsHeader}>
                  <Text style={styles.label}>Time Windows</Text>
                  {med.frequency === 'custom' && (
                    <TouchableOpacity onPress={() => handleAddCustomTimeSlot(medIndex)}>
                      <Icon name="plus" size={20} color="#007AFF" />
                    </TouchableOpacity>
                  )}
                </View>

                {med.timeSlots.map((slot, slotIndex) => (
                  <View key={slotIndex} style={styles.timeSlotCard}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={slot.label}
                      onChangeText={(val) =>
                        handleTimeSlotChange(medIndex, slotIndex, 'label', val)
                      }
                      placeholder="e.g., Morning"
                      editable={med.frequency === 'custom'}
                    />

                    <View style={styles.timeInputRow}>
                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>Start</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={slot.start}
                          onChangeText={(val) =>
                            handleTimeSlotChange(medIndex, slotIndex, 'start', val)
                          }
                          placeholder="07:00"
                        />
                      </View>

                      <Text style={styles.timeSeparator}>to</Text>

                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>End</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={slot.end}
                          onChangeText={(val) =>
                            handleTimeSlotChange(medIndex, slotIndex, 'end', val)
                          }
                          placeholder="09:00"
                        />
                      </View>

                      {med.frequency === 'custom' && (
                        <TouchableOpacity
                          onPress={() => handleRemoveTimeSlot(medIndex, slotIndex)}
                          style={styles.removeSlotButton}
                        >
                          <Icon name="delete" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={styles.input}
              value={med.instructions}
              onChangeText={(val) => handleMedicineChange(medIndex, 'instructions', val)}
              placeholder="e.g., Take with plenty of water"
              multiline
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional instructions or notes"
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Prescription</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    minHeight: 80,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  medicineCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  timeSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  timeSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  removeSlotButton: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DoctorPrescriptionScreen;
