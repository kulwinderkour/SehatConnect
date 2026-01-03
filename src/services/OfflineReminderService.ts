/**
 * Offline Reminder Service
 * Handles local-first medicine reminder storage with AsyncStorage
 * Works 100% offline - syncs when internet available
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple ID generator (no external dependency)
const generateId = (): string => {
    return 'rem_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};


export interface OfflineReminder {
    id: string;
    medicineName: string;
    dosage: string;
    time: string; // "HH:mm" format
    frequency: 'once' | 'daily';
    enabled: boolean;
    createdAt: number;
    updatedAt: number;
    synced: boolean;
}

const STORAGE_KEY = '@offline_reminders';

class OfflineReminderService {
    private static instance: OfflineReminderService;

    private constructor() { }

    public static getInstance(): OfflineReminderService {
        if (!OfflineReminderService.instance) {
            OfflineReminderService.instance = new OfflineReminderService();
        }
        return OfflineReminderService.instance;
    }

    /**
     * Get all reminders from local storage
     */
    async getAllReminders(): Promise<OfflineReminder[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[OfflineReminderService] Error getting reminders:', error);
            return [];
        }
    }

    /**
     * Get enabled reminders only
     */
    async getEnabledReminders(): Promise<OfflineReminder[]> {
        const reminders = await this.getAllReminders();
        return reminders.filter(r => r.enabled);
    }

    /**
     * Get a single reminder by ID
     */
    async getReminderById(id: string): Promise<OfflineReminder | null> {
        const reminders = await this.getAllReminders();
        return reminders.find(r => r.id === id) || null;
    }

    /**
     * Create a new reminder (saves locally first)
     */
    async createReminder(
        medicineName: string,
        dosage: string,
        time: string,
        frequency: 'once' | 'daily' = 'daily'
    ): Promise<OfflineReminder> {
        const now = Date.now();
        const reminder: OfflineReminder = {
            id: generateId(),
            medicineName,
            dosage,
            time,
            frequency,
            enabled: true,
            createdAt: now,
            updatedAt: now,
            synced: false, // Will sync when internet available
        };

        const reminders = await this.getAllReminders();
        reminders.push(reminder);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));

        console.log('[OfflineReminderService] Created reminder:', reminder.id);
        return reminder;
    }

    /**
     * Update an existing reminder
     */
    async updateReminder(
        id: string,
        updates: Partial<Omit<OfflineReminder, 'id' | 'createdAt'>>
    ): Promise<OfflineReminder | null> {
        const reminders = await this.getAllReminders();
        const index = reminders.findIndex(r => r.id === id);

        if (index === -1) {
            console.error('[OfflineReminderService] Reminder not found:', id);
            return null;
        }

        reminders[index] = {
            ...reminders[index],
            ...updates,
            updatedAt: Date.now(),
            synced: false, // Mark for re-sync
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
        console.log('[OfflineReminderService] Updated reminder:', id);
        return reminders[index];
    }

    /**
     * Toggle reminder enabled/disabled
     */
    async toggleReminder(id: string): Promise<OfflineReminder | null> {
        const reminder = await this.getReminderById(id);
        if (!reminder) return null;

        return this.updateReminder(id, { enabled: !reminder.enabled });
    }

    /**
     * Delete a reminder
     */
    async deleteReminder(id: string): Promise<boolean> {
        const reminders = await this.getAllReminders();
        const filtered = reminders.filter(r => r.id !== id);

        if (filtered.length === reminders.length) {
            return false; // Not found
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log('[OfflineReminderService] Deleted reminder:', id);
        return true;
    }

    /**
     * Get unsynced reminders (for background sync)
     */
    async getUnsyncedReminders(): Promise<OfflineReminder[]> {
        const reminders = await this.getAllReminders();
        return reminders.filter(r => !r.synced);
    }

    /**
     * Mark reminders as synced
     */
    async markAsSynced(ids: string[]): Promise<void> {
        const reminders = await this.getAllReminders();
        const updated = reminders.map(r =>
            ids.includes(r.id) ? { ...r, synced: true } : r
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log('[OfflineReminderService] Marked as synced:', ids);
    }

    /**
     * Clear all reminders (for testing/reset)
     */
    async clearAll(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log('[OfflineReminderService] Cleared all reminders');
    }

    /**
     * Import reminders from backend (for sync)
     * Uses "last updated wins" strategy
     */
    async importFromBackend(backendReminders: any[]): Promise<void> {
        const localReminders = await this.getAllReminders();
        const merged: OfflineReminder[] = [...localReminders];

        for (const backendReminder of backendReminders) {
            const localIndex = merged.findIndex(
                r => r.id === backendReminder._id || r.id === backendReminder.id
            );

            const converted: OfflineReminder = {
                id: backendReminder._id || backendReminder.id,
                medicineName: backendReminder.medicineName,
                dosage: backendReminder.dosage,
                time: backendReminder.times?.[0] || backendReminder.time || '08:00',
                frequency: backendReminder.frequency === 'once_daily' ? 'once' : 'daily',
                enabled: backendReminder.isActive ?? true,
                createdAt: new Date(backendReminder.createdAt).getTime(),
                updatedAt: new Date(backendReminder.updatedAt).getTime(),
                synced: true,
            };

            if (localIndex === -1) {
                // New from backend
                merged.push(converted);
            } else {
                // Conflict - last updated wins
                if (converted.updatedAt > merged[localIndex].updatedAt) {
                    merged[localIndex] = converted;
                }
            }
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        console.log('[OfflineReminderService] Imported', backendReminders.length, 'reminders from backend');
    }
}

export default OfflineReminderService.getInstance();
