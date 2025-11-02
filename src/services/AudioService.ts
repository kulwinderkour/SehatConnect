import { NativeModules, Platform } from 'react-native';
import { AUDIO_PROMPTS } from '../utils/emergencyData';

// Text-to-Speech interface for different platforms
interface TTSInterface {
  speak: (text: string, options?: any) => Promise<void>;
  stop: () => Promise<void>;
  isSpeaking: () => Promise<boolean>;
  setLanguage: (language: 'en' | 'hi' | 'pa') => Promise<void>;
}

class EmergencyAudioService implements TTSInterface {
  private static instance: EmergencyAudioService;
  private isInitialized: boolean = false;
  private currentLanguage: 'en' | 'hi' | 'pa' = 'en';
  private isTTSAvailable: boolean = false;

  public static getInstance(): EmergencyAudioService {
    if (!EmergencyAudioService.instance) {
      EmergencyAudioService.instance = new EmergencyAudioService();
    }
    return EmergencyAudioService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if TTS is available on the platform
      if (Platform.OS === 'android') {
        this.isTTSAvailable = !!NativeModules.TextToSpeech;
      } else if (Platform.OS === 'ios') {
        // iOS has built-in TTS support
        this.isTTSAvailable = true;
      }

      this.isInitialized = true;
      console.log('Emergency Audio Service initialized');
    } catch (error) {
      console.error('Failed to initialize TTS:', error);
      this.isTTSAvailable = false;
    }
  }

  public async speak(text: string, options?: {
    language?: 'en' | 'hi' | 'pa';
    rate?: number;
    pitch?: number;
  }): Promise<void> {
    if (!this.isTTSAvailable) {
      console.warn('Text-to-Speech not available');
      return;
    }

    try {
      const language = options?.language || this.currentLanguage;
      
      // In a real app, you would use react-native-tts or similar library
      console.log(`Speaking (${language}):`, text, {
        language: this.getLanguageCode(language),
        rate: options?.rate || 0.8, // Slightly slower for emergency instructions
        pitch: options?.pitch || 1.0,
      });
      
      // Simulate speaking duration
      const speakingTime = text.length * 50; // Rough estimate: 50ms per character
      await new Promise<void>(resolve => setTimeout(resolve, speakingTime));
    } catch (error) {
      console.error('TTS error:', error);
    }
  }

  public async stop(): Promise<void> {
    if (!this.isTTSAvailable) return;

    try {
      // Stop current speech
      console.log('Stopping TTS');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  public async isSpeaking(): Promise<boolean> {
    if (!this.isTTSAvailable) return false;

    // Check if TTS is currently speaking
    return false; // Simplified for demo
  }

  public async setLanguage(language: 'en' | 'hi' | 'pa'): Promise<void> {
    this.currentLanguage = language;
    console.log(`TTS language set to: ${language}`);
  }

  private getLanguageCode(language: 'en' | 'hi' | 'pa'): string {
    switch (language) {
      case 'en': return 'en-US';
      case 'hi': return 'hi-IN';
      case 'pa': return 'pa-IN';
      default: return 'en-US';
    }
  }

  public async playEmergencyPrompt(
    promptKey: keyof typeof AUDIO_PROMPTS.en,
    language: 'en' | 'hi' | 'pa' = 'en'
  ): Promise<void> {
    const prompts = AUDIO_PROMPTS[language];
    const text = prompts[promptKey];
    
    if (text) {
      await this.speak(text, { language });
    } else {
      console.warn(`Audio prompt not found: ${promptKey} for language: ${language}`);
    }
  }

  public async playFirstAidInstruction(
    instruction: string,
    language: 'en' | 'hi' | 'pa' = 'en',
    isWarning: boolean = false
  ): Promise<void> {
    let prefix = '';
    
    switch (language) {
      case 'en':
        prefix = isWarning ? 'Warning: ' : 'Step: ';
        break;
      case 'hi':
        prefix = isWarning ? 'चेतावनी: ' : 'चरण: ';
        break;
      case 'pa':
        prefix = isWarning ? 'ਚੇਤਾਵਨੀ: ' : 'ਕਦਮ: ';
        break;
    }

    const fullText = prefix + instruction;
    await this.speak(fullText, { 
      language,
      rate: isWarning ? 0.7 : 0.8, // Slower for warnings
      pitch: isWarning ? 1.1 : 1.0  // Higher pitch for warnings
    });
  }

  public async playCountdown(
    count: number,
    language: 'en' | 'hi' | 'pa' = 'en'
  ): Promise<void> {
    const numbers = {
      en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
      hi: ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस'],
      pa: ['ਜ਼ੀਰੋ', 'ਇੱਕ', 'ਦੋ', 'ਤਿੰਨ', 'ਚਾਰ', 'ਪੰਜ', 'ਛੇ', 'ਸੱਤ', 'ਅੱਠ', 'ਨੌਂ', 'ਦਸ']
    };

    for (let i = count; i > 0; i--) {
      const numberText = i <= 10 ? numbers[language][i] : i.toString();
      await this.speak(numberText, { language, rate: 1.0 });
      await new Promise<void>(resolve => setTimeout(resolve, 1000)); // 1 second pause
    }
  }

  public async playEmergencyAlert(
    emergencyType: string,
    language: 'en' | 'hi' | 'pa' = 'en'
  ): Promise<void> {
    let alertText = '';
    
    switch (language) {
      case 'en':
        alertText = `Emergency alert activated for ${emergencyType}. Emergency services have been contacted. Please follow the instructions on screen.`;
        break;
      case 'hi':
        alertText = `${emergencyType} के लिए आपातकालीन चेतावनी सक्रिय। आपातकालीन सेवाओं से संपर्क किया गया है। कृपया स्क्रीन पर निर्देशों का पालन करें।`;
        break;
      case 'pa':
        alertText = `${emergencyType} ਲਈ ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਸਰਗਰਮ। ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕੀਤਾ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਸਕ੍ਰੀਨ ਤੇ ਨਿਰਦੇਸ਼ਾਂ ਦਾ ਪਾਲਣ ਕਰੋ।`;
        break;
    }

    await this.speak(alertText, { language, rate: 0.9, pitch: 1.1 });
  }

  public isAvailable(): boolean {
    return this.isTTSAvailable;
  }

  public getCurrentLanguage(): 'en' | 'hi' | 'pa' {
    return this.currentLanguage;
  }
}

// Audio guide utility functions
export const playBeepSound = async (type: 'success' | 'warning' | 'error' = 'success'): Promise<void> => {
  // In a real app, you would play system sounds or custom audio files
  console.log(`Playing ${type} beep sound`);
};

export const vibrate = (pattern: number[] = [100, 200, 100]): void => {
  // In a real app, you would use react-native Vibration API
  console.log('Vibrating with pattern:', pattern);
};

// Export service instance
export const emergencyAudioService = EmergencyAudioService.getInstance();