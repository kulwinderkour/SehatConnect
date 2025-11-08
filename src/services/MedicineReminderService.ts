import notifee, {
  AndroidImportance,
  AndroidStyle,
  RepeatFrequency,
  TriggerType,
  TimestampTrigger,
  IOSNotificationSetting,
  AuthorizationStatus,
} from '@notifee/react-native';
import Tts from 'react-native-tts';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Medicine Reminder Service
 * Handles local notifications, scheduling, and voice alerts for medicine reminders
 */

export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[]; // ["08:00", "14:00", "20:00"]
  startDate: Date;
  endDate: Date;
  instructions?: string;
  beforeMeal?: boolean;
  afterMeal?: boolean;
  withMeal?: boolean;
  enableVoice?: boolean;
  prescriptionId?: string;
}

export interface ScheduledNotification {
  reminderId: string;
  notificationId: string;
  scheduledTime: Date;
  medicineName: string;
}

class MedicineReminderService {
  private static instance: MedicineReminderService;
  private channelId = 'medicine-reminders';
  private soundChannelId = 'medicine-reminders-sound';
  private storageKey = 'scheduled_reminders';

  private constructor() {
    this.initialize();
  }

  public static getInstance(): MedicineReminderService {
    if (!MedicineReminderService.instance) {
      MedicineReminderService.instance = new MedicineReminderService();
    }
    return MedicineReminderService.instance;
  }

