// Health and medical related types for SehatConnect

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: number; // years of experience
  consultationFee: number;
  languages: string[];
  availability: DoctorAvailability;
  image?: string;
  emoji: string;
  description?: string;
  qualifications: string[];
  hospital?: string;
  distance?: number; // in km
  isOnline: boolean;
  nextAvailableSlot?: string;
}

export interface DoctorAvailability {
  isAvailable: boolean;
  nextAvailableTime?: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  date: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  symptoms?: string[];
  prescription?: Prescription;
  followUpRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'rescheduled';

export type AppointmentType = 
  | 'video-consultation' 
  | 'phone-consultation' 
  | 'in-person' 
  | 'follow-up';

export interface Prescription {
  id: string;
  appointmentId: string;
  medications: Medication[];
  instructions: string;
  followUpDate?: string;
  doctorNotes: string;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface HealthMetric {
  id: string;
  type: HealthMetricType;
  value: string;
  unit: string;
  status: HealthStatus;
  recordedAt: string;
  notes?: string;
}

export type HealthMetricType = 
  | 'blood-pressure' 
  | 'heart-rate' 
  | 'temperature' 
  | 'weight' 
  | 'height' 
  | 'blood-sugar' 
  | 'oxygen-saturation';

export type HealthStatus = 
  | 'normal' 
  | 'warning' 
  | 'critical' 
  | 'upcoming';

export interface HealthSummary {
  bloodPressure: string;
  nextAppointment: string;
  medicinesDue: string;
  lastCheckup: string;
  emergencyContact?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  isEnabled: boolean;
}

export interface NearbyService {
  id: string;
  name: string;
  type: ServiceType;
  distance: number;
  rating: number;
  isAvailable: boolean;
  address: string;
  phone?: string;
  workingHours: string;
}

export type ServiceType = 
  | 'hospital' 
  | 'clinic' 
  | 'pharmacy' 
  | 'lab' 
  | 'ambulance';

// API Response types
export interface DoctorListResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
}

export interface HealthDataResponse {
  metrics: HealthMetric[];
  summary: HealthSummary;
  lastUpdated: string;
}

// Filter and search types
export interface DoctorFilters {
  specialty?: string;
  rating?: number;
  maxDistance?: number;
  isOnline?: boolean;
  maxFee?: number;
  languages?: string[];
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
}

// Form types
export interface AppointmentBookingForm {
  doctorId: string;
  date: string;
  time: string;
  type: AppointmentType;
  symptoms: string[];
  notes: string;
  emergencyContact?: string;
}

export interface DoctorReviewForm {
  doctorId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  wouldRecommend: boolean;
}
