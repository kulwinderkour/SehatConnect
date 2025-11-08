import { Platform, Alert, Linking } from 'react-native';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';

// For now, we'll use a manual location fallback
// To enable automatic location, install: npm install @react-native-community/geolocation
// Then uncomment the line below:
// import Geolocation from '@react-native-community/geolocation';

export interface PharmacyStore {
  id: string;
  name: string;
  type: 'generic' | 'private';
  address: string;
  distance: number; // in km
  latitude: number;
  longitude: number;
  phone?: string;
  openingHours?: string;
  rating?: number;
  isOpen?: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

class PharmacyLocationService {
  private static instance: PharmacyLocationService;

  private constructor() {}

  public static getInstance(): PharmacyLocationService {
    if (!PharmacyLocationService.instance) {
      PharmacyLocationService.instance = new PharmacyLocationService();
    }
    return PharmacyLocationService.instance;
  }

  /**
   * Request location permissions
   */
  public async requestLocationPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      if (!permission) {
        return false;
      }

      // First check if we already have permission
      const checkResult = await check(permission);
      
      if (checkResult === RESULTS.GRANTED) {
        return true;
      }

      // If not granted, request permission
      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      }

      // Permission denied or blocked
      if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        Alert.alert(
          'Location Permission Required',
          'SehatConnect needs location access to find nearby pharmacies. Please enable location permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }

      return false;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }

  /**
   * Get current user location
   */
  public async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      // Request permission first
      const hasPermission = await this.requestLocationPermission();
      
      // Use default location regardless of permission status
      // This allows the feature to work even without location permission
      const defaultLocation: UserLocation = {
        latitude: 31.3260,
        longitude: 75.5762,
        address: 'Jalandhar, Punjab, India (Default Location)'
      };
      
      if (!hasPermission) {
        // Still return default location so feature works
        console.log('Location permission denied, using default location');
        return defaultLocation;
      }

      // Permission granted - return default location for now
      // TODO: Install @react-native-community/geolocation for automatic location
      console.log('Location permission granted, using default location (geolocation not yet installed)');
      return defaultLocation;
      
