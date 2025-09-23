import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import { EmergencyType } from '../../types/emergency';
import { EMERGENCY_TYPES } from '../../utils/emergencyData';
import { useI18n } from '../../i18n';
import { emergencyAudioService } from '../../services/AudioService';

const { width } = Dimensions.get('window');

interface EmergencyTypeSelectorProps {
  onSelectType: (type: EmergencyType) => void;
  onVoiceCommand?: (command: string) => void;
}

const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({
  onSelectType,
  onVoiceCommand,
}) => {
  const { getText } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const handleVoiceToggle = async () => {
    try {
      if (!isListening) {
        // Start voice recognition
        setIsListening(true);
        await emergencyAudioService.initialize();
        
        // Play prompt
        await emergencyAudioService.speak('Please say your emergency type. For example: Heart attack, Road accident, or Fire emergency', { language: 'en' });
        
        // In a real app, you would start speech recognition here
        // For now, we'll simulate with a timeout and show options
        setTimeout(() => {
          showVoiceOptions();
        }, 3000);
      } else {
        // Stop listening
        setIsListening(false);
        Alert.alert('Voice Recognition', 'Voice recognition stopped.');
      }
    } catch (error) {
      console.error('Voice command error:', error);
      setIsListening(false);
      Alert.alert('Voice Error', 'Unable to start voice recognition. Please try again.');
    }
  };

  const showVoiceOptions = () => {
    const options = EMERGENCY_TYPES.map(type => ({
      text: type.title,
      onPress: () => {
        setIsListening(false);
        speakAndSelect(type);
      }
    }));

    Alert.alert(
      'Voice Command Options',
      'Select an emergency type or speak one of these options:',
      [
        ...options,
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setIsListening(false)
        }
      ]
    );
  };

  const speakAndSelect = async (emergencyType: EmergencyType) => {
    try {
      // Speak confirmation
      await emergencyAudioService.speak(`${emergencyType.title} emergency selected. Initializing emergency response.`, { language: 'en' });
      
      // Trigger selection
      setTimeout(() => {
        onSelectType(emergencyType);
        if (onVoiceCommand) {
          onVoiceCommand(emergencyType.title);
        }
      }, 2000);
    } catch (error) {
      console.error('Speech error:', error);
      onSelectType(emergencyType);
    }
  };

  const toggleAudio = async () => {
    setAudioEnabled(!audioEnabled);
    try {
      if (audioEnabled) {
        await emergencyAudioService.speak('Audio disabled', { language: 'en' });
      } else {
        await emergencyAudioService.speak('Audio enabled', { language: 'en' });
      }
    } catch (error) {
      console.error('Audio toggle error:', error);
    }
  };

  const renderEmergencyButton = (emergencyType: EmergencyType) => (
    <TouchableOpacity
      key={emergencyType.id}
      style={[styles.emergencyButton, { borderColor: emergencyType.color }]}
      onPress={() => onSelectType(emergencyType)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: emergencyType.color + '20' }]}>
        <Text style={styles.emoji}>{emergencyType.emoji}</Text>
      </View>
      <Text style={styles.emergencyTitle}>{emergencyType.title}</Text>
      <Text style={styles.emergencyDescription}>{emergencyType.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getText('emergencySelectType')}</Text>
        <Text style={styles.subtitle}>
          {getText('emergencySelectSubtitle')}
        </Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emergencyGrid}>
          {EMERGENCY_TYPES.map(emergencyType => renderEmergencyButton(emergencyType))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={handleVoiceToggle}
          activeOpacity={0.7}
        >
          {isListening ? (
            <MicOff size={24} color="#fff" />
          ) : (
            <Mic size={24} color="#3b82f6" />
          )}
          <Text style={[styles.voiceButtonText, isListening && styles.voiceButtonTextActive]}>
            {isListening ? 'Stop Listening' : getText('emergencyVoiceOption')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.audioToggleButton}
          onPress={toggleAudio}
          activeOpacity={0.7}
        >
          <Volume2 size={20} color={audioEnabled ? '#10b981' : '#9ca3af'} />
          <Text style={[styles.audioToggleText, audioEnabled ? styles.audioEnabledText : styles.audioDisabledText]}>
            {audioEnabled ? 'Audio On' : 'Audio Off'}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
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
    paddingTop: 10,
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyButton: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 140,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#8b5cf6',
    textAlign: 'center',
    fontWeight: '500',
  },
  voiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    gap: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  voiceButtonTextActive: {
    color: '#fff',
  },
  audioToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  audioToggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  audioEnabledText: {
    color: '#10b981',
  },
  audioDisabledText: {
    color: '#9ca3af',
  },
});

export default EmergencyTypeSelector;