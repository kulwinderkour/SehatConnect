import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { 
  MapPin, 
  CheckCircle, 
  Truck, 
  Hospital,
  Share,
  Phone,
  ArrowLeft
} from 'lucide-react-native';
import { EmergencyTracker as EmergencyTrackerType } from '../../types/emergency';

interface EmergencyTrackerProps {
  tracker: EmergencyTrackerType;
  onComplete: () => void;
  onBack?: () => void;
}

const EmergencyTracker: React.FC<EmergencyTrackerProps> = ({
  tracker,
  onComplete,
  onBack,
}) => {

  const getEstimatedArrivalText = () => {
    const remainingTime = tracker.estimatedArrival - Date.now();
    if (remainingTime <= 0) return 'Arriving now';
    
    const minutes = Math.floor(remainingTime / (1000 * 60));
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  const getStatusColor = () => {
    switch (tracker.ambulanceStatus) {
      case 'dispatched': return '#f59e0b';
      case 'en_route': return '#3b82f6';
      case 'arrived': return '#10b981';
      case 'transporting': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (tracker.ambulanceStatus) {
      case 'dispatched': return 'Ambulance Dispatched';
      case 'en_route': return 'En Route to Location';
      case 'arrived': return 'Arrived at Scene';
      case 'transporting': return 'Transporting to Hospital';
      default: return 'Unknown Status';
    }
  };

  const handleShareLocation = () => {
    const locationUrl = `https://maps.google.com/?q=${tracker.incident.location.latitude},${tracker.incident.location.longitude}`;
    Alert.alert(
      'Share Location',
      'Share your location with family members?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share',
          onPress: () => {
            // In a real app, this would share via system share sheet
            Linking.openURL(`sms:?body=Emergency situation - My location: ${locationUrl}`);
          }
        }
      ]
    );
  };

  const handleCallAmbulance = () => {
    Alert.alert(
      'Contact Ambulance',
      'Call the ambulance service directly?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:108') }
      ]
    );
  };

  const renderTimelineItem = (
    icon: React.ReactNode,
    title: string,
    time: string,
    isCompleted: boolean,
    description?: string
  ) => (
    <View style={styles.timelineItem}>
      <View style={[
        styles.timelineIcon,
        isCompleted ? styles.timelineIconCompleted : styles.timelineIconPending
      ]}>
        {icon}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[
          styles.timelineTitle,
          isCompleted ? styles.timelineTitleCompleted : styles.timelineTitlePending
        ]}>
          {title}
        </Text>
        <Text style={styles.timelineTime}>{time}</Text>
        {description && (
          <Text style={styles.timelineDescription}>{description}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Emergency Tracking</Text>
        <Text style={styles.subtitle}>
          Live updates for your emergency response
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Status Card */}
        <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
              <Truck size={24} color="#fff" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>{getStatusText()}</Text>
              <Text style={styles.statusTime}>
                ETA: {getEstimatedArrivalText()}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusDetails}>
            <View style={styles.statusItem}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.statusText}>
                Location: {tracker.incident.location.address}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Hospital size={16} color="#6b7280" />
              <Text style={styles.statusText}>
                Hospital: {tracker.hospitalNotified ? 'Notified ✓' : 'Pending'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Phone size={16} color="#6b7280" />
              <Text style={styles.statusText}>
                Family: {tracker.familyNotified ? 'Notified ✓' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareLocation}
          >
            <Share size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Share Location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCallAmbulance}
          >
            <Phone size={20} color="#ef4444" />
            <Text style={styles.actionButtonText}>Call Ambulance</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineSectionTitle}>Response Timeline</Text>
          
          {renderTimelineItem(
            <CheckCircle size={16} color="#fff" />,
            'Emergency Alert Sent',
            new Date(tracker.incident.timestamp).toLocaleTimeString(),
            true,
            'Emergency services and contacts notified'
          )}
          
          {renderTimelineItem(
            <Truck size={16} color={tracker.ambulanceStatus === 'dispatched' ? '#fff' : '#9ca3af'} />,
            'Ambulance Dispatched',
            tracker.ambulanceStatus === 'dispatched' ? 
              new Date(tracker.incident.timestamp + 2 * 60 * 1000).toLocaleTimeString() : 
              'Pending',
            ['dispatched', 'en_route', 'arrived', 'transporting'].includes(tracker.ambulanceStatus)
          )}
          
          {renderTimelineItem(
            <MapPin size={16} color={tracker.ambulanceStatus === 'en_route' ? '#fff' : '#9ca3af'} />,
            'En Route to Location',
            tracker.ambulanceStatus === 'en_route' ? 
              new Date(tracker.incident.timestamp + 5 * 60 * 1000).toLocaleTimeString() : 
              'Pending',
            ['en_route', 'arrived', 'transporting'].includes(tracker.ambulanceStatus)
          )}
          
          {renderTimelineItem(
            <CheckCircle size={16} color={tracker.ambulanceStatus === 'arrived' ? '#fff' : '#9ca3af'} />,
            'Arrived at Scene',
            tracker.ambulanceStatus === 'arrived' ? 
              new Date(tracker.estimatedArrival).toLocaleTimeString() : 
              'Pending',
            ['arrived', 'transporting'].includes(tracker.ambulanceStatus)
          )}
          
          {renderTimelineItem(
            <Hospital size={16} color={tracker.ambulanceStatus === 'transporting' ? '#fff' : '#9ca3af'} />,
            'Transporting to Hospital',
            tracker.ambulanceStatus === 'transporting' ? 
              new Date(tracker.estimatedArrival + 10 * 60 * 1000).toLocaleTimeString() : 
              'Pending',
            tracker.ambulanceStatus === 'transporting'
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onComplete}
        >
          <Text style={styles.completeButtonText}>
            View Post-Emergency Support
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          Emergency ID: #{tracker.incident.id.substring(0, 8)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  statusDetails: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timelineContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  timelineSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineIconCompleted: {
    backgroundColor: '#10b981',
  },
  timelineIconPending: {
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineTitleCompleted: {
    color: '#111827',
  },
  timelineTitlePending: {
    color: '#9ca3af',
  },
  timelineTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default EmergencyTracker;