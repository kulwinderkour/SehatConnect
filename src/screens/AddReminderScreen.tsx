/**
 * Add Reminder Screen
 * Simple UI for creating medicine reminders
 * Works 100% offline - syncs later
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    Platform,
} from 'react-native';
import { ArrowLeft, Clock, Pill, Calendar, Check } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import OfflineReminderService from '../services/OfflineReminderService';
import AlarmReminderService from '../services/AlarmReminderService';

interface AddReminderScreenProps {
    navigation: any;
}

const AddReminderScreen: React.FC<AddReminderScreenProps> = ({ navigation }) => {
    const [medicineName, setMedicineName] = useState('');
    const [dosage, setDosage] = useState('');
    const [time, setTime] = useState(new Date());
    const [frequency, setFrequency] = useState<'once' | 'daily'>('daily');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [saving, setSaving] = useState(false);

    const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setTime(selectedDate);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!medicineName.trim()) {
            Alert.alert('Error', 'Please enter medicine name');
            return;
        }
        if (!dosage.trim()) {
            Alert.alert('Error', 'Please enter dosage');
            return;
        }

        try {
            setSaving(true);

            // 1. Save to local storage (offline-first)
            const reminder = await OfflineReminderService.createReminder(
                medicineName.trim(),
                dosage.trim(),
                formatTime(time),
                frequency
            );

            console.log('[AddReminderScreen] Created reminder:', reminder);

            // 2. Schedule alarm notification
            await AlarmReminderService.scheduleAlarm(
                reminder.id,
                reminder.medicineName,
                reminder.dosage,
                reminder.time,
                reminder.frequency
            );

            console.log('[AddReminderScreen] Scheduled alarm for:', formatTime(time));

            Alert.alert(
                '✅ Reminder Set!',
                `You'll be reminded to take ${medicineName} at ${formatTime(time)}${frequency === 'daily' ? ' every day' : ''}.\n\nThis will work even if your phone is offline or the app is closed.`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('[AddReminderScreen] Error:', error);
            Alert.alert('Error', 'Failed to create reminder. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleTestAlarm = async () => {
        if (!medicineName.trim() || !dosage.trim()) {
            Alert.alert('Fill Details', 'Enter medicine name and dosage first');
            return;
        }

        try {
            await AlarmReminderService.testAlarm(medicineName.trim(), dosage.trim());
            Alert.alert('Test Sent!', 'Check your notification panel');
        } catch (error) {
            console.error('[AddReminderScreen] Test alarm error:', error);
            Alert.alert('Error', 'Failed to send test notification');
        }
    };

    const handleTestAlarm10Sec = async () => {
        if (!medicineName.trim() || !dosage.trim()) {
            Alert.alert('Fill Details', 'Enter medicine name and dosage first');
            return;
        }

        try {
            await AlarmReminderService.testAlarmIn10Seconds(medicineName.trim(), dosage.trim());
            Alert.alert(
                '⏰ Alarm Scheduled!',
                'The alarm will trigger in 10 seconds.\n\nYou can:\n• Lock your phone\n• Close this app\n• Turn on airplane mode\n\nThe alarm will still trigger!'
            );
        } catch (error) {
            console.error('[AddReminderScreen] Test alarm 10s error:', error);
            Alert.alert('Error', 'Failed to schedule test alarm');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#52B788', '#40916C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Medicine Reminder</Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Medicine Name Input */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Pill size={18} color="#52B788" />
                        <Text style={styles.label}>Medicine Name</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Amlodipine"
                        placeholderTextColor="#999"
                        value={medicineName}
                        onChangeText={setMedicineName}
                        autoCapitalize="words"
                    />
                </View>

                {/* Dosage Input */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Text style={styles.labelIcon}>💊</Text>
                        <Text style={styles.label}>Dosage</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 5mg, 1 tablet"
                        placeholderTextColor="#999"
                        value={dosage}
                        onChangeText={setDosage}
                    />
                </View>

                {/* Time Picker */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Clock size={18} color="#52B788" />
                        <Text style={styles.label}>Reminder Time</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={styles.timeText}>{formatTime(time)}</Text>
                        <Text style={styles.timeHint}>Tap to change</Text>
                    </TouchableOpacity>
                </View>

                {showTimePicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleTimeChange}
                    />
                )}

                {/* Frequency Toggle */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Calendar size={18} color="#52B788" />
                        <Text style={styles.label}>Frequency</Text>
                    </View>
                    <View style={styles.frequencyContainer}>
                        <TouchableOpacity
                            style={[
                                styles.frequencyOption,
                                frequency === 'daily' && styles.frequencyOptionActive,
                            ]}
                            onPress={() => setFrequency('daily')}
                        >
                            {frequency === 'daily' && (
                                <Check size={16} color="#fff" style={styles.checkIcon} />
                            )}
                            <Text
                                style={[
                                    styles.frequencyText,
                                    frequency === 'daily' && styles.frequencyTextActive,
                                ]}
                            >
                                Daily
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.frequencyOption,
                                frequency === 'once' && styles.frequencyOptionActive,
                            ]}
                            onPress={() => setFrequency('once')}
                        >
                            {frequency === 'once' && (
                                <Check size={16} color="#fff" style={styles.checkIcon} />
                            )}
                            <Text
                                style={[
                                    styles.frequencyText,
                                    frequency === 'once' && styles.frequencyTextActive,
                                ]}
                            >
                                Once
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>📢 How it works</Text>
                    <Text style={styles.infoText}>
                        • Reminders work offline - no internet needed{'\n'}
                        • Alarm will ring even if app is closed{'\n'}
                        • Tap "Taken" or "Snooze" when reminded
                    </Text>
                </View>

                {/* Test Button */}
                <TouchableOpacity style={styles.testButton} onPress={handleTestAlarm}>
                    <Text style={styles.testButtonText}>🔔 Test Alarm Now</Text>
                </TouchableOpacity>

                {/* Test in 10 seconds Button - for hackathon demo */}
                <TouchableOpacity style={styles.testButton10Sec} onPress={handleTestAlarm10Sec}>
                    <Text style={styles.testButton10SecText}>⏰ Test Alarm in 10 Seconds</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={['#52B788', '#40916C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButtonGradient}
                    >
                        <Text style={styles.saveButtonText}>
                            {saving ? 'Saving...' : '✓ Save Reminder'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8FF',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    labelIcon: {
        fontSize: 18,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#52B788',
        letterSpacing: 2,
    },
    timeHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    frequencyOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        gap: 8,
    },
    frequencyOptionActive: {
        backgroundColor: '#52B788',
        borderColor: '#52B788',
    },
    frequencyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    frequencyTextActive: {
        color: '#fff',
    },
    checkIcon: {
        marginRight: 4,
    },
    infoCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#52B788',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D6A4F',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#52796F',
        lineHeight: 20,
    },
    testButton: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    testButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E65100',
    },
    testButton10Sec: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#64B5F6',
    },
    testButton10SecText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1565C0',
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonGradient: {
        padding: 18,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
});

export default AddReminderScreen;
