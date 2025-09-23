import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { EmergencyLocation, EmergencyContact } from '../types/emergency';

// Mock geolocation for development - replace with proper implementation later
const mockGeolocation = {
  getCurrentPosition: (
    success: (position: any) => void,
    _error: (error: any) => void,
    _options?: any
  ) => {
    // Simulate successful location retrieval
    setTimeout(() => {
      success({
        coords: {
          latitude: 30.7333, // Chandigarh coordinates as example
          longitude: 76.7794,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    }, 1000);
  },
  watchPosition: (
    success: (position: any) => void,
    _error: (error: any) => void,
    _options?: any
  ) => {
    // Return a mock watch ID
    const watchId = setInterval(() => {
      success({
        coords: {
          latitude: 30.7333 + (Math.random() - 0.5) * 0.001, // Small variation
          longitude: 76.7794 + (Math.random() - 0.5) * 0.001,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    }, 5000);
    return watchId;
  },
  clearWatch: (watchId: any) => {
    if (watchId) {
      clearInterval(watchId);
    }
  },
};

class EmergencyLocationService {
  private static instance: EmergencyLocationService;
  private currentLocation: EmergencyLocation | null = null;
  private watchId: number | null = null;

  public static getInstance(): EmergencyLocationService {
    if (!EmergencyLocationService.instance) {
      EmergencyLocationService.instance = new EmergencyLocationService();
    }
    return EmergencyLocationService.instance;
  }

  public async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        // First check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (checkResult) {
          return true;
        }

        // Show explanation before requesting permission
        return new Promise((resolve) => {
          Alert.alert(
            'Location Access Required',
            'To provide emergency services, we need access to your location to:\n\n• Find the nearest hospital\n• Send your location to emergency services\n• Notify nearby healthcare providers\n\nYour location will only be used during emergencies.',
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: 'Allow Location',
                onPress: async () => {
                  try {
                    const granted = await PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                      {
                        title: 'Emergency Location Access',
                        message: 'Allow SehatConnect to access your location for emergency services?',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Deny',
                        buttonPositive: 'Allow',
                      }
                    );
                    resolve(granted === PermissionsAndroid.RESULTS.GRANTED);
                  } catch (error) {
                    console.error('Permission request error:', error);
                    resolve(false);
                  }
                },
              },
            ]
          );
        });
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    }
    return true; // iOS permissions handled differently
  }

  public async getCurrentLocation(): Promise<EmergencyLocation | null> {
    return new Promise((resolve) => {
      mockGeolocation.getCurrentPosition(
        (position: any) => {
          const location: EmergencyLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Location coordinates obtained',
            accuracy: position.coords.accuracy || 0,
            timestamp: Date.now(),
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error: any) => {
          console.error('Location error:', error);
          Alert.alert(
            'Location Error',
            'Unable to get your location. Emergency services will be notified without location data.'
          );
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  public startLocationTracking(callback: (location: EmergencyLocation) => void): void {
    this.watchId = mockGeolocation.watchPosition(
      (position: any) => {
        const location: EmergencyLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Live location',
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        this.currentLocation = location;
        callback(location);
      },
      (_error: any) => {
        console.error('Location tracking error:', _error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10, // Update every 10 meters
      }
    );
  }

  public stopLocationTracking(): void {
    if (this.watchId !== null) {
      mockGeolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  public getLastKnownLocation(): EmergencyLocation | null {
    return this.currentLocation;
  }

  public async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      // In a real app, you would use a geocoding service like Google Maps API
      // For now, return formatted coordinates
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }
}

class EmergencyNotificationService {
  private static instance: EmergencyNotificationService;
  private emergencyContacts: EmergencyContact[] = [];

  public static getInstance(): EmergencyNotificationService {
    if (!EmergencyNotificationService.instance) {
      EmergencyNotificationService.instance = new EmergencyNotificationService();
    }
    return EmergencyNotificationService.instance;
  }

  public setEmergencyContacts(contacts: EmergencyContact[]): void {
    this.emergencyContacts = contacts;
  }

  public async notifyEmergencyContacts(
    emergencyType: string,
    location: EmergencyLocation | null,
    message?: string
  ): Promise<string[]> {
    const notifiedContacts: string[] = [];
    
    for (const contact of this.emergencyContacts) {
      try {
        await this.sendEmergencyNotification(contact, emergencyType, location, message);
        notifiedContacts.push(contact.id);
      } catch (error) {
        console.error(`Failed to notify ${contact.name}:`, error);
      }
    }

    return notifiedContacts;
  }

  private async sendEmergencyNotification(
    contact: EmergencyContact,
    emergencyType: string,
    location: EmergencyLocation | null,
    customMessage?: string
  ): Promise<void> {
    let message = customMessage || `EMERGENCY: ${emergencyType} situation. Immediate assistance needed.`;
    
    if (location) {
      const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      message += `\nLocation: ${locationUrl}`;
      message += `\nAddress: ${location.address}`;
    }

    message += '\nThis is an automated emergency alert from SehatConnect.';

    // In a real app, you would integrate with SMS service, push notifications, etc.
    // For now, we'll simulate the notification
    console.log(`Sending emergency notification to ${contact.name}:`, message);
    
    // Simulate async operation
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
  }

  public async notifyEmergencyServices(
    emergencyType: string,
    location: EmergencyLocation | null,
    patientInfo?: any
  ): Promise<boolean> {
    try {
      // In a real app, this would integrate with emergency services API
      console.log('Notifying emergency services:', {
        type: emergencyType,
        location,
        patientInfo,
        timestamp: new Date().toISOString(),
      });

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error('Failed to notify emergency services:', error);
      return false;
    }
  }

  public async notifyNearbyHealthcare(
    emergencyType: string,
    location: EmergencyLocation | null,
    urgencyLevel: 'critical' | 'high' | 'medium' = 'high'
  ): Promise<{ success: boolean; notifiedFacilities: string[] }> {
    try {
      if (!location) {
        console.warn('Cannot notify nearby healthcare without location');
        return { success: false, notifiedFacilities: [] };
      }

      // Mock nearby healthcare facilities based on emergency type
      const nearbyFacilities = this.getMockNearbyHealthcare(location, emergencyType);
      const notifiedFacilities: string[] = [];

      for (const facility of nearbyFacilities) {
        try {
          await this.sendHealthcareNotification(facility, emergencyType, location, urgencyLevel);
          notifiedFacilities.push(facility.name);
          console.log(`✅ Notified ${facility.name} - ETA: ${facility.estimatedTime}`);
        } catch (error) {
          console.error(`Failed to notify ${facility.name}:`, error);
        }
      }

      // Show user confirmation
      if (notifiedFacilities.length > 0) {
        Alert.alert(
          'Healthcare Notified',
          `Successfully notified ${notifiedFacilities.length} nearby healthcare facilities:\n\n${notifiedFacilities.join('\n')}\n\nThey have been informed of your emergency and location.`,
          [{ text: 'OK' }]
        );
      }

      return { success: notifiedFacilities.length > 0, notifiedFacilities };
    } catch (error) {
      console.error('Failed to notify nearby healthcare:', error);
      return { success: false, notifiedFacilities: [] };
    }
  }

  private getMockNearbyHealthcare(location: EmergencyLocation, emergencyType: string) {
    // Mock healthcare facilities based on emergency type and location
    const baseFacilities = [
      {
        name: 'Apollo Hospital',
        type: 'hospital',
        distance: 2.1,
        estimatedTime: '8-12 mins',
        specialties: ['emergency', 'cardiology', 'trauma'],
        coordinates: { lat: location.latitude + 0.01, lng: location.longitude + 0.01 }
      },
      {
        name: 'Max Healthcare',
        type: 'hospital',
        distance: 3.5,
        estimatedTime: '12-15 mins',
        specialties: ['emergency', 'neurology', 'pediatrics'],
        coordinates: { lat: location.latitude - 0.02, lng: location.longitude + 0.015 }
      },
      {
        name: 'Fortis Hospital',
        type: 'hospital',
        distance: 1.8,
        estimatedTime: '6-10 mins',
        specialties: ['emergency', 'orthopedics', 'cardiology'],
        coordinates: { lat: location.latitude + 0.008, lng: location.longitude - 0.012 }
      },
      {
        name: 'City Medical Center',
        type: 'clinic',
        distance: 0.9,
        estimatedTime: '3-5 mins',
        specialties: ['general', 'emergency'],
        coordinates: { lat: location.latitude + 0.005, lng: location.longitude - 0.005 }
      }
    ];

    // Filter and sort by distance and relevance to emergency type
    return baseFacilities
      .filter(facility => {
        // Always include hospitals for any emergency
        if (facility.type === 'hospital') return true;
        // Include clinics for less critical emergencies
        return !['heart_attack', 'stroke', 'severe_trauma'].includes(emergencyType);
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Notify top 3 closest relevant facilities
  }

  private async sendHealthcareNotification(
    facility: any,
    emergencyType: string,
    location: EmergencyLocation,
    urgencyLevel: string
  ): Promise<void> {
    const notification = {
      type: 'EMERGENCY_ALERT',
      urgencyLevel,
      emergencyType,
      patientLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy
      },
      facilityInfo: facility,
      timestamp: new Date().toISOString(),
      estimatedDistance: `${facility.distance} km`,
      message: `🚨 EMERGENCY ALERT: ${emergencyType} case reported ${facility.distance} km from your facility. Patient location and details attached. Please prepare for potential incoming patient.`
    };

    // In a real app, this would send to healthcare facility's notification system
    console.log(`📱 Sending notification to ${facility.name}:`, notification);
    
    // Simulate network delay
    await new Promise<void>(resolve => setTimeout(resolve, 800));
  }

  public async sendLocationUpdate(
    incidentId: string,
    location: EmergencyLocation
  ): Promise<void> {
    try {
      // Send location update to emergency services
      console.log(`Location update for incident ${incidentId}:`, location);
      
      // In a real app, this would update the emergency services system
      await new Promise<void>(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to send location update:', error);
    }
  }
}

// Export service instances
export const emergencyLocationService = EmergencyLocationService.getInstance();
export const emergencyNotificationService = EmergencyNotificationService.getInstance();

// Export utility functions
export const formatLocationForSharing = (location: EmergencyLocation): string => {
  return `Location: ${location.address}\nCoordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\nAccuracy: ${location.accuracy ? `${location.accuracy}m` : 'Unknown'}`;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
};