import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/AuthService';

export type UserRole = 'patient' | 'doctor';

interface User {
  _id?: string;
  fullName: string;
  patientId: string;
  shortName: string;
  profileImage: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialty?: string; // For doctors
  hospital?: string; // For doctors
  experience?: number; // For doctors
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  phone: string;
  role: 'patient' | 'doctor';
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from AsyncStorage on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔐 Initializing auth state...');
      await authService.initialize();
      
      // Check if token exists before trying to get current user
      const token = await authService.getAccessToken();
      
      if (token) {
        // Try to get current user if token exists
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          const userData = response.data.user;
          console.log('✅ User authenticated:', userData.email);
          
          setUser({
            _id: userData._id,
            fullName: userData.profile?.fullName || userData.email,
            patientId: userData.patientInfo?.patientId || userData._id || '',
            shortName: userData.profile?.fullName?.split(' ')[0] || 'User',
            profileImage: userData.profile?.photoUrl || '',
            email: userData.email,
            phone: userData.phone,
            role: userData.role as UserRole,
            specialty: userData.doctorInfo?.specialty,
            hospital: userData.doctorInfo?.hospital,
            experience: userData.doctorInfo?.experience,
          });
          setIsAuthenticated(true);
        } else {
          console.log('ℹ️ Token exists but user fetch failed');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No token found, user not authenticated');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log('ℹ️ Auth initialization failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Logging in user:', email);
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        const userData = response.data.user;
        console.log('✅ Login successful:', userData.email);
        
        setUser({
          _id: userData._id,
          fullName: userData.profile?.fullName || userData.email,
          patientId: userData.patientInfo?.patientId || userData._id || '',
          shortName: userData.profile?.fullName?.split(' ')[0] || 'User',
          profileImage: userData.profile?.photoUrl || '',
          email: userData.email,
          phone: userData.phone,
          role: userData.role as UserRole,
          specialty: userData.doctorInfo?.specialty,
          hospital: userData.doctorInfo?.hospital,
          experience: userData.doctorInfo?.experience,
        });
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('📝 Registering user:', data.email);
      const response = await authService.register({
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        profile: {
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth || '1990-01-01',
          gender: data.gender || 'other',
        },
      });

      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      console.log('✅ Registration successful, OTP sent to:', data.email);
      return { success: true, message: response.message };
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔓 Logging out user');
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Even if logout API fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser({
          _id: userData._id,
          fullName: userData.profile?.fullName || userData.email,
          patientId: userData.patientInfo?.patientId || userData._id || '',
          shortName: userData.profile?.fullName?.split(' ')[0] || 'User',
          profileImage: userData.profile?.photoUrl || '',
          email: userData.email,
          phone: userData.phone,
          role: userData.role as UserRole,
          specialty: userData.doctorInfo?.specialty,
          hospital: userData.doctorInfo?.hospital,
          experience: userData.doctorInfo?.experience,
        });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