  /**
   * Initialize notification channels and TTS
   */
  private async initialize() {
    try {
      // Create notification channel for Android
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: this.channelId,
          name: 'Medicine Reminders',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500, 300, 500],
        });

        await notifee.createChannel({
          id: this.soundChannelId,
          name: 'Medicine Reminders with Sound',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [300, 500, 300, 500],
        });
      }

      // Initialize TTS
      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);

      // Request notification permissions
      await this.requestPermissions();

      // Set up notification handlers
      this.setupNotificationHandlers();
    } catch (error) {
      console.error('Error initializing MedicineReminderService:', error);
    }
  }

  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1; // 1 = authorized
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Set up notification action handlers
   */
  private setupNotificationHandlers() {
    // Handle notification press
    notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail;

      if (type === 1) { // Press event
        if (pressAction?.id === 'mark-taken') {
          await this.markAsTaken(notification?.data?.reminderId as string);
        } else if (pressAction?.id === 'snooze') {
          await this.snoozeReminder(notification?.data?.reminderId as string);
        }
      }
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail;

      if (type === 1) { // Press event
        if (pressAction?.id === 'mark-taken') {
          await this.markAsTaken(notification?.data?.reminderId as string);
        } else if (pressAction?.id === 'snooze') {
          await this.snoozeReminder(notification?.data?.reminderId as string);
        }
      }
    });
  }

  /**
   * Schedule a medicine reminder
   */
  async scheduleReminder(reminder: MedicineReminder): Promise<void> {
    try {
      const { times, startDate, endDate, medicineName, dosage } = reminder;

      // Calculate all notification times
      const notificationTimes = this.calculateNotificationTimes(
        times,
        new Date(startDate),
        new Date(endDate)
      );

      // Schedule each notification
      for (const time of notificationTimes) {
        const notificationId = await this.createNotification(
          reminder,
          time
        );

        // Save scheduled notification
        await this.saveScheduledNotification({
          reminderId: reminder.id,
          notificationId,
          scheduledTime: time,
          medicineName,
        });
      }

      console.log(`Scheduled ${notificationTimes.length} reminders for ${medicineName}`);
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  /**
   * Create a notification
   */
  private async createNotification(
    reminder: MedicineReminder,
    scheduledTime: Date
  ): Promise<string> {
    const { medicineName, dosage, instructions, beforeMeal, afterMeal, withMeal } = reminder;

    let timingText = '';
    if (beforeMeal) timingText = '🍽️ Take before meal';
    else if (afterMeal) timingText = '🍽️ Take after meal';
    else if (withMeal) timingText = '🍽️ Take with meal';

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledTime.getTime(),
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        id: `${reminder.id}-${scheduledTime.getTime()}`,
        title: `💊 Time for ${medicineName}`,
        body: `${dosage}\n${timingText}\n${instructions || ''}`,
        android: {
          channelId: reminder.enableVoice ? this.soundChannelId : this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [300, 500, 300, 500],
          style: {
            type: AndroidStyle.BIGTEXT,
            text: `${dosage}\n${timingText}\n${instructions || ''}`,
          },
          actions: [
            {
              title: '✓ Taken',
              pressAction: {
                id: 'mark-taken',
              },
            },
            {
              title: '⏰ Snooze 10 min',
              pressAction: {
                id: 'snooze',
              },
            },
          ],
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
        },
        ios: {
          sound: 'default',
          categoryId: 'medicine-reminder',
        },
        data: {
          reminderId: reminder.id,
          medicineName,
          scheduledTime: scheduledTime.toISOString(),
        },
      },
      trigger
    );

    return notificationId;
  }

  /**
   * Calculate notification times between start and end dates
   */
  private calculateNotificationTimes(
    times: string[],
    startDate: Date,
    endDate: Date
  ): Date[] {
    const notificationTimes: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      for (const time of times) {
        const [hours, minutes] = time.split(':').map(Number);
        const notificationDate = new Date(currentDate);
        notificationDate.setHours(hours, minutes, 0, 0);

        if (notificationDate >= new Date()) {
          notificationTimes.push(new Date(notificationDate));
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return notificationTimes;
  }

  /**
   * Play voice alert
   */
  async playVoiceAlert(medicineName: string, dosage: string): Promise<void> {
    try {
      const message = `Time to take your medicine. ${medicineName}, ${dosage}. Please take your medicine now.`;
      await Tts.speak(message);
    } catch (error) {
      console.error('Error playing voice alert:', error);
    }
  }

  /**
   * Stop voice alert
   */
  async stopVoiceAlert(): Promise<void> {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('Error stopping voice alert:', error);
    }
  }

  /**
   * Mark reminder as taken
   */
  async markAsTaken(reminderId: string): Promise<void> {
    try {
      // Cancel the notification
      const scheduled = await this.getScheduledNotifications();
      const notification = scheduled.find(n => n.reminderId === reminderId);
      
      if (notification) {
        await notifee.cancelNotification(notification.notificationId);
        await this.removeScheduledNotification(notification.notificationId);
      }

      // You can also call your backend API here to update the status
      console.log(`Marked reminder ${reminderId} as taken`);
    } catch (error) {
      console.error('Error marking reminder as taken:', error);
    }
  }

  /**
   * Snooze reminder
   */
  async snoozeReminder(reminderId: string, minutes: number = 10): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const notification = scheduled.find(n => n.reminderId === reminderId);
      
      if (notification) {
        // Cancel current notification
        await notifee.cancelNotification(notification.notificationId);
        
        // Schedule new notification after snooze time
        const snoozeTime = new Date(Date.now() + minutes * 60000);
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: snoozeTime.getTime(),
        };

        await notifee.createTriggerNotification(
          {
            id: `snooze-${reminderId}-${Date.now()}`,
            title: `💊 Snoozed: ${notification.medicineName}`,
            body: `Time to take your medicine`,
            android: {
              channelId: this.channelId,
              importance: AndroidImportance.HIGH,
            },
            data: {
              reminderId,
              medicineName: notification.medicineName,
            },
          },
          trigger
        );

        console.log(`Snoozed reminder ${reminderId} for ${minutes} minutes`);
      }
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  }

  /**
   * Cancel a reminder
   */
  async cancelReminder(reminderId: string): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const notifications = scheduled.filter(n => n.reminderId === reminderId);
      
      for (const notification of notifications) {
        await notifee.cancelNotification(notification.notificationId);
        await this.removeScheduledNotification(notification.notificationId);
      }

      console.log(`Cancelled all notifications for reminder ${reminderId}`);
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  }

  /**
   * Cancel all reminders
   */
  async cancelAllReminders(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      await AsyncStorage.removeItem(this.storageKey);
      console.log('Cancelled all reminders');
    } catch (error) {
      console.error('Error cancelling all reminders:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Save scheduled notification
   */
  private async saveScheduledNotification(
    notification: ScheduledNotification
  ): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();
      scheduled.push(notification);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(scheduled));
    } catch (error) {
      console.error('Error saving scheduled notification:', error);
    }
  }

  /**
   * Remove scheduled notification
   */
  private async removeScheduledNotification(notificationId: string): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const filtered = scheduled.filter(n => n.notificationId !== notificationId);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing scheduled notification:', error);
    }
  }

  /**
   * Display immediate notification (for testing)
   */
  async displayImmediateNotification(
    medicineName: string,
    dosage: string
  ): Promise<void> {
    try {
      await notifee.displayNotification({
        title: `💊 Time for ${medicineName}`,
        body: `Take ${dosage} now`,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [300, 500, 300, 500],
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });
    } catch (error) {
      console.error('Error displaying immediate notification:', error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus >= 1;
    } catch (error) {
      console.error('Error checking notification settings:', error);
      return false;
    }
  }
}

export default MedicineReminderService.getInstance();
