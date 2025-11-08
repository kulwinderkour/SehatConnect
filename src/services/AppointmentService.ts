/**
 * Appointment Service
 * Handles all appointment-related operations
 */

import apiService from './ApiService';

export interface BookAppointmentData {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'video' | 'in_person';
  reason: string;
  symptoms?: string[];
  familyMemberId?: string;
}

export interface Appointment {
  _id: string;
  patientId: any;
  doctorId: any;
  appointmentDate: string;
  appointmentTime: string;
  type: 'video' | 'in_person';
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  symptoms?: string[];
  diagnosis?: string;
  prescriptionId?: string;
  notes?: string;
  payment?: any;
  videoCallLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AppointmentService {
  /**
   * Book a new appointment
   */
  async bookAppointment(data: BookAppointmentData) {
    try {
      const response = await apiService.post<{ appointment: Appointment }>(
        '/appointments',
        data
      );
      return response;
    } catch (error) {
      console.error('Book appointment failed:', error);
      throw error;
    }
  }

  /**
   * Get user appointments (patient or doctor)
   */
  async getAppointments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<AppointmentsResponse>(
        '/appointments',
        params as any
      );
      return response;
    } catch (error) {
      console.error('Get appointments failed:', error);
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string) {
    try {
      const response = await apiService.get<{ appointment: Appointment }>(
        `/appointments/${id}`
      );
      return response;
    } catch (error) {
      console.error('Get appointment failed:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string, cancellationReason?: string) {
    try {
      const response = await apiService.put<{ appointment: Appointment }>(
        `/appointments/${id}/cancel`,
        { cancellationReason }
      );
      return response;
    } catch (error) {
      console.error('Cancel appointment failed:', error);
      throw error;
    }
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    id: string,
    appointmentDate: string,
    appointmentTime: string
  ) {
    try {
      const response = await apiService.put<{ appointment: Appointment }>(
        `/appointments/${id}/reschedule`,
        { appointmentDate, appointmentTime }
      );
      return response;
    } catch (error) {
      console.error('Reschedule appointment failed:', error);
      throw error;
    }
  }

  /**
   * Complete appointment (doctor only)
   */
  async completeAppointment(id: string, notes?: string, prescriptionId?: string) {
    try {
      const response = await apiService.put<{ appointment: Appointment }>(
        `/appointments/${id}/complete`,
        { notes, prescriptionId }
      );
      return response;
    } catch (error) {
      console.error('Complete appointment failed:', error);
      throw error;
    }
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments() {
    try {
      const response = await this.getAppointments({
        status: 'scheduled',
        limit: 10,
      });
      return response;
    } catch (error) {
      console.error('Get upcoming appointments failed:', error);
      throw error;
    }
  }

  /**
   * Get past appointments
   */
  async getPastAppointments(page = 1, limit = 10) {
    try {
      const response = await this.getAppointments({
        status: 'completed',
        page,
        limit,
      });
      return response;
    } catch (error) {
      console.error('Get past appointments failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const appointmentService = new AppointmentService();

export default appointmentService;
