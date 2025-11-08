// Doctor Service
// Handles all doctor-related API calls

import apiService from './ApiService';
import { Doctor, DoctorFilters, Appointment } from '../types/health';

class DoctorService {
  // Get all doctors with optional filters
  async getDoctors(filters?: DoctorFilters, page = 1, limit = 20): Promise<{
    doctors: Doctor[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (filters) {
        if (filters.specialty) params.specialty = filters.specialty;
        if (filters.rating) params.rating = filters.rating.toString();
        if (filters.maxDistance) params.maxDistance = filters.maxDistance.toString();
        if (filters.isOnline !== undefined) params.isOnline = filters.isOnline.toString();
        if (filters.maxFee) params.maxFee = filters.maxFee.toString();
        if (filters.languages) params.languages = filters.languages.join(',');
      }

      const response = await apiService.get<{
        doctors: Doctor[];
        total: number;
        page: number;
        limit: number;
      }>('/doctors', params);

      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      throw new Error('Unable to fetch doctors');
    }
  }

  // Get doctor by ID
  async getDoctorById(doctorId: string): Promise<Doctor> {
    try {
      const response = await apiService.get<{ doctor: Doctor }>(`/doctors/${doctorId}`);
      return response.data.doctor;
    } catch (error) {
      console.error('Failed to fetch doctor details:', error);
      throw new Error('Unable to fetch doctor details');
    }
  }

  // Search doctors
  async searchDoctors(query: string, filters?: DoctorFilters): Promise<Doctor[]> {
    try {
      const params: Record<string, string> = {
        q: query,
      };

      if (filters) {
        if (filters.specialty) params.specialty = filters.specialty;
        if (filters.rating) params.rating = filters.rating.toString();
        if (filters.isOnline !== undefined) params.isOnline = filters.isOnline.toString();
      }

      const response = await apiService.get<{ doctors: Doctor[] }>('/doctors/search', params);
      return response.data.doctors;
    } catch (error) {
      console.error('Failed to search doctors:', error);
      throw new Error('Unable to search doctors');
    }
  }

  // Get doctor's availability
  async getDoctorAvailability(doctorId: string, date?: string): Promise<{
    isAvailable: boolean;
    nextAvailableTime?: string;
    workingHours: {
      start: string;
      end: string;
    };
    workingDays: number[];
    timeSlots: Array<{
      id: string;
      time: string;
      isAvailable: boolean;
      isBooked: boolean;
    }>;
  }> {
    try {
      const params: Record<string, string> = {};
      if (date) {
        params.date = date;
      }
      const response = await apiService.get<{
        isAvailable: boolean;
        nextAvailableTime?: string;
        workingHours: {
          start: string;
          end: string;
        };
        workingDays: number[];
        timeSlots: Array<{
          id: string;
          time: string;
          isAvailable: boolean;
          isBooked: boolean;
        }>;
      }>(`/doctors/${doctorId}/availability`, params);

      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctor availability:', error);
      throw new Error('Unable to fetch doctor availability');
    }
  }

  // Get doctor's reviews
  async getDoctorReviews(doctorId: string, page = 1, limit = 10): Promise<{
    reviews: Array<{
      id: string;
      patientName: string;
      rating: number;
      comment: string;
      date: string;
    }>;
    total: number;
    averageRating: number;
  }> {
    try {
      const response = await apiService.get<{
        reviews: Array<{
          id: string;
          patientName: string;
          rating: number;
          comment: string;
          date: string;
        }>;
        total: number;
        averageRating: number;
      }>(`/doctors/${doctorId}/reviews`, {
        page: page.toString(),
        limit: limit.toString(),
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctor reviews:', error);
      throw new Error('Unable to fetch doctor reviews');
    }
  }

  // Get doctor's specialties
  async getSpecialties(): Promise<string[]> {
    try {
      const response = await apiService.get<{ specialties: string[] }>('/doctors/specialties');
      return response.data.specialties;
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
      throw new Error('Unable to fetch specialties');
    }
  }

  // Get nearby doctors
  async getNearbyDoctors(latitude: number, longitude: number, radius = 10): Promise<Doctor[]> {
    try {
      const response = await apiService.get<{ doctors: Doctor[] }>('/doctors/nearby', {
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: radius.toString(),
      });

      return response.data.doctors;
    } catch (error) {
      console.error('Failed to fetch nearby doctors:', error);
      throw new Error('Unable to fetch nearby doctors');
    }
  }

  // Get doctor's upcoming appointments
  // Note: Uses /appointments endpoint which returns appointments based on user role
  async getDoctorAppointments(doctorId: string, date?: string): Promise<Appointment[]> {
    try {
      const params: Record<string, string> = {};
      if (date) {
        params.date = date;
      }
      // Use the appointments endpoint - backend will filter by user role automatically
      const response = await apiService.get<{ appointments: Appointment[] }>('/appointments', params);
      
      // Check if response indicates failure
      if (!response.success) {
        // Silently return empty array - don't log errors for expected failures
        return [];
      }
      
      // Extract appointments from the response data structure
      // Backend returns: { success: true, data: { appointments: [...], pagination: {...} } }
      const appointmentsData = response.data;
      if (appointmentsData && typeof appointmentsData === 'object' && 'appointments' in appointmentsData) {
        return Array.isArray(appointmentsData.appointments) ? appointmentsData.appointments : [];
      }
      // Fallback: if data is directly an array
      return Array.isArray(appointmentsData) ? appointmentsData : [];
    } catch (error: any) {
      // Silently return empty array for any error - don't log
      return [];
    }
  }

  // Update doctor's online status
  async updateDoctorStatus(doctorId: string, isOnline: boolean): Promise<void> {
    try {
      await apiService.put(`/doctors/${doctorId}/status`, { isOnline });
    } catch (error) {
      console.error('Failed to update doctor status:', error);
      throw new Error('Unable to update doctor status');
    }
  }

  // Get doctor statistics
  async getDoctorStats(doctorId: string): Promise<{
    totalConsultations: number;
    averageRating: number;
    totalPatients: number;
    responseTime: number; // in minutes
    availability: number; // percentage
  }> {
    try {
      const response = await apiService.get<{
        totalConsultations: number;
        averageRating: number;
        totalPatients: number;
        responseTime: number;
        availability: number;
      }>(`/doctors/${doctorId}/stats`);

      return response.data;
    } catch (error) {
      console.error('Failed to fetch doctor statistics:', error);
      throw new Error('Unable to fetch doctor statistics');
    }
  }
}

// Create singleton instance
const doctorService = new DoctorService();

export default doctorService;
