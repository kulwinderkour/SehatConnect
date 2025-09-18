import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Appointment, AppointmentStatus } from '../../types/health';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: (appointment: Appointment) => void;
  onActionPress?: (appointment: Appointment) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'upcoming';
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  onActionPress,
  showActions = true,
  variant = 'default'
}) => {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'confirmed':
        return '#5a9e31';
      case 'in-progress':
        return '#f59e0b';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'rescheduled':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'confirmed':
        return 'Confirmed';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rescheduled':
        return 'Rescheduled';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video-consultation':
        return '📹';
      case 'phone-consultation':
        return '📞';
      case 'in-person':
        return '🏥';
      case 'follow-up':
        return '🔄';
      default:
        return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        style={styles.compactCard} 
        onPress={() => onPress(appointment)}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Text style={styles.compactTypeIcon}>{getTypeIcon(appointment.type)}</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactDoctorName}>{appointment.doctorName}</Text>
              <Text style={styles.compactSpecialty}>{appointment.doctorSpecialty}</Text>
            </View>
            <View style={[
              styles.compactStatusBadge,
              { backgroundColor: getStatusColor(appointment.status) + '20' }
            ]}>
              <Text style={[
                styles.compactStatusText,
                { color: getStatusColor(appointment.status) }
              ]}>
                {getStatusText(appointment.status)}
              </Text>
            </View>
          </View>
          <View style={styles.compactFooter}>
            <Text style={styles.compactDateTime}>
              {formatDate(appointment.date)} • {formatTime(appointment.time)}
            </Text>
            {appointment.followUpRequired && (
              <Text style={styles.compactFollowUp}>Follow-up required</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'upcoming') {
    return (
      <TouchableOpacity 
        style={styles.upcomingCard} 
        onPress={() => onPress(appointment)}
        activeOpacity={0.8}
      >
        <View style={styles.upcomingContent}>
          <View style={styles.upcomingHeader}>
            <Text style={styles.upcomingTypeIcon}>{getTypeIcon(appointment.type)}</Text>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingTitle} numberOfLines={1}>
                {appointment.doctorName} - {appointment.doctorSpecialty}
              </Text>
              <Text style={styles.upcomingDateTime} numberOfLines={1}>
                {formatDate(appointment.date)} at {formatTime(appointment.time)}
              </Text>
            </View>
            <View style={[
              styles.upcomingStatusBadge,
              { backgroundColor: getStatusColor(appointment.status) + '20' }
            ]}>
              <Text style={[
                styles.upcomingStatusText,
                { color: getStatusColor(appointment.status) }
              ]}>
                {getStatusText(appointment.status)}
              </Text>
            </View>
          </View>
          {appointment.symptoms && appointment.symptoms.length > 0 && (
            <View style={styles.upcomingSymptoms}>
              <Text style={styles.upcomingSymptomsLabel}>Symptoms:</Text>
              <Text style={styles.upcomingSymptomsText} numberOfLines={2}>
                {appointment.symptoms.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity 
      style={styles.defaultCard} 
      onPress={() => onPress(appointment)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Text style={styles.typeIcon}>{getTypeIcon(appointment.type)}</Text>
            <Text style={styles.typeText}>{appointment.type.replace('-', ' ')}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(appointment.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(appointment.status) }
            ]}>
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          <Text style={styles.specialty}>{appointment.doctorSpecialty}</Text>
          
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateTime}>
              📅 {formatDate(appointment.date)} at {formatTime(appointment.time)}
            </Text>
            <Text style={styles.duration}>
              ⏱️ {appointment.duration} minutes
            </Text>
          </View>

          {appointment.symptoms && appointment.symptoms.length > 0 && (
            <View style={styles.symptomsContainer}>
              <Text style={styles.symptomsLabel}>Symptoms:</Text>
              <Text style={styles.symptomsText}>
                {appointment.symptoms.join(', ')}
              </Text>
            </View>
          )}

          {appointment.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          )}

          {appointment.followUpRequired && (
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpText}>🔄 Follow-up required</Text>
            </View>
          )}
        </View>

        {showActions && onActionPress && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onActionPress(appointment)}
            >
              <Text style={styles.actionButtonText}>
                {appointment.status === 'scheduled' ? 'Join' : 'View Details'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default card styles
  defaultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  dateTimeContainer: {
    marginBottom: 12,
  },
  dateTime: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#6b7280',
  },
  symptomsContainer: {
    marginBottom: 12,
  },
  symptomsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
  },
  followUpContainer: {
    marginBottom: 12,
  },
  followUpText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  actions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Compact card styles
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  compactContent: {
    gap: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactTypeIcon: {
    fontSize: 16,
  },
  compactInfo: {
    flex: 1,
  },
  compactDoctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  compactSpecialty: {
    fontSize: 12,
    color: '#6b7280',
  },
  compactStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  compactStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  compactFooter: {
    gap: 4,
  },
  compactDateTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  compactFollowUp: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
  },

  // Upcoming card styles
  upcomingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 120,
  },
  upcomingContent: {
    gap: 12,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },
  upcomingTypeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  upcomingInfo: {
    flex: 1,
    marginRight: 12,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  upcomingDateTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  upcomingStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  upcomingStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  upcomingSymptoms: {
    gap: 4,
  },
  upcomingSymptomsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  upcomingSymptomsText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default AppointmentCard;
