export interface EmergencyType {
  id: string;
  title: string;
  icon: string;
  emoji: string;
  color: string;
  description: string;
  firstAidSteps: FirstAidStep[];
  specializedActions: SpecializedAction[];
  nearestFacilityType: 'hospital' | 'trauma_center' | 'maternity' | 'poison_control' | 'pediatric';
}

export interface FirstAidStep {
  id: string;
  step: number;
  instruction: string;
  warning?: string;
  audioKey?: string;
}

export interface SpecializedAction {
  id: string;
  label: string;
  action: 'call_ambulance' | 'call_specialist' | 'show_guide' | 'find_facility' | 'contact_family';
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface EmergencyLocation {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
  timestamp: number;
}

export interface EmergencyIncident {
  id: string;
  type: EmergencyType;
  status: 'initiated' | 'first_aid_shown' | 'ambulance_called' | 'in_transit' | 'at_hospital' | 'resolved';
  location: EmergencyLocation;
  timestamp: number;
  estimatedArrival?: number;
  ambulanceId?: string;
  hospitalId?: string;
  contactsNotified: string[];
  notes?: string;
}

export interface EmergencyTracker {
  incident: EmergencyIncident;
  ambulanceStatus: 'dispatched' | 'en_route' | 'arrived' | 'transporting';
  estimatedArrival: number;
  currentLocation?: EmergencyLocation;
  hospitalNotified: boolean;
  familyNotified: boolean;
}

export interface PostEmergencySupport {
  incidentReport: {
    id: string;
    summary: string;
    actions_taken: string[];
    outcome: string;
    timestamp: number;
  };
  recommendedMedicines: {
    name: string;
    dosage: string;
    availability: 'available' | 'limited' | 'unavailable';
    nearestPharmacy?: string;
  }[];
  followUpConsultation: {
    specialty: string;
    urgency: 'immediate' | 'within_24h' | 'within_week';
    availableDoctors: string[];
  };
}

// Emergency workflow step types
export type EmergencyStep = 
  | 'type_selection'
  | 'first_aid'
  | 'emergency_actions'
  | 'tracking'
  | 'post_emergency';

export interface EmergencyWizardState {
  currentStep: EmergencyStep;
  selectedType?: EmergencyType;
  incident?: EmergencyIncident;
  isAudioEnabled: boolean;
  language: 'en' | 'hi' | 'pa';
}