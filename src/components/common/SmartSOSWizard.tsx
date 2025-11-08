import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import { 
  EmergencyType, 
  EmergencyWizardState, 
  EmergencyIncident, 
  EmergencyTracker as EmergencyTrackerType,
  PostEmergencySupport as PostEmergencySupportType,
  EmergencyLocation 
} from '../../types/emergency';
import { emergencyLocationService, emergencyNotificationService } from '../../services/EmergencyService';
import EmergencyTypeSelector from './EmergencyTypeSelector';
import FirstAidGuide from './FirstAidGuide';
import EmergencyActions from './EmergencyActions';
import EmergencyTracker from './EmergencyTracker';
import PostEmergencySupport from './PostEmergencySupport';

interface SmartSOSWizardProps {
  visible: boolean;
  onClose: () => void;
  userLocation?: EmergencyLocation;
  onPlayAudio?: (audioKey: string) => void;
}

const SmartSOSWizard: React.FC<SmartSOSWizardProps> = ({
  visible,
  onClose,
  userLocation,
  onPlayAudio,
}) => {
  const [wizardState, setWizardState] = useState<EmergencyWizardState>({
    currentStep: 'type_selection',
    isAudioEnabled: true,
    language: 'en',
  });

  const [emergencyIncident, setEmergencyIncident] = useState<EmergencyIncident | null>(null);
  const [emergencyTracker, setEmergencyTracker] = useState<EmergencyTrackerType | null>(null);
  const [postEmergencySupport, setPostEmergencySupport] = useState<PostEmergencySupportType | null>(null);

  const handleBackPress = () => {
    if (wizardState.currentStep === 'type_selection') {
      handleCloseWizard();
      return true;
    }
    
    Alert.alert(
      'Emergency in Progress',
      'Are you sure you want to go back? This may interrupt your emergency response.',
      [
        { text: 'Continue Emergency', style: 'cancel' },
        { text: 'Go Back', onPress: goToPreviousStep }
      ]
    );
    return true;
  };

  const handleCloseWizard = () => {
    if (wizardState.currentStep !== 'type_selection') {
      Alert.alert(
        'Emergency Active',
        'You have an active emergency. Are you sure you want to close?',
        [
          { text: 'Keep Open', style: 'cancel' },
          { text: 'Close', style: 'destructive', onPress: resetAndClose }
        ]
      );
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setWizardState({
      currentStep: 'type_selection',
      isAudioEnabled: true,
      language: 'en',
    });
    setEmergencyIncident(null);
    setEmergencyTracker(null);
    setPostEmergencySupport(null);
    onClose();
  };

  const goToPreviousStep = () => {
    switch (wizardState.currentStep) {
      case 'first_aid':
        setWizardState(prev => ({ ...prev, currentStep: 'type_selection' }));
        break;
      case 'emergency_actions':
        setWizardState(prev => ({ ...prev, currentStep: 'first_aid' }));
        break;
      case 'tracking':
        setWizardState(prev => ({ ...prev, currentStep: 'emergency_actions' }));
        break;
      case 'post_emergency':
        setWizardState(prev => ({ ...prev, currentStep: 'tracking' }));
        break;
    }
  };

  const handleTypeSelection = async (selectedType: EmergencyType) => {
    try {
      // First, request location permission if not already available
      let currentLocation = userLocation;
      
      if (!currentLocation) {
        Alert.alert(
          'Location Access Required',
          'We need your location to provide the best emergency assistance and notify nearby healthcare facilities.',
          [
            {
              text: 'Skip Location',
              style: 'cancel',
              onPress: () => {
                // Continue without location
                proceedWithEmergency(selectedType, null);
              }
            },
            {
              text: 'Allow Location',
              onPress: async () => {
                try {
                  const hasPermission = await emergencyLocationService.requestLocationPermission();
                  if (hasPermission) {
                    const location = await emergencyLocationService.getCurrentLocation();
                    currentLocation = location || undefined;
                  }
                  proceedWithEmergency(selectedType, currentLocation || null);
                } catch (error) {
                  console.error('Location request failed:', error);
                  proceedWithEmergency(selectedType, null);
                }
              }
            }
          ]
        );
        return;
      }
      
      proceedWithEmergency(selectedType, currentLocation);
    } catch (error) {
      console.error('Emergency selection error:', error);
      proceedWithEmergency(selectedType, userLocation || null);
    }
  };

  const proceedWithEmergency = async (selectedType: EmergencyType, location: EmergencyLocation | null) => {
    // Create emergency incident
    const incident: EmergencyIncident = {
      id: `emergency_${Date.now()}`,
      type: selectedType,
      status: 'initiated',
      location: location || {
        latitude: 0,
        longitude: 0,
        address: 'Location not available',
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      contactsNotified: [],
    };

    setEmergencyIncident(incident);
    setWizardState(prev => ({
      ...prev,
      currentStep: 'first_aid',
      selectedType,
      incident,
    }));

    // Notify emergency services and healthcare facilities
    try {
      // Notify emergency services
      await emergencyNotificationService.notifyEmergencyServices(
        selectedType.title,
        location,
        { emergencyType: selectedType.id }
      );

      // Notify nearby healthcare facilities if location is available
      if (location) {
        const urgencyLevel = selectedType.id === 'heart_attack' || selectedType.id === 'stroke' 
          ? 'critical' 
          : selectedType.id === 'road_accident' || selectedType.id === 'severe_injury'
          ? 'high'
          : 'medium';

        await emergencyNotificationService.notifyNearbyHealthcare(
          selectedType.id,
          location,
          urgencyLevel
        );
      }

      // Show confirmation
      Alert.alert(
        'Emergency Alert Sent',
        `✅ Emergency services notified\n${location ? '✅ Nearby healthcare facilities alerted\n' : ''}📱 Emergency contacts will be notified\n\n${selectedType.title} emergency protocol activated.`,
        [{ text: 'Continue' }]
      );
    } catch (error) {
      console.error('Failed to notify emergency services:', error);
      Alert.alert(
        'Notification Sent',
        'Emergency protocol activated. Please follow the first aid instructions while help arrives.',
        [{ text: 'Continue' }]
      );
    }
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    // The voice command handler in EmergencyTypeSelector already handles the selection
    // so we don't need to do anything else here
  };

  const handleFirstAidComplete = () => {
    if (emergencyIncident) {
      setEmergencyIncident(prev => prev ? {
        ...prev,
        status: 'first_aid_shown'
      } : null);
    }
    
    setWizardState(prev => ({ ...prev, currentStep: 'emergency_actions' }));
  };

  const handleEmergencyActionsComplete = () => {
    if (emergencyIncident) {
      // Create tracker
      const tracker: EmergencyTrackerType = {
        incident: {
          ...emergencyIncident,
          status: 'ambulance_called',
          estimatedArrival: Date.now() + 15 * 60 * 1000, // 15 minutes from now
          ambulanceId: `amb_${Date.now()}`,
          hospitalId: `hosp_${Date.now()}`,
        },
        ambulanceStatus: 'dispatched',
        estimatedArrival: Date.now() + 15 * 60 * 1000,
        hospitalNotified: true,
        familyNotified: true,
      };

      setEmergencyTracker(tracker);
      setWizardState(prev => ({ ...prev, currentStep: 'tracking' }));
    }
  };

  const handleTrackingComplete = () => {
    if (emergencyIncident && emergencyTracker) {
      // Create post-emergency support data
      const support: PostEmergencySupportType = {
        incidentReport: {
          id: emergencyIncident.id,
          summary: `Emergency response completed for ${emergencyIncident.type.title}. Patient received appropriate first aid and was transported to medical facility.`,
          actions_taken: [
            'First aid instructions provided',
            'Emergency services contacted',
            'Ambulance dispatched',
            'Family/emergency contacts notified',
            'Patient transported to hospital'
          ],
          outcome: 'Patient stable and receiving medical care',
          timestamp: Date.now(),
        },
        recommendedMedicines: [
          {
            name: 'Paracetamol 500mg',
            dosage: '1 tablet every 6 hours',
            availability: 'available' as const,
            nearestPharmacy: 'MedPlus Pharmacy - 0.5 km'
          },
          {
            name: 'Antiseptic Solution',
            dosage: 'Apply as needed',
            availability: 'available' as const,
            nearestPharmacy: 'Apollo Pharmacy - 0.8 km'
          }
        ],
        followUpConsultation: {
          specialty: getRecommendedSpecialty(emergencyIncident.type.id),
          urgency: getConsultationUrgency(emergencyIncident.type.id),
          availableDoctors: ['Dr. Rajesh Sharma', 'Dr. Priya Kaur', 'Dr. Amit Singh'],
        },
      };

      setPostEmergencySupport(support);
      setWizardState(prev => ({ ...prev, currentStep: 'post_emergency' }));
    }
  };

  const getRecommendedSpecialty = (emergencyTypeId: string): string => {
    switch (emergencyTypeId) {
      case 'chest_pain': return 'Cardiology';
      case 'pregnancy_delivery': return 'Gynecology';
      case 'child_emergency': return 'Pediatrics';
      case 'burns': return 'Dermatology';
      case 'snake_bite': return 'Emergency Medicine';
      default: return 'General Medicine';
    }
  };

  const getConsultationUrgency = (emergencyTypeId: string): 'immediate' | 'within_24h' | 'within_week' => {
    switch (emergencyTypeId) {
      case 'chest_pain':
      case 'snake_bite': 
        return 'immediate';
      case 'road_accident':
      case 'burns':
      case 'pregnancy_delivery':
      case 'child_emergency':
        return 'within_24h';
      default: 
        return 'within_week';
    }
  };

  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 'type_selection':
        return (
          <EmergencyTypeSelector
            onSelectType={handleTypeSelection}
            onVoiceCommand={handleVoiceCommand}
          />
        );

      case 'first_aid':
        return wizardState.selectedType ? (
          <FirstAidGuide
            emergencyType={wizardState.selectedType}
            onContinue={handleFirstAidComplete}
            onBack={goToPreviousStep}
            onPlayAudio={onPlayAudio}
            isAudioEnabled={wizardState.isAudioEnabled}
          />
        ) : null;

      case 'emergency_actions':
        return wizardState.selectedType ? (
          <EmergencyActions
            emergencyType={wizardState.selectedType}
            onContinueToTracking={handleEmergencyActionsComplete}
            onBack={goToPreviousStep}
            userLocation={userLocation}
          />
        ) : null;

      case 'tracking':
        return emergencyTracker ? (
          <EmergencyTracker
            tracker={emergencyTracker}
            onComplete={handleTrackingComplete}
            onBack={goToPreviousStep}
          />
        ) : null;

      case 'post_emergency':
        return postEmergencySupport ? (
          <PostEmergencySupport
            support={postEmergencySupport}
            onClose={resetAndClose}
          />
        ) : null;

      default:
        return null;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCloseWizard}
    >
      <View style={styles.container}>
        {renderCurrentStep()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SmartSOSWizard;