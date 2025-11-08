import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleMedicineReminder,
  scheduleBulkReminders,
  cancelNotification,
  scheduleSnoozeReminder,
  getAllScheduledNotifications,
} from '../services/notifications';
import api from '../services/api';

/**
 * Custom hook for managing medicine reminder scheduling
 */
export const useReminderScheduler = (patientId) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledReminders, setScheduledReminders] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Load scheduled reminders from AsyncStorage
   */
  const loadScheduledReminders = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(`reminders_${patientId}`);
      if (stored) {
        setScheduledReminders(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading scheduled reminders:', err);
    }
  }, [patientId]);

  /**
   * Save scheduled reminders to AsyncStorage
   */
  const saveScheduledReminders = useCallback(async (reminders) => {
    try {
      await AsyncStorage.setItem(`reminders_${patientId}`, JSON.stringify(reminders));
      setScheduledReminders(reminders);
    } catch (err) {
      console.error('Error saving scheduled reminders:', err);
    }
  }, [patientId]);

  /**
   * Schedule reminders for a single medication
   */
  const scheduleMedicationReminders = useCallback(async (
    prescriptionId,
    medicineIndex,
    chosenTimes
  ) => {
    setIsScheduling(true);
    setError(null);

    try {
      // 1. Update backend with chosen times
      await api.patch(
        `/prescriptions/${prescriptionId}/medications/${medicineIndex}/set-times`,
        { chosenTimes }
      );

      // 2. Schedule intake logs in backend
      const response = await api.post('/intake/schedule', {
        prescriptionId,
        medicineIndex,
        chosenTimes,
      });

      // 3. Get the created intake logs
      const upcomingResponse = await api.get(`/intake/patient/${patientId}/upcoming?days=30`);
      const intakeLogs = upcomingResponse.data.data;

      // Filter intake logs for this medication
      const medicationIntakes = intakeLogs.filter(
        intake => 
          intake.prescriptionId === prescriptionId && 
          intake.medicineIndex === medicineIndex
      );

      // 4. Schedule local notifications
      const notificationIds = await scheduleBulkReminders(medicationIntakes);

      // 5. Update backend with notification IDs
      for (const { intakeId, notificationId } of notificationIds) {
        await api.patch(`/intake/${intakeId}/notification`, { notificationId });
      }

      // 6. Store locally
      const newReminders = [...scheduledReminders, ...notificationIds];
      await saveScheduledReminders(newReminders);

      setIsScheduling(false);

      return {
        success: true,
        totalReminders: notificationIds.length,
      };

    } catch (err) {
      console.error('Error scheduling medication reminders:', err);
      setError(err.message);
      setIsScheduling(false);

      Alert.alert(
        'Scheduling Failed',
        'Failed to schedule reminders. Please try again.'
      );

      return {
        success: false,
        error: err.message,
      };
    }
  }, [patientId, scheduledReminders, saveScheduledReminders]);

  /**
   * Cancel reminders for a specific intake
   */
  const cancelIntakeReminder = useCallback(async (intakeId, notificationId) => {
    try {
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      // Remove from local storage
      const updated = scheduledReminders.filter(r => r.intakeId !== intakeId);
      await saveScheduledReminders(updated);

      return { success: true };
    } catch (err) {
      console.error('Error cancelling reminder:', err);
      return { success: false, error: err.message };
    }
  }, [scheduledReminders, saveScheduledReminders]);

  /**
   * Snooze a reminder
   */
  const snoozeReminder = useCallback(async (intake, snoozeMinutes = 15) => {
    try {
      // Cancel existing notification
      if (intake.notificationId) {
        await cancelNotification(intake.notificationId);
      }

      // Schedule new snoozed notification
      const newNotificationId = await scheduleSnoozeReminder(intake, snoozeMinutes);

      // Update backend
      await api.patch(`/intake/${intake._id}/snooze`, { snoozeMinutes });
      await api.patch(`/intake/${intake._id}/notification`, { 
        notificationId: newNotificationId 
      });

      // Update local storage
      const updated = scheduledReminders.map(r => 
        r.intakeId === intake._id
          ? { ...r, notificationId: newNotificationId }
          : r
      );
      await saveScheduledReminders(updated);

      return { 
        success: true, 
        notificationId: newNotificationId 
      };

    } catch (err) {
      console.error('Error snoozing reminder:', err);
      return { success: false, error: err.message };
    }
  }, [scheduledReminders, saveScheduledReminders]);

  /**
   * Mark medication as taken
   */
  const markAsTaken = useCallback(async (intakeId, notificationId) => {
    try {
      // Cancel notification
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      // Update backend
      await api.patch(`/intake/${intakeId}/mark-taken`, {
        takenAt: new Date().toISOString(),
      });

      // Remove from scheduled reminders
      const updated = scheduledReminders.filter(r => r.intakeId !== intakeId);
      await saveScheduledReminders(updated);

      return { success: true };

    } catch (err) {
      console.error('Error marking as taken:', err);
      
      // Check if it's a double intake error
      if (err.response?.status === 400 && err.response?.data?.message?.includes('2 hours')) {
        Alert.alert(
          'Already Taken',
          err.response.data.message
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to mark medication as taken. Please try again.'
        );
      }

      return { success: false, error: err.message };
    }
  }, [scheduledReminders, saveScheduledReminders]);

  /**
   * Skip a dose
   */
  const skipDose = useCallback(async (intakeId, notificationId, reason = '') => {
    try {
      // Cancel notification
      if (notificationId) {
        await cancelNotification(notificationId);
      }

      // Update backend
      await api.patch(`/intake/${intakeId}/skip`, { reason });

      // Remove from scheduled reminders
      const updated = scheduledReminders.filter(r => r.intakeId !== intakeId);
      await saveScheduledReminders(updated);

      return { success: true };

    } catch (err) {
      console.error('Error skipping dose:', err);
      return { success: false, error: err.message };
    }
  }, [scheduledReminders, saveScheduledReminders]);

  /**
   * Get today's medication schedule
   */
  const getTodaySchedule = useCallback(async () => {
    try {
      const response = await api.get(`/intake/patient/${patientId}/today`);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching today\'s schedule:', err);
      return [];
    }
  }, [patientId]);

  /**
   * Get upcoming medications
   */
  const getUpcomingMedications = useCallback(async (days = 7) => {
    try {
      const response = await api.get(`/intake/patient/${patientId}/upcoming?days=${days}`);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching upcoming medications:', err);
      return [];
    }
  }, [patientId]);

  /**
   * Get intake history and adherence stats
   */
  const getIntakeHistory = useCallback(async (startDate, endDate) => {
    try {
      let url = `/intake/patient/${patientId}/history`;
      const params = [];
      
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await api.get(url);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching intake history:', err);
      return { history: [], stats: {} };
    }
  }, [patientId]);

  /**
   * Sync scheduled notifications with backend
   */
  const syncNotifications = useCallback(async () => {
    try {
      // Get all scheduled notifications from device
      const localNotifications = await getAllScheduledNotifications();

      // Get upcoming intakes from backend
      const response = await api.get(`/intake/patient/${patientId}/upcoming?days=30`);
      const backendIntakes = response.data.data;

      // Find discrepancies
      const localIds = new Set(localNotifications.map(n => n.identifier));
      const backendIds = new Set(
        backendIntakes
          .filter(i => i.notificationId)
          .map(i => i.notificationId)
      );

      console.log(`Local notifications: ${localIds.size}, Backend: ${backendIds.size}`);

      // Re-schedule missing notifications
      const missing = backendIntakes.filter(
        intake => !intake.notificationId || !localIds.has(intake.notificationId)
      );

      if (missing.length > 0) {
        console.log(`Re-scheduling ${missing.length} missing notifications`);
        const notificationIds = await scheduleBulkReminders(missing);

        // Update backend
        for (const { intakeId, notificationId } of notificationIds) {
          await api.patch(`/intake/${intakeId}/notification`, { notificationId });
        }
      }

      return { success: true, synced: missing.length };

    } catch (err) {
      console.error('Error syncing notifications:', err);
      return { success: false, error: err.message };
    }
  }, [patientId]);

  // Load scheduled reminders on mount
  useEffect(() => {
    loadScheduledReminders();
  }, [loadScheduledReminders]);

  return {
    isScheduling,
    scheduledReminders,
    error,
    scheduleMedicationReminders,
    cancelIntakeReminder,
    snoozeReminder,
    markAsTaken,
    skipDose,
    getTodaySchedule,
    getUpcomingMedications,
    getIntakeHistory,
    syncNotifications,
  };
};

export default useReminderScheduler;
