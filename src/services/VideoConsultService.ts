// Video Consultation Service
// Handles all video consultation related API calls

import apiService from './ApiService';
import { Doctor, Appointment, AppointmentBookingForm } from '../types/health';

// Video consultation specific types
export interface VideoCallSession {
  id: string;
  doctorId: string;
  patientId: string;
  status: 'initiated' | 'connecting' | 'connected' | 'ended' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  roomId: string;
  token: string;
}

export interface VideoCallToken {
  token: string;
  roomId: string;
  expiresAt: string;
}

export interface ConsultationRequest {
  doctorId: string;
  patientId: string;
  symptoms?: string[];
  notes?: string;
  emergencyContact?: string;
}

class VideoConsultService {
  // Get available doctors for video consultation
  async getAvailableDoctors(filters?: {
    specialty?: string;
    isOnline?: boolean;
    search?: string;
  }): Promise<Doctor[]> {
    try {
      const response = await apiService.get<{ doctors: Doctor[] }>('/doctors/available', {
        specialty: filters?.specialty || '',
        isOnline: filters?.isOnline?.toString() || '',
        search: filters?.search || '',
      });

      return response.data.doctors;
    } catch (error) {
      console.error('Failed to fetch available doctors:', error);
      throw new Error('Unable to fetch available doctors');
    }
  }

  // Get doctor details by ID
  async getDoctorById(doctorId: string): Promise<Doctor> {
    try {
      const response = await apiService.get<{ doctor: Doctor }>(`/doctors/${doctorId}`);
      return response.data.doctor;
    } catch (error) {
      console.error('Failed to fetch doctor details:', error);
      throw new Error('Unable to fetch doctor details');
    }
  }

  // Initiate video consultation
  async initiateVideoConsultation(request: ConsultationRequest): Promise<VideoCallSession> {
    try {
      const response = await apiService.post<{ session: VideoCallSession }>('/video-consultation/initiate', request);
      return response.data.session;
    } catch (error) {
      console.error('Failed to initiate video consultation:', error);
      throw new Error('Unable to start video consultation');
    }
  }

  // Get video call token for WebRTC
  async getVideoCallToken(sessionId: string): Promise<VideoCallToken> {
    try {
      const response = await apiService.get<{ token: VideoCallToken }>(`/video-consultation/${sessionId}/token`);
      return response.data.token;
    } catch (error) {
      console.error('Failed to get video call token:', error);
      throw new Error('Unable to get video call access');
    }
  }

  // Join video call room
  async joinVideoCall(sessionId: string): Promise<{ roomId: string; token: string }> {
    try {
      const response = await apiService.post<{ roomId: string; token: string }>(`/video-consultation/${sessionId}/join`);
      return response.data;
    } catch (error) {
      console.error('Failed to join video call:', error);
      throw new Error('Unable to join video call');
    }
  }

  // End video consultation
  async endVideoConsultation(sessionId: string): Promise<void> {
    try {
      await apiService.post(`/video-consultation/${sessionId}/end`);
    } catch (error) {
      console.error('Failed to end video consultation:', error);
      throw new Error('Unable to end video consultation');
    }
  }

  // Get consultation history
  async getConsultationHistory(patientId: string, page = 1, limit = 10): Promise<{
    consultations: Appointment[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await apiService.get<{
        consultations: Appointment[];
        total: number;
        page: number;
        limit: number;
      }>(`/video-consultation/history/${patientId}`, {
        page: page.toString(),
        limit: limit.toString(),
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch consultation history:', error);
      throw new Error('Unable to fetch consultation history');
    }
  }

  // Book follow-up appointment
  async bookFollowUpAppointment(sessionId: string, appointmentData: AppointmentBookingForm): Promise<Appointment> {
    try {
      const response = await apiService.post<{ appointment: Appointment }>(`/video-consultation/${sessionId}/follow-up`, appointmentData);
      return response.data.appointment;
    } catch (error) {
      console.error('Failed to book follow-up appointment:', error);
      throw new Error('Unable to book follow-up appointment');
    }
  }

  // Send consultation feedback
  async sendConsultationFeedback(sessionId: string, feedback: {
    rating: number;
    comment: string;
    wouldRecommend: boolean;
  }): Promise<void> {
    try {
      await apiService.post(`/video-consultation/${sessionId}/feedback`, feedback);
    } catch (error) {
      console.error('Failed to send feedback:', error);
      throw new Error('Unable to send feedback');
    }
  }

  // Check doctor availability in real-time
  async checkDoctorAvailability(doctorId: string): Promise<{
    isAvailable: boolean;
    nextAvailableTime?: string;
    estimatedWaitTime?: number;
  }> {
    try {
      const response = await apiService.get<{
        isAvailable: boolean;
        nextAvailableTime?: string;
        estimatedWaitTime?: number;
      }>(`/doctors/${doctorId}/availability`);

      return response.data;
    } catch (error) {
      console.error('Failed to check doctor availability:', error);
      throw new Error('Unable to check doctor availability');
    }
  }

  // Get consultation summary
  async getConsultationSummary(sessionId: string): Promise<{
    summary: string;
    recommendations: string[];
    prescription?: any;
    followUpRequired: boolean;
  }> {
    try {
      const response = await apiService.get<{
        summary: string;
        recommendations: string[];
        prescription?: any;
        followUpRequired: boolean;
      }>(`/video-consultation/${sessionId}/summary`);

      return response.data;
    } catch (error) {
      console.error('Failed to get consultation summary:', error);
      throw new Error('Unable to get consultation summary');
    }
  }
}

// Create singleton instance
const videoConsultService = new VideoConsultService();

export default videoConsultService;
