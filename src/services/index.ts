/**
 * Service Layer Index
 * Central export for all backend API services
 */

// Core API Service
export { default as apiService } from './ApiService';

// Authentication & User Services
export { default as authService } from './AuthService';
export { default as userService } from './UserService';

// Health Services
export { default as healthService } from './HealthService';
export { default as appointmentService } from './AppointmentService';

// Pharmacy Services
export { default as pharmacyService } from './PharmacyService';

// Chatbot & Emergency Services
export { default as backendChatbotService } from './BackendChatbotService';
export { default as chatbotService } from './ChatbotService'; // Original Python backend chatbot

// Government Schemes
export { default as governmentSchemeService } from './GovernmentSchemeService';

// Type exports
export type {
  // Auth types
  RegisterData,
  AuthResponse,
} from './AuthService';

export type {
  // User types
  UserProfile,
  FamilyMember,
  Doctor,
} from './UserService';

export type {
  // Appointment types
  Appointment,
} from './AppointmentService';

export type {
  // Health types
  HealthMetric,
  MedicineReminder,
  AdherenceRecord,
} from './HealthService';

export type {
  // Pharmacy types
  Pharmacy,
  OrderItem,
  PharmacyOrder,
} from './PharmacyService';

export type {
  // Backend Chatbot types
  BackendChatMessage,
  BackendChatbotConversation,
  SymptomAnalysis,
} from './BackendChatbotService';

export type {
  // Government Scheme types
  GovernmentScheme,
  SchemeBookmark,
} from './GovernmentSchemeService';
