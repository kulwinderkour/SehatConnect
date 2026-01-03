import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Appointment, AppointmentBookingForm, AppointmentStatus, AppointmentType } from '../types/health';
import doctorService from '../services/DoctorService';
import appointmentService from '../services/AppointmentService';

// Appointment state interface
interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

// Appointment actions
type AppointmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] };

// Initial state
const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
};

// Appointment reducer
const appointmentReducer = (state: AppointmentState, action: AppointmentAction): AppointmentState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [...state.appointments, action.payload],
        error: null,
      };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id ? action.payload : apt
        ),
        error: null,
      };
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt.id !== action.payload),
        error: null,
      };
    case 'SET_APPOINTMENTS':
      return {
        ...state,
        appointments: action.payload,
        error: null,
      };
    default:
      return state;
  }
};

// Context interface
interface AppointmentContextValue {
  state: AppointmentState;
  addAppointment: (form: AppointmentBookingForm, doctor: any) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
  getAppointments: () => Appointment[];
  getAppointmentById: (id: string) => Appointment | undefined;
  fetchAppointmentsForDoctor: (doctorId: string, date?: string) => Promise<Appointment[]>;
  clearError: () => void;
}

// Create context
const AppointmentContext = createContext<AppointmentContextValue | undefined>(undefined);

// Provider component
export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  // Generate unique ID
  const generateId = () => {
    return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add appointment
  const addAppointment = useCallback(async (form: AppointmentBookingForm, doctor: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Prepare booking data
      // Note: We override doctorId to demo-doctor-id for demo purposes
      const bookingData = {
        doctorId: 'demo-doctor-id',
        appointmentDate: form.date,
        appointmentTime: form.time,
        type: form.type,
        reason: form.notes || 'General Consultation',
        symptoms: form.symptoms,
      };

      console.log('Booking appointment with data:', bookingData);

      // Call API to book appointment
      const response = await appointmentService.bookAppointment(bookingData);

      if (response.success && response.data) {
        const backendAppt = response.data.appointment;

        // Map backend response to frontend Appointment structure
        const newAppointment: Appointment = {
          id: backendAppt._id,
          doctorId: backendAppt.doctorId?._id || backendAppt.doctorId || 'unknown', // Safe navigation
          doctorName: doctor.name, // Use local doctor name as backend might not populate immediately
          doctorSpecialty: doctor.specialty,
          patientId: backendAppt.patientId?._id || backendAppt.patientId || 'unknown', // Safe navigation
          patientName: 'Rajinder Singh', // Fallback or from auth
          // Convert Date object to YYYY-MM-DD string format
          date: backendAppt.appointmentDate
            ? new Date(backendAppt.appointmentDate).toISOString().split('T')[0]
            : '',
          // Ensure time is a string
          time: backendAppt.appointmentTime || '',
          duration: 30,
          status: backendAppt.status as AppointmentStatus,
          type: backendAppt.type as AppointmentType, // Cast as we updated service
          notes: backendAppt.notes,
          symptoms: backendAppt.symptoms,
          followUpRequired: false,
          createdAt: backendAppt.createdAt,
          updatedAt: backendAppt.updatedAt,
        };

        console.log('Appointment booked successfully:', newAppointment);
        dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
      } else {
        throw new Error(response.error || response.message || 'Failed to book appointment');
      }

    } catch (error: any) {
      console.error('Booking error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to book appointment' });
      // Re-throw to let the UI know it failed
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Update appointment
  const updateAppointment = useCallback(async (appointment: Appointment) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const updatedAppointment = {
        ...appointment,
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'UPDATE_APPOINTMENT', payload: updatedAppointment });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update appointment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Delete appointment
  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      dispatch({ type: 'DELETE_APPOINTMENT', payload: appointmentId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete appointment' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get appointments
  const getAppointments = useCallback(() => {
    return state.appointments;
  }, [state.appointments]);

  // Get appointment by ID
  const getAppointmentById = useCallback((id: string) => {
    return state.appointments.find(apt => apt.id === id);
  }, [state.appointments]);

  // Fetch appointments from backend for a given doctor and store in state
  const fetchAppointmentsForDoctor = useCallback(async (doctorId: string, date?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const appointments = await doctorService.getDoctorAppointments(doctorId, date);

      // Transform backend appointments to match frontend format
      const transformedAppointments = (appointments || []).map((apt: any) => ({
        id: apt._id || apt.id,
        doctorId: apt.doctorId?._id || apt.doctorId,
        doctorName: apt.doctorId?.profile?.name || 'Dr. Rajesh Sharma',
        doctorSpecialty: apt.doctorId?.doctorInfo?.specialty || 'General Medicine',
        patientId: apt.patientId?._id || apt.patientId,
        patientName: apt.patientId?.profile?.fullName || 'Unknown Patient',
        // Convert Date to YYYY-MM-DD string
        date: apt.appointmentDate
          ? new Date(apt.appointmentDate).toISOString().split('T')[0]
          : '',
        time: apt.appointmentTime || '',
        duration: apt.duration || 30,
        status: apt.status || 'scheduled',
        type: apt.type || 'video-consultation',
        notes: apt.notes || apt.reason || '',
        symptoms: apt.symptoms || [],
        condition: apt.reason || '', // Map reason to condition
        followUpRequired: apt.followUpRequired || false,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
      }));

      // Normalize incoming appointments if needed and then set
      dispatch({ type: 'SET_APPOINTMENTS', payload: transformedAppointments });

      return transformedAppointments;
    } catch (error: any) {
      // Only log error if it's not a network/backend issue
      if (!error.message?.includes('Network request failed') && !error.message?.includes('Unable to connect')) {
        console.error('fetchAppointmentsForDoctor error:', error);
      }
      dispatch({ type: 'SET_ERROR', payload: null }); // Don't set error for network issues
      dispatch({ type: 'SET_APPOINTMENTS', payload: [] }); // Set empty array
      return [] as Appointment[];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: AppointmentContextValue = {
    state,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointments,
    getAppointmentById,
    fetchAppointmentsForDoctor,
    clearError,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

// Hook to use appointment context
export const useAppointments = (): AppointmentContextValue => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

export default AppointmentContext;
