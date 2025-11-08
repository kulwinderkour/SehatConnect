import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Notification Service for Medicine Reminders
 * Handles scheduling, cancellation, and deep linking
 */

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get notification permissions');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medicine-reminders', {
        name: 'Medicine Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 300, 500, 300, 500],
        lightColor: '#FF231F7C',
        sound: 'default', // Use default sound to ensure phone rings
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a medicine reminder notification
 * @param {Object} intake - Intake log object
 * @param {Date} scheduledDateTime - When to trigger the notification
 * @param {number} minutesBefore - Minutes before scheduled time to notify (default: 5)
 * @returns {Promise<string>} Notification ID
 */
export const scheduleMedicineReminder = async (intake, scheduledDateTime, minutesBefore = 5) => {
  try {
    // Calculate trigger time (5 minutes before scheduled time)
    const triggerTime = new Date(scheduledDateTime.getTime() - minutesBefore * 60 * 1000);

    // Don't schedule if trigger time is in the past
    if (triggerTime <= new Date()) {
      console.log('Trigger time is in the past, skipping notification');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Time to take ${intake.medicineName}`,
        body: `${intake.slotLabel} dose • Tap to mark as taken`,
        sound: 'default', // Use default sound to ensure phone rings
        data: {
          intakeId: intake._id || intake.id,
          action: 'mark_taken',
          medicineName: intake.medicineName,
          scheduledTime: intake.scheduledTime,
          slotLabel: intake.slotLabel,
        },
        badge: 1,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'MEDICINE_REMINDER',
      },
      trigger: {
        date: triggerTime,
        channelId: 'medicine-reminders',
      },
    });

    console.log(`Scheduled notification ${notificationId} for ${intake.medicineName} at ${triggerTime}`);
    return notificationId;

  } catch (error) {
    console.error('Error scheduling medicine reminder:', error);
    throw error;
  }
};

/**
 * Schedule multiple reminders for a medication
 * @param {Array} intakeLogs - Array of intake log objects
 * @returns {Promise<Array>} Array of notification IDs
 */
export const scheduleBulkReminders = async (intakeLogs) => {
  try {
    const notificationIds = [];

    for (const intake of intakeLogs) {
      const scheduledDateTime = new Date(intake.scheduledDate);
      const [hours, minutes] = intake.scheduledTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const notificationId = await scheduleMedicineReminder(intake, scheduledDateTime);
      
      if (notificationId) {
        notificationIds.push({
          intakeId: intake._id || intake.id,
          notificationId,
        });
      }
    }

    return notificationIds;
  } catch (error) {
    console.error('Error scheduling bulk reminders:', error);
    throw error;
  }
};

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - Notification ID to cancel
 */
export const cancelNotification = async (notificationId) => {
  try {
    if (!notificationId) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Cancelled notification ${notificationId}`);
  } catch (error) {
    console.error('Error cancelling notification:', error);
    throw error;
  }
};

/**
 * Cancel multiple notifications
 * @param {Array<string>} notificationIds - Array of notification IDs
 */
export const cancelMultipleNotifications = async (notificationIds) => {
  try {
    const promises = notificationIds.map(id => cancelNotification(id));
    await Promise.all(promises);
    console.log(`Cancelled ${notificationIds.length} notifications`);
  } catch (error) {
    console.error('Error cancelling multiple notifications:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all scheduled notifications');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    throw error;
  }
};

/**
 * Get all scheduled notifications
 * @returns {Promise<Array>} Array of scheduled notifications
 */
export const getAllScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Schedule a snooze reminder
 * @param {Object} intake - Intake log object
 * @param {number} snoozeMinutes - Minutes to snooze (default: 15)
 * @returns {Promise<string>} Notification ID
 */
export const scheduleSnoozeReminder = async (intake, snoozeMinutes = 15) => {
  try {
    const triggerTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Reminder: ${intake.medicineName}`,
        body: `Don't forget to take your ${intake.slotLabel} dose`,
        sound: 'default', // Use default sound to ensure phone rings
        data: {
          intakeId: intake._id || intake.id,
          action: 'mark_taken',
          medicineName: intake.medicineName,
          scheduledTime: intake.scheduledTime,
          slotLabel: intake.slotLabel,
          isSnoozed: true,
        },
        badge: 1,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        date: triggerTime,
        channelId: 'medicine-reminders',
      },
    });

    console.log(`Scheduled snooze reminder for ${snoozeMinutes} minutes`);
    return notificationId;

  } catch (error) {
    console.error('Error scheduling snooze reminder:', error);
    throw error;
  }
};

/**
 * Schedule a missed dose follow-up notification
 * @param {Object} intake - Intake log object
 */
export const scheduleMissedDoseNotification = async (intake) => {
  try {
    // Schedule notification for 1 hour after missed time
    const triggerTime = new Date(Date.now() + 60 * 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Missed Dose: ${intake.medicineName}`,
        body: `You missed your ${intake.slotLabel} dose. Please consult your doctor if needed.`,
        sound: 'default', // Use default sound to ensure phone rings
        data: {
          intakeId: intake._id || intake.id,
          action: 'view_history',
          medicineName: intake.medicineName,
          isMissed: true,
        },
        badge: 1,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        date: triggerTime,
        channelId: 'medicine-reminders',
      },
    });

    console.log('Scheduled missed dose notification');

  } catch (error) {
    console.error('Error scheduling missed dose notification:', error);
  }
};

/**
 * Set up notification categories with actions
 */
export const setupNotificationCategories = async () => {
  try {
    await Notifications.setNotificationCategoryAsync('MEDICINE_REMINDER', [
      {
        identifier: 'MARK_TAKEN',
        buttonTitle: '✓ Mark as Taken',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'SNOOZE',
        buttonTitle: '⏰ Snooze 15 min',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'SKIP',
        buttonTitle: '✕ Skip',
        options: {
          opensAppToForeground: false,
          isDestructive: true,
        },
      },
    ]);

    console.log('Notification categories set up successfully');
  } catch (error) {
    console.error('Error setting up notification categories:', error);
  }
};

/**
 * Handle notification received while app is in foreground
 * @param {Function} callback - Callback function to handle the notification
 */
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Handle notification response (user tapped notification)
 * @param {Function} callback - Callback function to handle the response
 */
export const addNotificationResponseReceivedListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Clear all notification badges
 */
export const clearBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
};

/**
 * Set notification badge count
 * @param {number} count - Badge count
 */
export const setBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

/**
 * Store notification preferences
 * @param {Object} preferences - Notification preferences
 */
export const saveNotificationPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
};

/**
 * Get notification preferences
 * @returns {Promise<Object>} Notification preferences
 */
export const getNotificationPreferences = async () => {
  try {
    const prefs = await AsyncStorage.getItem('notification_preferences');
    return prefs ? JSON.parse(prefs) : {
      enabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      reminderMinutesBefore: 5,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
};

export default {
  requestNotificationPermissions,
  scheduleMedicineReminder,
  scheduleBulkReminders,
  cancelNotification,
  cancelMultipleNotifications,
  cancelAllNotifications,
  getAllScheduledNotifications,
  scheduleSnoozeReminder,
  scheduleMissedDoseNotification,
  setupNotificationCategories,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  clearBadge,
  setBadgeCount,
  saveNotificationPreferences,
  getNotificationPreferences,
};
