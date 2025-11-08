import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, Plus, Trash2, Clock } from 'lucide-react-native';

interface TimeEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (times: string[]) => void;
  currentTimes: string[];
  medicineName: string;
}

const TimeEditorModal: React.FC<TimeEditorModalProps> = ({
  visible,
  onClose,
  onSave,
  currentTimes,
  medicineName,
}) => {
  const [times, setTimes] = useState<string[]>(currentTimes || []);
  const [showPicker, setShowPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempTime, setTempTime] = useState(new Date());

  const formatTime = (timeString: string): string => {
    return timeString; // Already in HH:mm format
  };

  const formatTimeDisplay = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAddTime = () => {
    setEditingIndex(null);
    const now = new Date();
    now.setHours(9, 0, 0, 0); // Default to 9:00 AM
    setTempTime(now);
    setShowPicker(true);
  };

  const handleEditTime = (index: number) => {
    const timeString = times[index];
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    setTempTime(date);
    setEditingIndex(index);
    setShowPicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker closes automatically
    if (Platform.OS === 'android') {
      setShowPicker(false);
      // On Android, if user cancels, event.type will be 'dismissed'
      if (event.type === 'dismissed') {
        setEditingIndex(null);
        return;
      }
    }

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      if (editingIndex !== null) {
        // Edit existing time
        const newTimes = [...times];
        newTimes[editingIndex] = timeString;
        setTimes(newTimes.sort());
      } else {
        // Add new time
        const newTimes = [...times, timeString];
        setTimes(newTimes.sort());
      }
    }

    // On iOS, we keep the picker open until user confirms
    // The picker will be closed when user taps Save or Cancel
    if (Platform.OS === 'ios') {
      // Don't close picker on iOS - let user confirm
    }
    
    // Reset editing index after processing
    if (Platform.OS === 'android') {
      setEditingIndex(null);
    }
  };

  const handleRemoveTime = (index: number) => {
    if (times.length <= 1) {
      Alert.alert('Error', 'At least one reminder time is required');
      return;
    }
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  const handleSave = () => {
    if (times.length === 0) {
      Alert.alert('Error', 'Please add at least one reminder time');
      return;
    }
    setShowPicker(false);
    setEditingIndex(null);
    onSave(times);
    onClose();
  };

  const handleCancel = () => {
    setShowPicker(false);
    setEditingIndex(null);
    setTimes(currentTimes || []);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Clock size={24} color="#4F46E5" />
              <View>
                <Text style={styles.modalTitle}>Edit Reminder Times</Text>
                <Text style={styles.medicineName}>{medicineName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.instructionText}>
              Set custom times for your medicine reminder. You can add multiple times per day.
            </Text>

            <View style={styles.timesList}>
              {times.map((time, index) => (
                <View key={index} style={styles.timeItem}>
                  <View style={styles.timeItemLeft}>
                    <Clock size={18} color="#4F46E5" />
                    <Text style={styles.timeText}>{formatTimeDisplay(time)}</Text>
                    <Text style={styles.timeRaw}>({time})</Text>
                  </View>
                  <View style={styles.timeItemActions}>
                    <TouchableOpacity
                      onPress={() => handleEditTime(index)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveTime(index)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {times.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No times added yet</Text>
                  <Text style={styles.emptySubtext}>Tap the button below to add a time</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleAddTime}
              style={styles.addButton}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Time</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.footerButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.footerButton, styles.saveButton]}
            >
              <Text style={styles.saveButtonText}>Save Times</Text>
            </TouchableOpacity>
          </View>

          {showPicker && Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
            </View>
          )}
        </View>
      </View>
      
      {/* Android DateTimePicker - rendered outside modal as it's a system dialog */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  medicineName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  timesList: {
    gap: 12,
    marginBottom: 20,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timeRaw: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  timeItemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pickerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  timePicker: {
    width: '100%',
    height: 200,
  },
});

export default TimeEditorModal;

