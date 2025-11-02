import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Play, Volume2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { EmergencyType, FirstAidStep } from '../../types/emergency';

interface FirstAidGuideProps {
  emergencyType: EmergencyType;
  onContinue: () => void;
  onBack?: () => void;
  onPlayAudio?: (audioKey: string) => void;
  isAudioEnabled?: boolean;
}

const FirstAidGuide: React.FC<FirstAidGuideProps> = ({
  emergencyType,
  onContinue,
  onBack,
  onPlayAudio,
  isAudioEnabled = true,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handlePlayAudio = (step: FirstAidStep) => {
    if (step.audioKey && onPlayAudio) {
      onPlayAudio(step.audioKey);
    } else {
      Alert.alert('Audio Guide', `Playing instructions for step ${step.step}`);
    }
  };

  const renderFirstAidStep = (step: FirstAidStep) => {
    const isCompleted = completedSteps.has(step.id);
    
    return (
      <View key={step.id} style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{step.step}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepInstruction}>{step.instruction}</Text>
            {step.warning && (
              <View style={styles.warningContainer}>
                <AlertTriangle size={16} color="#f59e0b" />
                <Text style={styles.warningText}>{step.warning}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.stepActions}>
          {isAudioEnabled && step.audioKey && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => handlePlayAudio(step)}
            >
              <Volume2 size={16} color="#3b82f6" />
              <Text style={styles.audioButtonText}>Play Audio</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.completeButton,
              isCompleted && styles.completedButton
            ]}
            onPress={() => handleStepComplete(step.id)}
            disabled={isCompleted}
          >
            {isCompleted ? (
              <CheckCircle size={16} color="#10b981" />
            ) : (
              <View style={styles.uncheckedCircle} />
            )}
            <Text style={[
              styles.completeButtonText,
              isCompleted && styles.completedButtonText
            ]}>
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const allStepsCompleted = completedSteps.size === emergencyType.firstAidSteps.length;

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
        <Text style={styles.title}>First Aid for {emergencyType.title}</Text>
        <Text style={styles.subtitle}>
          Follow these steps while emergency services are on the way
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emergencyAlert}>
          <Text style={styles.alertText}>
            📡 Emergency services have been automatically notified
          </Text>
          <Text style={styles.alertSubtext}>
            📤 Your location and emergency contacts have been alerted
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {emergencyType.firstAidSteps.map(step => renderFirstAidStep(step))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            allStepsCompleted && styles.continueButtonActive
          ]}
          onPress={onContinue}
          disabled={!allStepsCompleted}
        >
          <Play size={20} color={allStepsCompleted ? '#fff' : '#9ca3af'} />
          <Text style={[
            styles.continueButtonText,
            allStepsCompleted && styles.continueButtonTextActive
          ]}>
            Continue to Emergency Actions
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          Complete all steps to proceed to next phase
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emergencyAlert: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  alertText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  alertSubtext: {
    fontSize: 14,
    color: '#065f46',
  },
  stepsContainer: {
    gap: 16,
  },
  stepContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
    flex: 1,
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    gap: 6,
  },
  audioButtonText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    gap: 6,
  },
  completedButton: {
    backgroundColor: '#dcfce7',
  },
  uncheckedCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9ca3af',
  },
  completeButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  completedButtonText: {
    color: '#059669',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  continueButtonActive: {
    backgroundColor: '#3b82f6',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  continueButtonTextActive: {
    color: '#fff',
  },
  footerNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default FirstAidGuide;