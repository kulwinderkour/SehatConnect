/**
 * Alarm Reminder Service
 * Handles LOUD, alarm-style notifications that work offline
 * Uses Android AlarmManager via Notifee for reliability
 */

import notifee, {
    AndroidImportance,
    AndroidVisibility,
    TriggerType,
    TimestampTrigger,
    AndroidCategory,
    EventType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Increment version when channel settings need to change
// Android caches channels - new ID forces fresh settings
const ALARM_CHANNEL_ID = 'medicine-alarm-v3';
const SCHEDULED_ALARMS_KEY = '@scheduled_alarms';

export interface AlarmData {
    reminderId: string;
    medicineName: string;
    dosage: string;
    scheduledTime: number;
    notificationId: string;
}

class AlarmReminderService {
    private static instance: AlarmReminderService;
    private initialized = false;

    private constructor() { }

    public static getInstance(): AlarmReminderService {
        if (!AlarmReminderService.instance) {
            AlarmReminderService.instance = new AlarmReminderService();
        }
        return AlarmReminderService.instance;
    }

    /**
     * Initialize the alarm service - MUST be called on app start
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Create ALARM-level notification channel (Android only)
            if (Platform.OS === 'android') {
                // Delete old channel if exists (to force new settings)
                try {
                    await notifee.deleteChannel('medicine-alarm-loud');
                } catch (e) {
                    // Channel might not exist, that's fine
                }

                // Create new channel with maximum alarm settings
                // Using a versioned channel ID forces new settings
                await notifee.createChannel({
                    id: ALARM_CHANNEL_ID,
                    name: 'Medicine Alarms (Loud)',
                    description: 'LOUD medicine reminders - rings like an alarm',
                    importance: AndroidImportance.HIGH,
                    // Use system alarm sound for loud ringing
                    sound: 'default',
                    vibration: true,
                    vibrationPattern: [500, 500, 500, 500, 500, 500],
                    bypassDnd: true,
                    visibility: AndroidVisibility.PUBLIC,
                    lights: true,
                    lightColor: '#FF0000',
                });

                console.log('[AlarmReminderService] Alarm channel created with LOUD settings');
            }

            // Request permissions
            await this.requestPermissions();

            // Set up notification event handlers
            this.setupEventHandlers();

            this.initialized = true;
            console.log('[AlarmReminderService] Initialized successfully');
        } catch (error) {
            console.error('[AlarmReminderService] Init error:', error);
        }
    }

    /**
     * Request all necessary permissions
     */
    private async requestPermissions(): Promise<boolean> {
        try {
            const settings = await notifee.requestPermission();

            if (Platform.OS === 'android') {
                // Check for exact alarm permission (Android 12+)
                const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
                if (batteryOptimizationEnabled) {
                    console.log('[AlarmReminderService] Battery optimization is enabled - alarms may be delayed');
                }
            }

            return settings.authorizationStatus >= 1;
        } catch (error) {
            console.error('[AlarmReminderService] Permission error:', error);
            return false;
        }
    }

    /**
     * Set up notification action handlers
     */
    private setupEventHandlers(): void {
        // Foreground events
        notifee.onForegroundEvent(async ({ type, detail }) => {
            const { notification, pressAction } = detail;

            if (type === EventType.PRESS) {
                console.log('[AlarmReminderService] Notification pressed');
            }

            if (type === EventType.ACTION_PRESS) {
                const reminderId = notification?.data?.reminderId as string;

                if (pressAction?.id === 'taken') {
                    console.log('[AlarmReminderService] Marked as TAKEN:', reminderId);
                    await this.dismissAlarm(notification?.id || '');
                } else if (pressAction?.id === 'snooze') {
                    console.log('[AlarmReminderService] SNOOZED:', reminderId);
                    await this.snoozeAlarm(reminderId, notification?.data?.medicineName as string, notification?.data?.dosage as string);
                    await this.dismissAlarm(notification?.id || '');
                }
            }
        });

        // Background events (when app is killed)
        notifee.onBackgroundEvent(async ({ type, detail }) => {
            const { notification, pressAction } = detail;

            if (type === EventType.ACTION_PRESS) {
                const reminderId = notification?.data?.reminderId as string;

                if (pressAction?.id === 'taken') {
                    await this.dismissAlarm(notification?.id || '');
                } else if (pressAction?.id === 'snooze') {
                    await this.snoozeAlarm(reminderId, notification?.data?.medicineName as string, notification?.data?.dosage as string);
                    await this.dismissAlarm(notification?.id || '');
                }
            }
        });
    }

    /**
     * Schedule an alarm for a medicine reminder
     * This will trigger even if app is killed, phone locked, or offline
     */
    async scheduleAlarm(
        reminderId: string,
        medicineName: string,
        dosage: string,
        time: string, // "HH:mm" format
        frequency: 'once' | 'daily'
    ): Promise<string> {
        await this.initialize();

        // Parse time and calculate next trigger
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);

        const triggerDate = new Date();
        triggerDate.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (triggerDate.getTime() <= now.getTime()) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        const notificationId = `alarm-${reminderId}-${Date.now()}`;

        // Create trigger
        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerDate.getTime(),
            alarmManager: {
                allowWhileIdle: true, // Critical: ensures alarm fires even in Doze mode
            },
        };

        // Schedule the notification
        await notifee.createTriggerNotification(
            {
                id: notificationId,
                title: '💊 Time for your medicine!',
                body: `Take ${medicineName} - ${dosage}`,
                android: {
                    channelId: ALARM_CHANNEL_ID,
                    importance: AndroidImportance.HIGH,
                    category: AndroidCategory.ALARM,
                    visibility: AndroidVisibility.PUBLIC,
                    fullScreenAction: {
                        id: 'default',
                    },
                    pressAction: {
                        id: 'default',
                    },
                    // Sound and vibration for alarm
                    sound: 'default',
                    vibrationPattern: [500, 500, 500, 500, 500, 500],
                    autoCancel: false,
                    ongoing: true,
                    actions: [
                        {
                            title: '✅ Taken',
                            pressAction: { id: 'taken' },
                        },
                        {
                            title: '⏰ Snooze 10 min',
                            pressAction: { id: 'snooze' },
                        },
                    ],
                },
                data: {
                    reminderId,
                    medicineName,
                    dosage,
                    scheduledTime: triggerDate.getTime().toString(),
                },
            },
            trigger
        );

        // Save alarm data locally
        await this.saveAlarmData({
            reminderId,
            medicineName,
            dosage,
            scheduledTime: triggerDate.getTime(),
            notificationId,
        });

        console.log(`[AlarmReminderService] Scheduled alarm for ${medicineName} at ${triggerDate.toLocaleString()}`);
        return notificationId;
    }

    /**
     * Cancel an alarm by reminder ID
     */
    async cancelAlarm(reminderId: string): Promise<void> {
        const alarms = await this.getScheduledAlarms();
        const alarm = alarms.find(a => a.reminderId === reminderId);

        if (alarm) {
            await notifee.cancelNotification(alarm.notificationId);
            await this.removeAlarmData(alarm.notificationId);
            console.log('[AlarmReminderService] Cancelled alarm:', reminderId);
        }
    }

    /**
     * Dismiss a notification
     */
    private async dismissAlarm(notificationId: string): Promise<void> {
        await notifee.cancelNotification(notificationId);
        await this.removeAlarmData(notificationId);
    }

    /**
     * Snooze an alarm for 10 minutes
     */
    private async snoozeAlarm(reminderId: string, medicineName: string, dosage: string): Promise<void> {
        const snoozeTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const notificationId = `snooze-${reminderId}-${Date.now()}`;

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: snoozeTime.getTime(),
            alarmManager: {
                allowWhileIdle: true,
            },
        };

        await notifee.createTriggerNotification(
            {
                id: notificationId,
                title: '💊 Snoozed Reminder!',
                body: `Take ${medicineName} - ${dosage}`,
                android: {
                    channelId: ALARM_CHANNEL_ID,
                    importance: AndroidImportance.HIGH,
                    category: AndroidCategory.ALARM,
                    fullScreenAction: { id: 'default' },
                    ongoing: true,
                    autoCancel: false,
                    actions: [
                        { title: '✅ Taken', pressAction: { id: 'taken' } },
                        { title: '⏰ Snooze 10 min', pressAction: { id: 'snooze' } },
                    ],
                },
                data: { reminderId, medicineName, dosage },
            },
            trigger
        );

        console.log(`[AlarmReminderService] Snoozed ${medicineName} until ${snoozeTime.toLocaleTimeString()}`);
    }

    /**
     * Test alarm - trigger immediately
     */
    async testAlarm(medicineName: string, dosage: string): Promise<void> {
        await this.initialize();

        await notifee.displayNotification({
            title: '💊 TEST: Time for your medicine!',
            body: `Take ${medicineName} - ${dosage}`,
            android: {
                channelId: ALARM_CHANNEL_ID,
                importance: AndroidImportance.HIGH,
                category: AndroidCategory.ALARM,
                visibility: AndroidVisibility.PUBLIC,
                fullScreenAction: { id: 'default' },
                sound: 'default',
                vibrationPattern: [500, 500, 500, 500, 500, 500],
                ongoing: true,
                autoCancel: false,
                actions: [
                    { title: '✅ Taken', pressAction: { id: 'taken' } },
                    { title: '⏰ Snooze 10 min', pressAction: { id: 'snooze' } },
                ],
            },
            data: {
                reminderId: 'test',
                medicineName,
                dosage,
            },
        });

        console.log('[AlarmReminderService] Test alarm triggered');
    }

    /**
     * Test alarm - schedule for 10 seconds from now (for demo)
     * This tests the actual alarm scheduling mechanism
     */
    async testAlarmIn10Seconds(medicineName: string, dosage: string): Promise<void> {
        await this.initialize();

        const triggerTime = new Date(Date.now() + 10 * 1000); // 10 seconds from now

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerTime.getTime(),
            alarmManager: {
                allowWhileIdle: true,
            },
        };

        await notifee.createTriggerNotification(
            {
                id: `test-alarm-${Date.now()}`,
                title: '💊 TEST: Time for your medicine!',
                body: `Take ${medicineName} - ${dosage}`,
                android: {
                    channelId: ALARM_CHANNEL_ID,
                    importance: AndroidImportance.HIGH,
                    category: AndroidCategory.ALARM,
                    visibility: AndroidVisibility.PUBLIC,
                    fullScreenAction: { id: 'default' },
                    sound: 'default',
                    vibrationPattern: [500, 500, 500, 500, 500, 500],
                    ongoing: true,
                    autoCancel: false,
                    actions: [
                        { title: '✅ Taken', pressAction: { id: 'taken' } },
                        { title: '⏰ Snooze 10 min', pressAction: { id: 'snooze' } },
                    ],
                },
                data: {
                    reminderId: 'test-10s',
                    medicineName,
                    dosage,
                },
            },
            trigger
        );

        console.log(`[AlarmReminderService] Test alarm scheduled for ${triggerTime.toLocaleTimeString()}`);
    }

    /**
     * Get all scheduled alarms
     */
    async getScheduledAlarms(): Promise<AlarmData[]> {
        try {
            const data = await AsyncStorage.getItem(SCHEDULED_ALARMS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Save alarm data
     */
    private async saveAlarmData(alarm: AlarmData): Promise<void> {
        const alarms = await this.getScheduledAlarms();
        alarms.push(alarm);
        await AsyncStorage.setItem(SCHEDULED_ALARMS_KEY, JSON.stringify(alarms));
    }

    /**
     * Remove alarm data
     */
    private async removeAlarmData(notificationId: string): Promise<void> {
        const alarms = await this.getScheduledAlarms();
        const filtered = alarms.filter(a => a.notificationId !== notificationId);
        await AsyncStorage.setItem(SCHEDULED_ALARMS_KEY, JSON.stringify(filtered));
    }

    /**
     * Cancel all alarms
     */
    async cancelAllAlarms(): Promise<void> {
        await notifee.cancelAllNotifications();
        await AsyncStorage.removeItem(SCHEDULED_ALARMS_KEY);
        console.log('[AlarmReminderService] Cancelled all alarms');
    }
}

export default AlarmReminderService.getInstance();