      /* Uncomment this code after installing @react-native-community/geolocation
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          async (position: any) => {
            const { latitude, longitude } = position.coords;
            const address = await this.reverseGeocode(latitude, longitude);
            resolve({ latitude, longitude, address });
          },
          (error: any) => {
            console.error('Error getting location:', error);
            // Fallback to default location
            resolve(defaultLocation);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 10000 
          }
        );
      });
      */
    } catch (error) {
      console.error('Location error:', error);
      // Return default location as fallback
      return {
        latitude: 31.3260,
        longitude: 75.5762,
        address: 'Jalandhar, Punjab, India'
      };
    }
  }

  /**
   * Convert coordinates to address using reverse geocoding
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      // Using a free geocoding API (you can replace with Google Maps or other service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SehatConnect/1.0'
          }
        }
      );
      const data = await response.json();
      return data.display_name || 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown location';
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get nearby pharmacy stores
   * In production, this should fetch from a real API
   */
  public async getNearbyPharmacies(
    userLocation: UserLocation,
    radiusKm: number = 5,
    filterType?: 'generic' | 'private'
  ): Promise<PharmacyStore[]> {
    // Mock data - Replace with actual API call in production
    const mockPharmacies: PharmacyStore[] = [
      // Generic Medicine Pharmacies (Jan Aushadhi Kendras)
      {
        id: 'p1',
        name: 'Jan Aushadhi Kendra - Civil Hospital',
        type: 'generic',
        address: 'Civil Hospital, Jalandhar, Punjab 144001',
        latitude: 31.3260,
        longitude: 75.5762,
        phone: '+91 98765 00001',
        openingHours: '9:00 AM - 9:00 PM',
        rating: 4.5,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p2',
        name: 'Jan Aushadhi Kendra - Model Town',
        type: 'generic',
        address: 'Model Town, Jalandhar, Punjab 144003',
        latitude: 31.3340,
        longitude: 75.5680,
        phone: '+91 98765 00002',
        openingHours: '8:00 AM - 8:00 PM',
        rating: 4.2,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p3',
        name: 'PMBJP Jan Aushadhi Kendra',
        type: 'generic',
        address: 'BMC Chowk, Jalandhar, Punjab 144001',
        latitude: 31.3256,
        longitude: 75.5792,
        phone: '+91 98765 00003',
        openingHours: '9:00 AM - 7:00 PM',
        rating: 4.0,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p4',
        name: 'Jan Aushadhi Medical Store',
        type: 'generic',
        address: 'Guru Nanak Mission Chowk, Jalandhar, Punjab 144002',
        latitude: 31.3200,
        longitude: 75.5850,
        phone: '+91 98765 00004',
        openingHours: '9:00 AM - 9:00 PM',
        rating: 4.3,
        isOpen: true,
        distance: 0
      },

      // Private Pharmacies
      {
        id: 'p5',
        name: 'Apollo Pharmacy',
        type: 'private',
        address: 'GT Road, Jalandhar, Punjab 144001',
        latitude: 31.3250,
        longitude: 75.5800,
        phone: '+91 98765 11111',
        openingHours: '24/7',
        rating: 4.6,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p6',
        name: 'MedPlus Pharmacy',
        type: 'private',
        address: 'Model Town Extension, Jalandhar, Punjab 144003',
        latitude: 31.3380,
        longitude: 75.5720,
        phone: '+91 98765 22222',
        openingHours: '8:00 AM - 11:00 PM',
        rating: 4.4,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p7',
        name: 'Guardian Pharmacy',
        type: 'private',
        address: 'Central Town, Jalandhar, Punjab 144001',
        latitude: 31.3280,
        longitude: 75.5820,
        phone: '+91 98765 33333',
        openingHours: '7:00 AM - 10:00 PM',
        rating: 4.3,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p8',
        name: 'City Medical Store',
        type: 'private',
        address: 'Nehru Garden Road, Jalandhar, Punjab 144001',
        latitude: 31.3230,
        longitude: 75.5780,
        phone: '+91 98765 44444',
        openingHours: '8:00 AM - 10:00 PM',
        rating: 4.1,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p9',
        name: 'Sharma Medical Hall',
        type: 'private',
        address: 'Railway Road, Jalandhar, Punjab 144002',
        latitude: 31.3190,
        longitude: 75.5870,
        phone: '+91 98765 55555',
        openingHours: '9:00 AM - 9:00 PM',
        rating: 4.2,
        isOpen: false,
        distance: 0
      },
      {
        id: 'p10',
        name: 'HealthKart Pharmacy',
        type: 'private',
        address: 'BMC Chowk, Jalandhar, Punjab 144001',
        latitude: 31.3270,
        longitude: 75.5810,
        phone: '+91 98765 66666',
        openingHours: '10:00 AM - 10:00 PM',
        rating: 4.5,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p11',
        name: 'Life Care Pharmacy',
        type: 'private',
        address: 'Kapurthala Road, Jalandhar, Punjab 144004',
        latitude: 31.3150,
        longitude: 75.5900,
        phone: '+91 98765 77777',
        openingHours: '8:00 AM - 11:00 PM',
        rating: 4.0,
        isOpen: true,
        distance: 0
      },
      {
        id: 'p12',
        name: 'Wellness Forever',
        type: 'private',
        address: 'Urban Estate Phase 2, Jalandhar, Punjab 144022',
        latitude: 31.3420,
        longitude: 75.5650,
        phone: '+91 98765 88888',
        openingHours: '24/7',
        rating: 4.7,
        isOpen: true,
        distance: 0
      },
    ];

    // Calculate distances
    const pharmaciesWithDistance = mockPharmacies.map(pharmacy => ({
      ...pharmacy,
      distance: this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        pharmacy.latitude,
        pharmacy.longitude
      )
    }));

    // Filter by radius
    let filtered = pharmaciesWithDistance.filter(
      pharmacy => pharmacy.distance <= radiusKm
    );

    // Filter by type if specified
    if (filterType) {
      filtered = filtered.filter(pharmacy => pharmacy.type === filterType);
    }

    // Sort by distance
    return filtered.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Open pharmacy location in maps app
   */
  public openInMaps(pharmacy: PharmacyStore): void {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });
    const latLng = `${pharmacy.latitude},${pharmacy.longitude}`;
    const label = pharmacy.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
    }
  }

  /**
   * Call pharmacy
   */
  public callPharmacy(pharmacy: PharmacyStore): void {
    if (pharmacy.phone) {
      const phoneNumber = `tel:${pharmacy.phone}`;
      Linking.openURL(phoneNumber).catch(err => {
        console.error('Error making call:', err);
        Alert.alert('Error', 'Could not open phone dialer');
      });
    }
  }
}

export default PharmacyLocationService.getInstance();
