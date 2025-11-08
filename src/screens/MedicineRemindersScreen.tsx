import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Bell, 
  BellOff, 
  Pill, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  WifiOff,
  Edit3,
} from 'lucide-react-native';
import MedicineReminderService from '../services/MedicineReminderService';
import ApiService from '../services/ApiService';
import TimeEditorModal from '../components/common/TimeEditorModal';

interface ReminderStats {
  totalReminders: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  overallAdherence: number;
}

interface Reminder {
  _id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  instructions?: string;
  beforeMeal?: boolean;
  afterMeal?: boolean;
  withMeal?: boolean;
  enableNotification: boolean;
  prescriptionId?: string;
  isActive: boolean;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
}

const STORAGE_KEYS = {
  REMINDERS: 'medicine_reminders_cache',
  TODAY_REMINDERS: 'today_reminders_cache',
  STATS: 'reminder_stats_cache',
};

const MedicineRemindersScreen = ({ navigation }: any) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'all'
  const [isOffline, setIsOffline] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showTimeEditor, setShowTimeEditor] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  // Load reminders from local storage (offline mode)
  const loadRemindersFromStorage = async () => {
    try {
      const [cachedReminders, cachedToday, cachedStats] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.REMINDERS),
        AsyncStorage.getItem(STORAGE_KEYS.TODAY_REMINDERS),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
      ]);

      if (cachedReminders) {
        const parsed = JSON.parse(cachedReminders);
        setReminders(parsed);
      }

      if (cachedToday) {
        const parsed = JSON.parse(cachedToday);
        setTodayReminders(parsed);
        
        // Schedule notifications for cached reminders
        for (const reminder of parsed) {
          try {
            await MedicineReminderService.scheduleReminder({
              id: reminder._id,
              medicineName: reminder.medicineName,
              dosage: reminder.dosage,
              frequency: reminder.frequency,
              times: reminder.times,
              startDate: new Date(reminder.startDate),
              endDate: new Date(reminder.endDate),
              instructions: reminder.instructions,
              beforeMeal: reminder.beforeMeal,
              afterMeal: reminder.afterMeal,
              withMeal: reminder.withMeal,
              enableVoice: reminder.enableNotification,
              prescriptionId: reminder.prescriptionId,
            });
          } catch (err) {
            console.error('Error scheduling reminder:', err);
          }
        }
      }

      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  // Save reminders to local storage
  const saveRemindersToStorage = async (remindersData: Reminder[], todayData: Reminder[], statsData: ReminderStats | null) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(remindersData)),
        AsyncStorage.setItem(STORAGE_KEYS.TODAY_REMINDERS, JSON.stringify(todayData)),
        statsData ? AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statsData)) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const loadReminders = async () => {
    try {
      setLoading(true);
      
      // Try to load from backend first
      const [todayResponse, allResponse, statsResponse] = await Promise.all([
        ApiService.get('/reminders/today'),
        ApiService.get('/reminders?isActive=true'),
        ApiService.get('/reminders/stats'),
      ]);

      // Check if we're offline (network error)
      if (!todayResponse.success && todayResponse.error?.includes('Network request failed')) {
        setIsOffline(true);
        console.log('📴 Offline mode: Loading from local storage');
        await loadRemindersFromStorage();
        return;
      }

      setIsOffline(false);

      // Debug logging
      console.log('📋 Reminders API Response:', {
        todaySuccess: todayResponse.success,
        todayData: todayResponse.data,
        todayCount: Array.isArray(todayResponse.data) ? todayResponse.data.length : 0,
        allSuccess: allResponse.success,
        allData: allResponse.data,
        allCount: Array.isArray(allResponse.data) ? allResponse.data.length : 0,
      });

      if (todayResponse.success && todayResponse.data) {
        const todayData = Array.isArray(todayResponse.data) 
          ? (todayResponse.data as Reminder[])
          : [];
        setTodayReminders(todayData);
        
        // Schedule notifications for today's reminders
        for (const reminder of todayData) {
          try {
            await MedicineReminderService.scheduleReminder({
              id: reminder._id,
              medicineName: reminder.medicineName,
              dosage: reminder.dosage,
              frequency: reminder.frequency,
              times: reminder.times,
              startDate: new Date(reminder.startDate),
              endDate: new Date(reminder.endDate),
              instructions: reminder.instructions,
              beforeMeal: reminder.beforeMeal,
              afterMeal: reminder.afterMeal,
              withMeal: reminder.withMeal,
              enableVoice: reminder.enableNotification,
              prescriptionId: reminder.prescriptionId,
            });
          } catch (err) {
            console.error('Error scheduling reminder:', err);
          }
        }
      }

      if (allResponse.success && allResponse.data) {
        const allData = Array.isArray(allResponse.data) 
          ? (allResponse.data as Reminder[])
          : [];
        setReminders(allData);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as ReminderStats);
      }

      // Save to local storage for offline access
      await saveRemindersToStorage(
        allResponse.success && allResponse.data ? (allResponse.data as Reminder[]) : reminders,
        todayResponse.success && todayResponse.data ? (todayResponse.data as Reminder[]) : todayReminders,
        statsResponse.success && statsResponse.data ? statsResponse.data as ReminderStats : stats
      );
    } catch (error) {
      console.error('Error loading reminders:', error);
      // If network error, try loading from storage
      if (error instanceof Error && error.message.includes('Network')) {
        setIsOffline(true);
        await loadRemindersFromStorage();
      } else {
        Alert.alert('Error', 'Failed to load reminders');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  const toggleReminder = async (reminderId: string, isActive: boolean) => {
    try {
      const response = await ApiService.put(`/reminders/${reminderId}/toggle`, {});
      
      if (response.success) {
        if (!isActive) {
          // Cancel notifications
          await MedicineReminderService.cancelReminder(reminderId);
        }
        
        await loadReminders();
        Alert.alert('Success', response.message);
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const deleteReminder = async (reminderId: string, medicineName: string) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete the reminder for ${medicineName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.delete(`/reminders/${reminderId}`);
              
              if (response.success) {
                await MedicineReminderService.cancelReminder(reminderId);
                await loadReminders();
                Alert.alert('Success', 'Reminder deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting reminder:', error);
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
      
      // If offline, save to local storage and schedule locally
      const isNetworkError = error.message?.includes('Network') || 
                            error.message?.includes('Failed to fetch') || 
                            error.message?.includes('Unable to') ||
                            isOffline;
      
      if (isNetworkError) {
        try {
          // Update in local storage
          const cachedReminders = await AsyncStorage.getItem(STORAGE_KEYS.TODAY_REMINDERS);
          if (cachedReminders) {
            const reminders = JSON.parse(cachedReminders);
            const updated = reminders.map((r: Reminder) =>
              r._id === editingReminder._id ? { ...r, times: newTimes } : r
            );
            await AsyncStorage.setItem(STORAGE_KEYS.TODAY_REMINDERS, JSON.stringify(updated));
            
            // Also update "all reminders" cache
            const allRemindersCache = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
            if (allRemindersCache) {
              const allReminders = JSON.parse(allRemindersCache);
              const updatedAll = allReminders.map((r: Reminder) =>
                r._id === editingReminder._id ? { ...r, times: newTimes } : r
              );
              await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(updatedAll));
            }
            
            // Schedule notifications locally with new times
            const updatedReminder = { ...editingReminder, times: newTimes };
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
            
            await loadRemindersFromStorage(); // Load from cache instead of network
            Alert.alert(
              '✅ Offline Mode', 
              'Reminder times updated locally! Notifications will trigger at the new times.\n\n(Changes will sync to server when online)',
              [{ text: 'OK' }]
            );
            return; // Don't show error
          }
        } catch (storageError) {
          console.error('Error saving to storage:', storageError);
          Alert.alert('Error', 'Failed to update times offline. Please try again.');
          return;
        }
      }
      
      // Only show error if not a network error
      Alert.alert('Error', 'Failed to update reminder times');
    } finally {
      setEditingReminder(null);
      setShowTimeEditor(false);
    }
  };

  const renderReminderCard = ({ item }: { item: Reminder }) => {
    const timingText = item.beforeMeal
      ? 'Before meal'
      : item.afterMeal
      ? 'After meal'
      : item.withMeal
      ? 'With meal'
      : '';

    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderIcon}>
            <Pill size={24} color="#4F46E5" />
          </View>
          <View style={styles.reminderInfo}>
            <Text style={styles.medicineName}>{item.medicineName}</Text>
            <Text style={styles.dosage}>{item.dosage}</Text>
          </View>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleReminder(item._id, item.isActive)}
            trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
            thumbColor={item.isActive ? '#FFFFFF' : '#F3F4F6'}
          />
        </View>

        <View style={styles.reminderDetails}>
          <View style={styles.detailRow}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.times.join(' • ')}
            </Text>
            <TouchableOpacity
              onPress={() => handleEditTimes(item)}
              style={styles.editTimeButton}
            >
              <Edit3 size={14} color="#4F46E5" />
              <Text style={styles.editTimeText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {timingText && (
            <View style={styles.detailRow}>
              <Text style={styles.timingBadge}>{timingText}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>

          {item.instructions && (
            <Text style={styles.instructions}>{item.instructions}</Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.statText}>{item.takenDoses} taken</Text>
            </View>
            <View style={styles.statItem}>
              <XCircle size={16} color="#EF4444" />
              <Text style={styles.statText}>{item.missedDoses} missed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.adherenceText}>
                {item.adherenceRate}% adherence
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.reminderActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteReminder(item._id, item.medicineName)}
          >
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Adherence Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{stats.totalReminders}</Text>
            <Text style={styles.statsLabel}>Active Reminders</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{stats.takenDoses}</Text>
            <Text style={styles.statsLabel}>Doses Taken</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{stats.missedDoses}</Text>
            <Text style={styles.statsLabel}>Doses Missed</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={[styles.statsValue, { color: stats.overallAdherence >= 80 ? '#10B981' : '#EF4444' }]}>
              {stats.overallAdherence}%
            </Text>
            <Text style={styles.statsLabel}>Overall Adherence</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BellOff size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Reminders Yet</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'today'
          ? 'You have no medicine reminders scheduled for today'
          : 'Create reminders from your prescriptions or add them manually'}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Records')}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>View Prescriptions</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentReminders = activeTab === 'today' ? todayReminders : reminders;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Bell size={28} color="#4F46E5" />
          <Text style={styles.headerTitle}>Medicine Reminders</Text>
        </View>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <WifiOff size={16} color="#EF4444" />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Reminders
          </Text>
        </TouchableOpacity>
      </View>

      {renderStatsCard()}

      <FlatList
        data={currentReminders}
        renderItem={renderReminderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
          />
        }
      />

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
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
    color: '#111827',
    marginBottom: 2,
  },
  dosage: {
    fontSize: 14,
    color: '#6B7280',
  },
  reminderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  editTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    marginLeft: 'auto',
  },
  editTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  timingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  instructions: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  adherenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default MedicineRemindersScreen;
