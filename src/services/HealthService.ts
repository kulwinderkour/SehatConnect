/**
 * Health Service
 * Handles health metrics and medicine reminders
 */

import apiService from './ApiService';

export interface HealthMetric {
  _id?: string;
  type: 'bp' | 'sugar' | 'weight' | 'temperature' | 'heartRate' | 'spo2' | 'bmi' | 'other';
  value: {
    systolic?: number;
    diastolic?: number;
    level?: number;
    unit?: string;
  };
  unit?: string;
  notes?: string;
  timestamp?: string;
  recordedBy?: 'user' | 'doctor' | 'device';
}

export interface MedicineReminder {
  _id?: string;
  medicineName: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'four-times' | 'custom';
  customFrequency?: {
    times: number;
    interval: 'hours' | 'days' | 'weeks';
  };
  timings: string[];
  startDate: string;
  endDate?: string;
  beforeMeal?: boolean;
  afterMeal?: boolean;
  withFood?: boolean;
  instructions?: string;
  isActive?: boolean;
  notificationsEnabled?: boolean;
}

export interface AdherenceRecord {
  date: string;
  taken: boolean;
  takenAt?: string;
  skippedReason?: string;
}

class HealthService {
  /**
   * Get health metrics
   */
  async getHealthMetrics(params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<{
        metrics: HealthMetric[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>('/health/metrics', params as any);
      return response;
    } catch (error) {
      console.error('Get health metrics failed:', error);
      throw error;
    }
  }

  /**
   * Add health metric
   */
  async addHealthMetric(data: HealthMetric) {
    try {
      const response = await apiService.post<{ metric: HealthMetric }>(
        '/health/metrics',
        data
      );
      return response;
    } catch (error) {
      console.error('Add health metric failed:', error);
      throw error;
    }
  }

  /**
   * Get latest health metrics
   */
  async getLatestMetrics() {
    try {
      const response = await apiService.get<{ metrics: Record<string, HealthMetric> }>(
        '/health/metrics/latest'
      );
      return response;
    } catch (error) {
      console.error('Get latest metrics failed:', error);
      throw error;
    }
  }

  /**
   * Update health metric
   */
  async updateHealthMetric(id: string, data: Partial<HealthMetric>) {
    try {
      const response = await apiService.put<{ metric: HealthMetric }>(
        `/health/metrics/${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error('Update health metric failed:', error);
      throw error;
    }
  }

  /**
   * Delete health metric
   */
  async deleteHealthMetric(id: string) {
    try {
      const response = await apiService.delete(`/health/metrics/${id}`);
      return response;
    } catch (error) {
      console.error('Delete health metric failed:', error);
      throw error;
    }
  }

  /**
   * Get medicine reminders
   */
  async getMedicineReminders(params?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<{
        reminders: MedicineReminder[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>('/health/medicine-reminders', params as any);
      return response;
    } catch (error) {
      console.error('Get medicine reminders failed:', error);
      throw error;
    }
  }

  /**
   * Add medicine reminder
   */
  async addMedicineReminder(data: MedicineReminder) {
    try {
      const response = await apiService.post<{ reminder: MedicineReminder }>(
        '/health/medicine-reminders',
        data
      );
      return response;
    } catch (error) {
      console.error('Add medicine reminder failed:', error);
      throw error;
    }
  }

  /**
   * Update medicine reminder
   */
  async updateMedicineReminder(id: string, data: Partial<MedicineReminder>) {
    try {
      const response = await apiService.put<{ reminder: MedicineReminder }>(
        `/health/medicine-reminders/${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error('Update medicine reminder failed:', error);
      throw error;
    }
  }

  /**
   * Delete medicine reminder
   */
  async deleteMedicineReminder(id: string) {
    try {
      const response = await apiService.delete(`/health/medicine-reminders/${id}`);
      return response;
    } catch (error) {
      console.error('Delete medicine reminder failed:', error);
      throw error;
    }
  }

  /**
   * Get today's medicine reminders
   */
  async getTodayReminders() {
    try {
      const response = await apiService.get<{ reminders: MedicineReminder[] }>(
        '/health/medicine-reminders/today'
      );
      return response;
    } catch (error) {
      console.error('Get today reminders failed:', error);
      throw error;
    }
  }

  /**
   * Record medicine adherence
   */
  async recordAdherence(
    reminderId: string,
    data: {
      taken: boolean;
      takenAt?: string;
      skippedReason?: string;
    }
  ) {
    try {
      const response = await apiService.post<{ reminder: MedicineReminder }>(
        `/health/medicine-reminders/${reminderId}/adherence`,
        data
      );
      return response;
    } catch (error) {
      console.error('Record adherence failed:', error);
      throw error;
    }
  }

  /**
   * Get adherence statistics
   */
  async getAdherenceStats(reminderId: string, days: number = 30) {
    try {
      const response = await apiService.get<{
        stats: {
          totalDoses: number;
          takenDoses: number;
          missedDoses: number;
          adherenceRate: number;
          records: AdherenceRecord[];
        };
      }>(`/health/medicine-reminders/${reminderId}/adherence?days=${days}`);
      return response;
    } catch (error) {
      console.error('Get adherence stats failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const healthService = new HealthService();

export default healthService;
