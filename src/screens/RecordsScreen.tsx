import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Pill, Clock, Bell, BellOff, CheckCircle, XCircle, Plus, Trash2, ClipboardList, TestTube, Smartphone, Edit3 } from 'lucide-react-native';
import Header from '../components/common/Header';
import MedicineReminderService from '../services/MedicineReminderService';
import ApiService from '../services/ApiService';
import TimeEditorModal from '../components/common/TimeEditorModal';

interface Reminder {
  _id: string;
  medicineName: string;
  dosage: string;
  times: string[];
  beforeMeal?: boolean;
  afterMeal?: boolean;
  withMeal?: boolean;
  isActive: boolean;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  instructions?: string;
}

interface ReminderStats {
  totalReminders: number;
  takenDoses: number;
  missedDoses: number;
  overallAdherence: number;
}

const Category = memo(({ title, icon, iconComponent, children }: any) => (
  <View style={styles.category}>
    <LinearGradient 
      colors={['#52B788', '#40916C']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.catHeader}
    >
      <Text style={styles.catTitle}>{title}</Text>
      <View style={styles.catIconContainer}>
        {iconComponent || <Text style={styles.catIcon}>{icon}</Text>}
      </View>
    </LinearGradient>
    <View style={styles.catContent}>
      {children}
    </View>
  </View>
));

const Row = memo(({ left, right, rightColor }: { left: React.ReactNode; right: React.ReactNode; rightColor?: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLeft}>{left}</Text>
    <View style={[styles.statusBadge, { backgroundColor: rightColor === 'Ongoing' ? '#FFF3E0' : '#D8F3DC' }]}>
      <Text style={[styles.rowRight, { color: rightColor === 'Ongoing' ? '#F57C00' : '#2D6A4F' }]}>{right}</Text>
    </View>
  </View>
));

