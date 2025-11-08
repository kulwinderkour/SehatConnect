/**
 * User Service
 * Handles user profile and family member operations
 */

import apiService from './ApiService';

export interface UserProfile {
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  photoUrl?: string;
}

export interface FamilyMember {
  _id?: string;
  name: string;
  relation: 'father' | 'mother' | 'spouse' | 'son' | 'daughter' | 'brother' | 'sister' | 'grandfather' | 'grandmother' | 'other';
  dateOfBirth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  phone?: string;
  email?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  currentMedications?: string[];
  photoUrl?: string;
}

export interface Doctor {
  _id: string;
  profile: UserProfile;
  doctorInfo: {
    specialty: string;
    qualifications: string[];
    registrationNumber: string;
    hospital: string;
    experience: number;
    consultationFee: number;
    videoConsultationFee?: number;
    rating: number;
    totalReviews: number;
    bio?: string;
    languages?: string[];
    availableSlots?: any[];
  };
}

class UserService {
  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const response = await apiService.get<{ user: any }>('/users/profile');
      return response;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    profile?: Partial<UserProfile>;
    patientInfo?: any;
    doctorInfo?: any;
    settings?: any;
  }) {
    try {
      const response = await apiService.put<{ user: any }>('/users/profile', data);
      return response;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(imageUri: string) {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await apiService.uploadFile<{ photoUrl: string }>(
        '/users/profile-photo',
        formData
      );
      return response;
    } catch (error) {
      console.error('Upload profile photo failed:', error);
      throw error;
    }
  }

  /**
   * Get family members
   */
  async getFamilyMembers() {
    try {
      const response = await apiService.get<{ familyMembers: FamilyMember[] }>(
        '/users/family-members'
      );
      return response;
    } catch (error) {
      console.error('Get family members failed:', error);
      throw error;
    }
  }

  /**
   * Add family member
   */
  async addFamilyMember(data: FamilyMember) {
    try {
      const response = await apiService.post<{ familyMember: FamilyMember }>(
        '/users/family-members',
        data
      );
      return response;
    } catch (error) {
      console.error('Add family member failed:', error);
      throw error;
    }
  }

  /**
   * Update family member
   */
  async updateFamilyMember(id: string, data: Partial<FamilyMember>) {
    try {
      const response = await apiService.put<{ familyMember: FamilyMember }>(
        `/users/family-members/${id}`,
        data
      );
      return response;
    } catch (error) {
      console.error('Update family member failed:', error);
      throw error;
    }
  }

  /**
   * Delete family member
   */
  async deleteFamilyMember(id: string) {
    try {
      const response = await apiService.delete(`/users/family-members/${id}`);
      return response;
    } catch (error) {
      console.error('Delete family member failed:', error);
      throw error;
    }
  }

  /**
   * Search doctors
   */
  async searchDoctors(params?: {
    specialty?: string;
    city?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<{
        doctors: Doctor[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>('/users/doctors', params as any);
      return response;
    } catch (error) {
      console.error('Search doctors failed:', error);
      throw error;
    }
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(id: string) {
    try {
      const response = await apiService.get<{ doctor: Doctor }>(
        `/users/doctors/${id}`
      );
      return response;
    } catch (error) {
      console.error('Get doctor failed:', error);
      throw error;
    }
  }

  /**
   * Get doctors by specialty
   */
  async getDoctorsBySpecialty(specialty: string) {
    try {
      const response = await this.searchDoctors({ specialty, limit: 20 });
      return response;
    } catch (error) {
      console.error('Get doctors by specialty failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;
