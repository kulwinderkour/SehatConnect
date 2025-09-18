import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Appointment, AppointmentBookingForm, AppointmentStatus } from '../types/health';

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

      const newAppointment: Appointment = {
        id: generateId(),
        doctorId: form.doctorId,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        patientId: 'patient1', // This should come from auth context
        patientName: 'Rajinder Singh', // This should come from auth context
        date: form.date,
        time: form.time,
        duration: 30, // Default duration
        status: 'scheduled' as AppointmentStatus,
        type: form.type,
        notes: form.notes,
        symptoms: form.symptoms,
        followUpRequired: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to book appointment' });
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
