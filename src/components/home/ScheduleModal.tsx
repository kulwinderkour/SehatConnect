import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Doctor, AppointmentBookingForm } from '../../types/health';

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onBookAppointment: (form: AppointmentBookingForm) => void;
  selectedDoctor?: Doctor;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  visible,
  onClose,
  doctors,
  onBookAppointment,
  selectedDoctor
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(selectedDoctor?.id || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState<'video-consultation' | 'phone-consultation' | 'in-person'>('video-consultation');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setSelectedDoctorId(selectedDoctor?.id || '');
      setSelectedDate('');
      setSelectedTime('');
      setSelectedType('video-consultation');
      setSymptoms([]);
      setNotes('');
      setCurrentStep(1);
    }
  }, [visible, selectedDoctor]);

  const selectedDoctorData = useMemo(() => 
    doctors.find(doc => doc.id === selectedDoctorId), 
    [doctors, selectedDoctorId]
  );

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return dates;
  }, []);

  const availableTimes = useMemo(() => {
    if (!selectedDoctorData || !selectedDate) return [];
    
    // Generate time slots based on doctor's working hours
    const times = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({
          time: timeString,
          display: new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          isAvailable: Math.random() > 0.3, // Mock availability
        });
      }
    }
    
    return times;
  }, [selectedDoctorData, selectedDate]);

  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Dizziness',
    'Chest Pain', 'Shortness of Breath', 'Abdominal Pain', 'Joint Pain'
  ];

  const appointmentTypes = [
    { id: 'video-consultation', label: 'Video Consultation', icon: '📹', price: 'Free' },
    { id: 'phone-consultation', label: 'Phone Consultation', icon: '📞', price: 'Free' },
    { id: 'in-person', label: 'In-Person Visit', icon: '🏥', price: 'Free' },
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleBookAppointment = () => {
    if (!selectedDoctorId || !selectedDate || !selectedTime) return;

    const form: AppointmentBookingForm = {
      doctorId: selectedDoctorId,
      date: selectedDate,
      time: selectedTime,
      type: selectedType,
      symptoms,
      notes,
    };

    onBookAppointment(form);
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedDoctorId('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedType('video-consultation');
    setSymptoms([]);
    setNotes('');
    setCurrentStep(1);
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedDoctorId !== '';
      case 2: return selectedDate !== '';
      case 3: return selectedTime !== '';
      case 4: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map(step => (
        <View
          key={step}
          style={[
            styles.stepDot,
            currentStep >= step && styles.stepDotActive
          ]}
        />
      ))}
    </View>
  );

  const renderAppointmentDetails = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Appointment Details</Text>
      
      <View style={styles.appointmentTypeSection}>
        <Text style={styles.sectionTitle}>Appointment Type</Text>
        {appointmentTypes.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeOption,
              selectedType === type.id && styles.typeOptionSelected
            ]}
            onPress={() => setSelectedType(type.id as any)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <View style={styles.typeInfo}>
              <Text style={styles.typeLabel}>{type.label}</Text>
              <Text style={styles.typePrice}>{type.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.symptomsSection}>
        <Text style={styles.sectionTitle}>Symptoms (Optional)</Text>
        <View style={styles.symptomsGrid}>
          {commonSymptoms.map(symptom => (
            <TouchableOpacity
              key={symptom}
              style={[
                styles.symptomChip,
                symptoms.includes(symptom) && styles.symptomChipSelected
              ]}
              onPress={() => handleSymptomToggle(symptom)}
            >
              <Text style={[
                styles.symptomText,
                symptoms.includes(symptom) && styles.symptomTextSelected
              ]}>
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Describe your symptoms or concerns..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholderTextColor="#9ca3af"
        />
      </View>
    </ScrollView>
  );

  const renderBookingSummary = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Booking Summary</Text>
      
      {/* Doctor Information */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>👩‍⚕️</Text>
          <Text style={styles.cardTitle}>Doctor</Text>
        </View>
        <View style={styles.doctorSummary}>
          <Text style={styles.doctorEmojiLarge}>{selectedDoctorData?.emoji || '👩‍⚕️'}</Text>
          <View style={styles.doctorSummaryInfo}>
            <Text style={styles.doctorSummaryName}>{selectedDoctorData?.name || 'No doctor selected'}</Text>
            <Text style={styles.doctorSummarySpecialty}>{selectedDoctorData?.specialty || 'No specialty'}</Text>
            <Text style={styles.doctorSummaryRating}>⭐ {selectedDoctorData?.rating || '0'} ({selectedDoctorData?.reviewCount || '0'} reviews)</Text>
          </View>
        </View>
      </View>

      {/* Appointment Date & Time */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>Date & Time</Text>
        </View>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <Text style={styles.dateTimeLabel}>Date</Text>
            <Text style={styles.dateTimeValue}>{selectedDate ? formatDate(selectedDate) : 'No date selected'}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Text style={styles.dateTimeLabel}>Time</Text>
            <Text style={styles.dateTimeValue}>{selectedTime ? formatTime(selectedTime) : 'No time selected'}</Text>
          </View>
        </View>
      </View>

      {/* Appointment Type */}
      <View style={styles.summaryCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📱</Text>
          <Text style={styles.cardTitle}>Consultation Type</Text>
        </View>
        <View style={styles.consultationSummary}>
          <Text style={styles.consultationIcon}>
            {appointmentTypes.find(type => type.id === selectedType)?.icon}
          </Text>
          <View style={styles.consultationSummaryInfo}>
            <Text style={styles.consultationSummaryLabel}>
              {appointmentTypes.find(type => type.id === selectedType)?.label}
            </Text>
            <Text style={styles.consultationSummaryPrice}>
              {appointmentTypes.find(type => type.id === selectedType)?.price}
            </Text>
          </View>
        </View>
      </View>

      {/* Symptoms */}
      {symptoms.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🩺</Text>
            <Text style={styles.cardTitle}>Symptoms</Text>
          </View>
          <View style={styles.summarySymptoms}>
            {symptoms.map(symptom => (
              <View key={symptom} style={styles.summarySymptomTag}>
                <Text style={styles.summarySymptomText}>{symptom}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Notes */}
      {notes && (
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardTitle}>Additional Notes</Text>
          </View>
          <Text style={styles.summaryNotesText}>{notes}</Text>
        </View>
      )}

      {/* Important Information */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>ℹ️</Text>
          <Text style={[styles.cardTitle, { color: '#0369a1' }]}>Important Information</Text>
        </View>
        <Text style={styles.infoText}>• Please join the consultation 5 minutes before the scheduled time</Text>
        <Text style={styles.infoText}>• You will receive a confirmation email with meeting details</Text>
        <Text style={styles.infoText}>• Cancellation is free up to 2 hours before the appointment</Text>
        <Text style={styles.infoText}>• Have your medical history and current medications ready</Text>
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: 
        return (
          <View key="step-1-doctor-selection">
            <Text style={styles.stepTitle}>Select a Doctor</Text>
            <FlatList
              data={doctors}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.doctorOption,
                    selectedDoctorId === item.id && styles.doctorOptionSelected
                  ]}
                  onPress={() => setSelectedDoctorId(item.id)}
                >
                  <View style={styles.doctorOptionContent}>
                    <Text style={styles.doctorEmoji}>{item.emoji}</Text>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{item.name}</Text>
                      <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                      <Text style={styles.doctorRating}>⭐ {item.rating} ({item.reviewCount} reviews)</Text>
                    </View>
                    <Text style={styles.doctorFee}>
                      {item.consultationFee === 0 ? 'Free' : `₹${item.consultationFee}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      case 2: 
        return (
          <View key="step-2-date-selection">
            <Text style={styles.stepTitle}>Select Date</Text>
            <FlatList
              data={availableDates}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dateOption,
                    selectedDate === item.date && styles.dateOptionSelected
                  ]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text style={[
                    styles.dateText,
                    selectedDate === item.date && styles.dateTextSelected
                  ]}>
                    {item.display}
                  </Text>
                  {item.isToday && <Text style={styles.todayLabel}>Today</Text>}
                  {item.isTomorrow && <Text style={styles.tomorrowLabel}>Tomorrow</Text>}
                </TouchableOpacity>
              )}
              numColumns={2}
              columnWrapperStyle={styles.dateRow}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      case 3: 
        return (
          <View key="step-3-time-selection">
            <Text style={styles.stepTitle}>Select Time</Text>
            <FlatList
              data={availableTimes}
              keyExtractor={(item) => item.time}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeOption,
                    selectedTime === item.time && styles.timeOptionSelected,
                    !item.isAvailable && styles.timeOptionDisabled
                  ]}
                  onPress={() => item.isAvailable && setSelectedTime(item.time)}
                  disabled={!item.isAvailable}
                >
                  <Text style={[
                    styles.timeText,
                    selectedTime === item.time && styles.timeTextSelected,
                    !item.isAvailable && styles.timeTextDisabled
                  ]}>
                    {item.display}
                  </Text>
                </TouchableOpacity>
              )}
              numColumns={3}
              columnWrapperStyle={styles.timeRow}
              showsVerticalScrollIndicator={false}
            />
          </View>
        );
      case 4: 
        return renderBookingSummary();
      default: return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={styles.placeholder} />
        </View>

        {renderStepIndicator()}

        <View style={styles.content}>
          {renderCurrentStep()}
        </View>

        <View style={styles.footer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled
            ]}
            onPress={currentStep === 4 ? handleBookAppointment : nextStep}
            disabled={!canProceed()}
          >
            <Text style={[
              styles.nextButtonText,
              !canProceed() && styles.nextButtonTextDisabled
            ]}>
              {currentStep === 4 ? 'Confirm Booking' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  doctorOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  doctorOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fdf4',
  },
  doctorOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  doctorRating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  doctorFee: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  dateRow: {
    justifyContent: 'space-between',
  },
  dateOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fdf4',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dateTextSelected: {
    color: '#4CAF50',
  },
  todayLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  tomorrowLabel: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 4,
  },
  timeRow: {
    justifyContent: 'space-between',
  },
  timeOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fdf4',
  },
  timeOptionDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  timeTextSelected: {
    color: '#4CAF50',
  },
  timeTextDisabled: {
    color: '#9ca3af',
  },
  appointmentTypeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fdf4',
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  typePrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  symptomsSection: {
    marginBottom: 24,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  symptomChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  symptomText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  symptomTextSelected: {
    color: '#fff',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextButtonTextDisabled: {
    color: '#9ca3af',
  },
  // New styles for booking summary
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorEmojiLarge: {
    fontSize: 32,
    marginRight: 12,
  },
  doctorSummaryInfo: {
    flex: 1,
  },
  doctorSummaryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSummarySpecialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  doctorSummaryRating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  consultationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consultationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  consultationSummaryInfo: {
    flex: 1,
  },
  consultationSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  consultationSummaryPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  summarySymptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summarySymptomTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
  },
  summarySymptomText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  summaryNotesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0c4a6e',
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default ScheduleModal;