const ReminderCard = memo(({ 
  reminder, 
  onToggle, 
  onDelete,
  onEditTimes
}: { 
  reminder: Reminder; 
  onToggle: () => void; 
  onDelete: () => void;
  onEditTimes: () => void;
}) => {
  const timingText = reminder.beforeMeal
    ? '🍽️ Before meal'
    : reminder.afterMeal
    ? '🍽️ After meal'
    : reminder.withMeal
    ? '🍽️ With meal'
    : '';

  return (
    <View style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderIcon}>
          <Pill size={22} color="#52B788" strokeWidth={2.5} />
        </View>
        <View style={styles.reminderInfo}>
          <Text style={styles.medicineName}>{reminder.medicineName}</Text>
          <Text style={styles.dosage}>{reminder.dosage}</Text>
        </View>
        <Switch
          value={reminder.isActive}
          onValueChange={onToggle}
          trackColor={{ false: '#E0E0E0', true: '#74C69D' }}
          thumbColor={reminder.isActive ? '#52B788' : '#F5F5F5'}
        />
      </View>

      <View style={styles.reminderTimes}>
        <View style={styles.timeIconCircle}>
          <Clock size={12} color="#52B788" strokeWidth={2.5} />
        </View>
        <Text style={styles.timesText}>{reminder.times.join(' • ')}</Text>
        <TouchableOpacity
          onPress={onEditTimes}
          style={styles.editTimeButton}
        >
          <Edit3 size={12} color="#52B788" strokeWidth={2.5} />
          <Text style={styles.editTimeText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {timingText && (
        <View style={styles.timingBadge}>
          <Text style={styles.timingBadgeText}>{timingText}</Text>
        </View>
      )}

      {reminder.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>💡 {reminder.instructions}</Text>
        </View>
      )}

      <View style={styles.reminderStats}>
        <View style={styles.statBadge}>
          <View style={styles.statIconCircle}>
            <CheckCircle size={12} color="#52B788" strokeWidth={2.5} />
          </View>
          <Text style={styles.statBadgeText}>{reminder.takenDoses} taken</Text>
        </View>
        <View style={styles.statBadge}>
          <View style={styles.statIconCircle}>
            <XCircle size={12} color="#EF476F" strokeWidth={2.5} />
          </View>
          <Text style={styles.statBadgeText}>{reminder.missedDoses} missed</Text>
        </View>
        <View style={[styles.adherenceBadgeContainer, { 
          backgroundColor: reminder.adherenceRate >= 80 ? '#D8F3DC' : '#FFF3E0' 
        }]}>
          <Text style={[styles.adherenceBadge, { 
            color: reminder.adherenceRate >= 80 ? '#2D6A4F' : '#F57C00' 
          }]}>
            {reminder.adherenceRate}%
          </Text>
        </View>
      </View>

      <View style={styles.reminderActions}>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Trash2 size={16} color="#EF476F" strokeWidth={2.5} />
          <Text style={styles.deleteBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const RecordsScreen = memo(() => {
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showTimeEditor, setShowTimeEditor] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      
      const [todayResponse, statsResponse] = await Promise.all([
        ApiService.get('/reminders/today'),
        ApiService.get('/reminders/stats'),
      ]);

      if (todayResponse.success) {
        setTodayReminders(todayResponse.data as Reminder[]);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data as ReminderStats);
      }
    } catch (error) {
      console.log('Could not load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (reminderId: string, isActive: boolean) => {
    try {
      const response = await ApiService.put(`/reminders/${reminderId}/toggle`, {});
      
      if (response.success) {
        if (!isActive) {
          await MedicineReminderService.cancelReminder(reminderId);
        }
        await loadReminders();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const deleteReminder = async (reminderId: string, medicineName: string) => {
    Alert.alert(
      'Delete Reminder',
      `Remove reminder for ${medicineName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.delete(`/reminders/${reminderId}`);
              await MedicineReminderService.cancelReminder(reminderId);
              await loadReminders();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const handleEditTimes = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowTimeEditor(true);
  };

  const handleSaveTimes = async (newTimes: string[]) => {
    if (!editingReminder) return;

    try {
      // Cancel old notifications
      await MedicineReminderService.cancelReminder(editingReminder._id);

      // Update reminder times in backend
      const response = await ApiService.put(`/reminders/${editingReminder._id}`, {
        times: newTimes,
      });

      if (response.success) {
        // Recalculate total doses
        const startDate = new Date(editingReminder.startDate);
        const endDate = new Date(editingReminder.endDate);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const totalDoses = daysDiff * newTimes.length;

        // Update total doses
        await ApiService.put(`/reminders/${editingReminder._id}`, {
          totalDoses,
        });

        // Schedule new notifications with updated times
        const updatedReminder = {
          ...editingReminder,
          times: newTimes,
        };

        await MedicineReminderService.scheduleReminder({
          id: updatedReminder._id,
          medicineName: updatedReminder.medicineName,
          dosage: updatedReminder.dosage,
          frequency: updatedReminder.frequency,
          times: newTimes,
          startDate: new Date(updatedReminder.startDate),
          endDate: new Date(updatedReminder.endDate),
          instructions: updatedReminder.instructions,
          beforeMeal: updatedReminder.beforeMeal,
          afterMeal: updatedReminder.afterMeal,
          withMeal: updatedReminder.withMeal,
          enableVoice: updatedReminder.enableNotification,
          prescriptionId: updatedReminder.prescriptionId,
        });

        // Reload reminders
        await loadReminders();
        Alert.alert('Success', 'Reminder times updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update times');
      }
    } catch (error: any) {
      console.error('Error updating times:', error);
      Alert.alert('Error', 'Failed to update reminder times');
    } finally {
      setEditingReminder(null);
      setShowTimeEditor(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F8FF' }}>
      <Header />
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: '#F0F8FF' }}
      >
        {/* Medicine Reminders Section */}
        <Category 
          title="Medicine Reminders" 
          iconComponent={<Pill size={20} color="#fff" strokeWidth={2.5} />}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#52B788" />
              <Text style={styles.loadingText}>Loading reminders...</Text>
            </View>
          ) : (
            <>
              {/* Stats Summary */}
              {stats && (
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <View style={styles.statCircle}>
                      <Text style={styles.statValue}>{stats.totalReminders}</Text>
                    </View>
                    <Text style={styles.statLabel}>Active</Text>
                  </View>
                  <View style={styles.statBox}>
                    <View style={[styles.statCircle, { backgroundColor: '#D8F3DC' }]}>
                      <Text style={[styles.statValue, { color: '#2D6A4F' }]}>{stats.takenDoses}</Text>
                    </View>
                    <Text style={styles.statLabel}>Taken</Text>
                  </View>
                  <View style={styles.statBox}>
                    <View style={[styles.statCircle, { backgroundColor: '#FFE5EC' }]}>
                      <Text style={[styles.statValue, { color: '#C9184A' }]}>{stats.missedDoses}</Text>
                    </View>
                    <Text style={styles.statLabel}>Missed</Text>
                  </View>
                  <View style={styles.statBox}>
                    <View style={[styles.statCircle, { backgroundColor: stats.overallAdherence >= 80 ? '#D8F3DC' : '#FFF3E0' }]}>
                      <Text style={[styles.statValue, { color: stats.overallAdherence >= 80 ? '#2D6A4F' : '#F57C00' }]}>
                        {stats.overallAdherence}%
                      </Text>
                    </View>
                    <Text style={styles.statLabel}>Adherence</Text>
                  </View>
                </View>
              )}

              {/* Today's Reminders */}
              {todayReminders.length === 0 ? (
                <View style={styles.emptyReminders}>
                  <View style={styles.emptyIconCircle}>
                    <BellOff size={32} color="#ccc" strokeWidth={2} />
                  </View>
                  <Text style={styles.emptyText}>No reminders for today</Text>
                  <Text style={styles.emptySubtext}>Add medicines from prescriptions below</Text>
                </View>
              ) : (
                todayReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder._id}
                    reminder={reminder}
                    onToggle={() => toggleReminder(reminder._id, reminder.isActive)}
                    onDelete={() => deleteReminder(reminder._id, reminder.medicineName)}
                    onEditTimes={() => handleEditTimes(reminder)}
                  />
                ))
              )}
            </>
          )}
        </Category>

        <Category 
          title="Medical History" 
          iconComponent={<ClipboardList size={20} color="#fff" strokeWidth={2.5} />}
        >
          <Row left="Hypertension" right="Ongoing" rightColor="Ongoing" />
          <Row left="Diabetes Type 2" right="Controlled" rightColor="Controlled" />
        </Category>

        <Category 
          title="Prescriptions" 
          iconComponent={<Pill size={20} color="#fff" strokeWidth={2.5} />}
        >
          <View style={styles.prescriptionCard}>
            <View style={styles.prescriptionIconCircle}>
              <Pill size={18} color="#52B788" strokeWidth={2.5} />
            </View>
            <View style={styles.prescriptionInfo}>
              <Text style={styles.prescriptionName}>Amlodipine 5mg</Text>
              <Text style={styles.prescriptionDosage}>Once daily, morning</Text>
            </View>
            <View style={styles.prescriptionActions}>
              <View style={styles.prescriptionStatusBadge}>
                <Text style={styles.prescriptionStatusText}>Active</Text>
              </View>
              <TouchableOpacity
                style={styles.addReminderBtn}
                onPress={() => Alert.alert('Coming Soon', 'Create reminder from this prescription')}
              >
                <Bell size={16} color="#52B788" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.prescriptionCard}>
            <View style={styles.prescriptionIconCircle}>
              <Pill size={18} color="#52B788" strokeWidth={2.5} />
            </View>
            <View style={styles.prescriptionInfo}>
              <Text style={styles.prescriptionName}>Metformin 500mg</Text>
              <Text style={styles.prescriptionDosage}>Twice daily, with meals</Text>
            </View>
            <View style={styles.prescriptionActions}>
              <View style={styles.prescriptionStatusBadge}>
                <Text style={styles.prescriptionStatusText}>Active</Text>
              </View>
              <TouchableOpacity
                style={styles.addReminderBtn}
                onPress={() => Alert.alert('Coming Soon', 'Create reminder from this prescription')}
              >
                <Bell size={16} color="#52B788" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </Category>

        <Category 
          title="Lab Reports" 
          iconComponent={<TestTube size={20} color="#fff" strokeWidth={2.5} />}
        >
          <View style={styles.labReportCard}>
            <View style={styles.labReportIconCircle}>
              <TestTube size={18} color="#2196F3" strokeWidth={2.5} />
            </View>
            <View style={styles.labReportInfo}>
              <Text style={styles.labReportName}>Blood Sugar Test</Text>
              <Text style={styles.labReportDate}>Dec 10, 2024</Text>
            </View>
          </View>
          <View style={styles.labReportCard}>
            <View style={styles.labReportIconCircle}>
              <TestTube size={18} color="#2196F3" strokeWidth={2.5} />
            </View>
            <View style={styles.labReportInfo}>
              <Text style={styles.labReportName}>Lipid Profile</Text>
              <Text style={styles.labReportDate}>Nov 25, 2024</Text>
            </View>
          </View>
        </Category>

        <View style={styles.offlineCard}>
          <View style={styles.offlineHeader}>
            <View style={styles.offlineIconCircle}>
              <Smartphone size={18} color="#2D6A4F" strokeWidth={2.5} />
            </View>
            <Text style={styles.offlineTitle}>Offline Available</Text>
          </View>
          <Text style={styles.offlineText}>All your health records are stored offline and sync when connected.</Text>
        </View>
      </ScrollView>

      <TimeEditorModal
        visible={showTimeEditor}
        onClose={() => {
          setShowTimeEditor(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveTimes}
        currentTimes={editingReminder?.times || []}
        medicineName={editingReminder?.medicineName || ''}
      />
    </View>
  );
});

export default RecordsScreen;

const styles = StyleSheet.create({
  category: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  catHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  catIcon: {
    color: '#fff',
    fontSize: 20,
  },
  catIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catContent: {
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  rowLeft: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  rowRight: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offlineCard: {
    backgroundColor: '#D8F3DC',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  offlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  offlineIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  offlineTitle: {
    color: '#2D6A4F',
    fontWeight: '700',
    fontSize: 15,
  },
  offlineText: {
    color: '#52796F',
    fontSize: 13,
    lineHeight: 20,
  },
  
  // Loading State
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },

  // Medicine Reminder Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  emptyReminders: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 6,
  },
  reminderCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#52B788',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dosage: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  reminderTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 2,
  },
  timeIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  timesText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  editTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D8F3DC',
    borderRadius: 6,
    marginLeft: 8,
  },
  editTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  timingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  timingBadgeText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  reminderStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  adherenceBadgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  adherenceBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFE5EC',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9184A',
  },

  // Prescription Card Styles
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  prescriptionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  prescriptionDosage: {
    fontSize: 12,
    color: '#777',
  },
  prescriptionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prescriptionStatusBadge: {
    backgroundColor: '#D8F3DC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  prescriptionStatusText: {
    color: '#2D6A4F',
    fontSize: 12,
    fontWeight: '600',
  },
  addReminderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Lab Report Styles
  labReportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  labReportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labReportInfo: {
    flex: 1,
  },
  labReportName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  labReportDate: {
    fontSize: 12,
    color: '#777',
  },
});
