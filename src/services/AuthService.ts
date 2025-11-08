/**
 * Simplified Authentication Service
 * Only supports demo credentials - no tokens, no API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: '@sehatconnect:userData',
};

// Demo user data
const DEMO_USERS = {
  patient: {
    _id: 'demo-patient-id',
    email: 'patient@sehat.com',
    phone: '+91-9876543210',
    role: 'patient' as const,
    profile: {
      fullName: 'Demo Patient',
      shortName: 'Demo',
      profileImage: '',
      dateOfBirth: '1990-01-15',
      gender: 'male' as const,
      bloodGroup: 'O+',
      address: {
        street: '123 Health Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
    },
    patientInfo: {
      patientId: 'SH100001',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+91-9876543211',
        relation: 'Family',
      },
      allergies: ['Penicillin'],
      chronicDiseases: [],
    },
    isVerified: true,
  },
  doctor: {
    _id: 'demo-doctor-id',
    email: 'drrajesh@sehat.com',
    phone: '+91-9876543212',
    role: 'doctor' as const,
    profile: {
      fullName: 'Dr. Rajesh Sharma',
      shortName: 'Dr. Rajesh',
      profileImage: '',
      dateOfBirth: '1980-05-20',
      gender: 'male' as const,
      address: {
        street: '456 Medical Complex',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110002',
      },
    },
    doctorInfo: {
      specialty: 'General Physician',
      qualifications: ['MBBS', 'MD'],
      registrationNumber: 'MCI-12345',
      hospital: 'City Hospital',
      experience: 15,
      consultationFee: 500,
      rating: 4.8,
      totalReviews: 150,
    },
    isVerified: true,
  },
};

// Demo credentials
const DEMO_CREDENTIALS = {
  'patient@sehat.com': 'Patient@123',
  'drrajesh@sehat.com': 'Rajesh@123',
};

// Types
export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor';
  profile: any;
  isVerified: boolean;
  doctorInfo?: any;
  patientInfo?: any;
}

export interface AuthResponse {
  user: User;
}

class AuthService {
  /**
   * Login user with demo credentials only
   */
  async login(data: LoginData) {
    try {
      const { email, password } = data;
      const emailLower = email.toLowerCase();
      
      // Check if credentials match demo users
      if (emailLower in DEMO_CREDENTIALS && DEMO_CREDENTIALS[emailLower as keyof typeof DEMO_CREDENTIALS] === password) {
        const userType = emailLower.includes('patient') ? 'patient' : 'doctor';
        const user = DEMO_USERS[userType];
        
        // Save user data locally
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        return {
          success: true,
          data: { user },
          message: 'Login successful',
        };
      } else {
        throw new Error('Invalid credentials. Use demo credentials: patient@sehat.com / Patient@123 or drrajesh@sehat.com / Rajesh@123');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Get current user from local storage
   */
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        return {
          success: true,
          data: { user },
        };
      }
      return {
        success: false,
        data: null,
      };
    } catch (error: any) {
      console.error('Get current user failed:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get stored user data
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (has stored user data)
   */
  async isAuthenticated(): Promise<boolean> {
    const userData = await this.getUserData();
    return userData !== null;
  }

  /**
   * Initialize auth service (load user from storage)
   */
  async initialize() {
    try {
      const userData = await this.getUserData();
      if (userData) {
        console.log('✅ User data loaded from storage:', userData.email);
      } else {
        console.log('ℹ️ No user data found in storage');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
