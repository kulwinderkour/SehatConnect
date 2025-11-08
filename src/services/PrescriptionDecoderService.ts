/**
 * Prescription Decoder Service
 * Handles prescription image upload and decoding using Gemini Vision API
 */

import apiService from './ApiService';
import { Platform } from 'react-native';

export interface Medication {
  name: string;
  strength: string;
  form: string; // tablet, syrup, capsule, etc.
  dosage: string; // e.g., "1 tab", "5ml"
  frequency: string; // e.g., "twice daily", "TDS", "BD"
  duration: string; // e.g., "3 days", "2 weeks"
  route?: string; // oral, IV, topical
  notes?: string; // e.g., "after meal", "avoid alcohol"
  normalizedFrequency?: string; // e.g., "BD" -> "twice daily"
  times?: string[]; // e.g., ["08:00", "20:00"] for BD
}

export interface LabTest {
  name: string;
  urgency?: 'routine' | 'urgent' | 'asap';
  notes?: string;
}

export interface DecodedPrescription {
  patient?: string;
  medications: Medication[];
  tests: LabTest[];
  summary: string;
  remindersScheduled: boolean;
  safetyAlerts: string[];
  confidence: number;
  rawOcr?: string;
  doctorNotes?: string;
  diagnosisHints?: string[];
  pharmacyReadyList?: string[];
  needsReview?: boolean;
  reviewFlags?: string[];
}

class PrescriptionDecoderService {
  /**
   * Decode prescription from image
   */
  async decodePrescription(imageUri: string, patientProfile?: any): Promise<DecodedPrescription> {
    try {
      // Upload image and get decoded prescription
      const formData = new FormData();
      formData.append('prescription', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        type: 'image/jpeg',
        name: 'prescription.jpg',
      } as any);

      // Add patient profile if available
      if (patientProfile) {
        formData.append('patientProfile', JSON.stringify(patientProfile));
      }

      const response = await apiService.uploadFile<{ prescription: DecodedPrescription }>(
        '/prescriptions/decode',
        formData
      );

      if (!response.success || !response.data) {
        const errorMsg = response.error || response.message || 'Failed to decode prescription';
        console.error('Decode prescription error:', errorMsg);
        throw new Error(errorMsg);
      }

      return response.data.prescription;
    } catch (error: any) {
      console.error('Decode prescription failed:', error);
      // Provide more user-friendly error messages
      if (error.message?.includes('Network request failed')) {
        throw new Error('Cannot connect to server. Please check your internet connection and ensure the backend is running.');
      } else if (error.message?.includes('Gemini API')) {
        throw new Error('Prescription decoder service error. Please contact support.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to decode prescription. Please ensure the image is clear and try again.');
      }
    }
  }

  /**
   * Save decoded prescription to patient record
   */
  async savePrescription(prescription: DecodedPrescription): Promise<any> {
    try {
      const response = await apiService.post<{ prescription: any }>(
        '/prescriptions/save-decoded',
        prescription
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to save prescription');
      }
      
      return response;
    } catch (error) {
      console.error('Save prescription failed:', error);
      throw error;
    }
  }

  /**
   * Get patient's prescription history
   */
  async getPrescriptionHistory(limit: number = 20): Promise<any> {
    try {
      const response = await apiService.get<{ prescriptions: any[] }>(
        '/prescriptions/decoded',
        { limit: limit.toString() }
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch prescriptions');
      }
      
      return response;
    } catch (error) {
      console.error('Get prescription history failed:', error);
      throw error;
    }
  }

  /**
   * Normalize frequency abbreviations
   */
  normalizeFrequency(frequency: string): { normalized: string; times: string[] } {
    const freq = frequency.toUpperCase().trim();
    
    const frequencyMap: Record<string, { normalized: string; times: string[] }> = {
      'BD': { normalized: 'twice daily', times: ['08:00', '20:00'] },
      'BID': { normalized: 'twice daily', times: ['08:00', '20:00'] },
      'TDS': { normalized: 'thrice daily', times: ['08:00', '14:00', '20:00'] },
      'TID': { normalized: 'thrice daily', times: ['08:00', '14:00', '20:00'] },
      'QID': { normalized: 'four times daily', times: ['08:00', '12:00', '16:00', '20:00'] },
      'OD': { normalized: 'once daily', times: ['08:00'] },
      'ONCE': { normalized: 'once daily', times: ['08:00'] },
      'SOS': { normalized: 'when needed', times: [] },
      'PRN': { normalized: 'when needed', times: [] },
      'AC': { normalized: 'before food', times: ['08:00', '20:00'] },
      'PC': { normalized: 'after food', times: ['08:00', '20:00'] },
    };

    if (frequencyMap[freq]) {
      return frequencyMap[freq];
    }

    // Default: try to parse as "1-0-1" format
    if (freq.match(/^\d+-\d+-\d+$/)) {
      const parts = freq.split('-');
      const times: string[] = [];
      if (parts[0] !== '0') times.push('08:00');
      if (parts[1] !== '0') times.push('14:00');
      if (parts[2] !== '0') times.push('20:00');
      return {
        normalized: `${times.length} times daily`,
        times,
      };
    }

    return {
      normalized: frequency,
      times: ['08:00'], // Default to morning
    };
  }

  /**
   * Generate pharmacy-ready list
   */
  generatePharmacyList(medications: Medication[]): string[] {
    return medications.map(med => {
      const form = med.form === 'tablet' ? 'Tab.' : med.form === 'syrup' ? 'Syp.' : med.form;
      return `${form} ${med.name} ${med.strength} – ${med.dosage}`;
    });
  }
}

// Create singleton instance
const prescriptionDecoderService = new PrescriptionDecoderService();

export default prescriptionDecoderService;

