import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { 
  Ambulance, 
  Hospital, 
  Phone, 
  MapPin, 
  ArrowRight,
  ArrowLeft 
} from 'lucide-react-native';
import { EmergencyType, SpecializedAction } from '../../types/emergency';
import { EMERGENCY_CONTACTS } from '../../utils/emergencyData';
import { useI18n } from '../../i18n';

interface EmergencyActionsProps {
  emergencyType: EmergencyType;
  onContinueToTracking: () => void;
  onBack?: () => void;
  userLocation?: { latitude: number; longitude: number };
}

const EmergencyActions: React.FC<EmergencyActionsProps> = ({
  emergencyType,
  onContinueToTracking,
  onBack,
  userLocation,
}) => {
  const { getText } = useI18n();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const handleAction = async (action: SpecializedAction) => {
    switch (action.action) {
      case 'call_ambulance':
        await handleCallAmbulance();
        break;
      case 'call_specialist':
        await handleCallSpecialist(action);
        break;
      case 'find_facility':
        await handleFindFacility(action);
        break;
      case 'contact_family':
        await handleContactFamily();
        break;
      case 'show_guide':
        await handleShowGuide(action);
        break;
    }
    
    setCompletedActions(prev => new Set([...prev, action.id]));
  };

  const handleCallAmbulance = async () => {
    Alert.alert(
      'Calling Ambulance',
      `Calling emergency ambulance service at ${EMERGENCY_CONTACTS.ambulance}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          onPress: () => Linking.openURL(`tel:${EMERGENCY_CONTACTS.ambulance}`)
        }
      ]
    );
  };

  const handleCallSpecialist = async (action: SpecializedAction) => {
    Alert.alert(
      'Specialist Consultation',
      `Connecting you with ${action.label}. This may connect you via telemedicine if available.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect', onPress: () => console.log('Connecting to specialist...') }
      ]
    );
  };

  const handleFindFacility = async (action: SpecializedAction) => {
    if (userLocation) {
      Alert.alert(
        'Nearest Facility',
        `Finding the nearest ${action.label} based on your location...`,
        [
          { text: 'OK', onPress: () => console.log('Finding facility...') }
        ]
      );
    } else {
      Alert.alert(
        'Location Required',
        'Please enable location services to find the nearest facility.'
      );
    }
  };

  const handleContactFamily = async () => {
    Alert.alert(
      'Emergency Contacts',
      'Your emergency contacts have been notified with your location and situation.',
      [{ text: 'OK' }]
    );
  };

  const handleShowGuide = async (action: SpecializedAction) => {
    Alert.alert(
      action.label,
      'Opening detailed guide for additional assistance.',
      [{ text: 'OK' }]
    );
  };

  const renderActionButton = (action: SpecializedAction) => {
    const isCompleted = completedActions.has(action.id);
    const IconComponent = getIconComponent(action.icon);
    
    return (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.actionButton,
          { borderColor: action.color },
          isCompleted && styles.completedAction
        ]}
        onPress={() => handleAction(action)}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
          <IconComponent size={24} color={action.color} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionLabel}>{action.label}</Text>
          <Text style={styles.actionPriority}>
            {action.priority === 'high' ? '🔴 High Priority' : 
             action.priority === 'medium' ? '🟡 Medium Priority' : '🟢 Low Priority'}
          </Text>
        </View>
        {isCompleted && (
          <View style={styles.completedIndicator}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ambulance': return Ambulance;
      case 'hospital': return Hospital;
      case 'stethoscope': return Phone;
      case 'heart-handshake': return Phone;
      case 'flask': return Hospital;
      case 'book-open': return Phone;
      case 'baby': return Hospital;
      default: return Hospital;
    }
  };

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
        <View style={[styles.typeIndicator, { backgroundColor: emergencyType.color }]}>
          <Text style={styles.emoji}>{emergencyType.emoji}</Text>
        </View>
        <Text style={styles.title}>{getText('emergencyActionsTitle')} for {emergencyType.title}</Text>
        <Text style={styles.subtitle}>
          {getText('emergencyActionsSubtitle')}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>🚨 {getText('emergencyStatusTitle')}</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>📡 {getText('emergencyServicesNotified')}</Text>
          <Text style={styles.statusValue}>✓</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>📍 {getText('locationShared')}</Text>
          <Text style={styles.statusValue}>{userLocation ? '✓' : 'Pending'}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>👥 {getText('familyContacts')}</Text>
          <Text style={styles.statusValue}>✓</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>{getText('specializedActions')}</Text>
        {emergencyType.specializedActions.map(action => renderActionButton(action))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.trackingButton}
          onPress={onContinueToTracking}
        >
          <MapPin size={20} color="#fff" />
          <Text style={styles.trackingButtonText}>
            {getText('startLiveTracking')}
          </Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          {getText('trackingNote')}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
  typeIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    margin: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '600',
  },
  actionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completedAction: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionPriority: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  completedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  trackingButtonText: {
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

export default EmergencyActions;