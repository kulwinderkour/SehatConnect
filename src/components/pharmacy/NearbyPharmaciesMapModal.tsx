import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

interface NearbyPharmaciesMapModalProps {
  visible: boolean;
  onClose: () => void;
  pinCode?: string;
  cityName?: string;
}

interface PharmacyLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  rating?: number;
  type: 'generic' | 'private';
  distance?: number;
  isOpen?: boolean;
  placeId?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Close Icon Component
const CloseIcon = () => (
  <View style={styles.closeIconContainer}>
    <View style={styles.closeLine1} />
    <View style={styles.closeLine2} />
  </View>
);

// Location Icon Component
const MyLocationIcon = () => (
  <View style={styles.myLocationIconContainer}>
    <View style={styles.locationCircleOuter}>
      <View style={styles.locationCircleInner} />
    </View>
  </View>
);

// List Icon Component
const ListIcon = () => (
  <View style={styles.listIconContainer}>
    <View style={styles.listLine} />
    <View style={[styles.listLine, { marginTop: 4 }]} />
    <View style={[styles.listLine, { marginTop: 4 }]} />
  </View>
);

const NearbyPharmaciesMapModal: React.FC<NearbyPharmaciesMapModalProps> = ({
  visible,
  onClose,
  pinCode,
  cityName,
}) => {
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyLocation[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyLocation | null>(null);
  const [showList, setShowList] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUserLocation();
    }
  }, [visible, pinCode]);

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      if (!permission) return false;

      const checkResult = await check(permission);
      if (checkResult === RESULTS.GRANTED) {
        setLocationPermission(true);
        return true;
      }

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        setLocationPermission(true);
        return true;
      }

      if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
        Alert.alert(
          'Location Permission Required',
          'To find nearby pharmacies, please enable location permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return false;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  };

  // Get user's current location
  const loadUserLocation = async () => {
    setLoading(true);
    try {
      // If PIN code is provided, try to geocode it first
      if (pinCode && pinCode.length === 6) {
        try {
          const geocodedLocation = await geocodePinCode(pinCode, cityName);
          if (geocodedLocation) {
            setUserLocation(geocodedLocation);
            loadNearbyPharmacies(geocodedLocation.latitude, geocodedLocation.longitude);
            return;
          }
        } catch (error) {
          console.log('Geocoding failed, falling back to GPS:', error);
        }
      }

      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        // Use default location (Jalandhar, India)
        const defaultLocation: UserLocation = {
          latitude: 31.3260,
          longitude: 75.5762,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation(defaultLocation);
        loadNearbyPharmacies(defaultLocation.latitude, defaultLocation.longitude);
        Alert.alert(
          'Using Default Location',
          'Location permission denied. Showing pharmacies near Jalandhar, Punjab. You can search for your area using the map.'
        );
        return;
      }

      // Get actual location
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if we got default emulator location (Mountain View, CA - ~37.4, -122.08)
          // or any location outside India (latitude: 8-37, longitude: 68-97)
          const isInIndia = latitude >= 8 && latitude <= 37 && longitude >= 68 && longitude <= 97;
          const isEmulatorDefault = Math.abs(latitude - 37.4219983) < 0.1 && Math.abs(longitude - (-122.084)) < 0.1;
          
          if (!isInIndia || isEmulatorDefault) {
            console.log('Emulator default or non-India location detected, using Jalandhar');
            // Use Jalandhar as default for India
            const indiaLocation: UserLocation = {
              latitude: 31.3260,
              longitude: 75.5762,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            setUserLocation(indiaLocation);
            loadNearbyPharmacies(31.3260, 75.5762);
          } else {
            console.log('Got valid India location:', latitude, longitude);
            const location: UserLocation = {
              latitude,
              longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            setUserLocation(location);
            loadNearbyPharmacies(latitude, longitude);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default location
          const defaultLocation: UserLocation = {
            latitude: 31.3260,
            longitude: 75.5762,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setUserLocation(defaultLocation);
          loadNearbyPharmacies(defaultLocation.latitude, defaultLocation.longitude);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('Location error:', error);
      setLoading(false);
    }
  };

  // Geocode PIN code to coordinates using Google Geocoding API
  const geocodePinCode = async (pin: string, city?: string): Promise<UserLocation | null> => {
    try {
      const apiKey = 'AIzaSyBG2rxa2AEmsJepxbRZ0wN3AG_jh8JWMcY';
      const address = city ? `${pin}, ${city}, India` : `${pin}, India`;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log(`Geocoded ${pin} to:`, location.lat, location.lng);
        return {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Load nearby pharmacies using Google Places API
  const loadNearbyPharmacies = async (latitude: number, longitude: number) => {
    try {
      // Google Maps API Key
      const apiKey = 'AIzaSyBG2rxa2AEmsJepxbRZ0wN3AG_jh8JWMcY';
      
      // Using Google Places API Nearby Search
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=pharmacy&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        const pharmacyLocations: PharmacyLocation[] = data.results.map((place: any, index: number) => {
          // Calculate distance
          const distance = calculateDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          // Determine pharmacy type based on name (heuristic)
          const isGeneric = 
            place.name.toLowerCase().includes('jan aushadhi') ||
            place.name.toLowerCase().includes('generic') ||
            place.name.toLowerCase().includes('pmbjp');

          return {
            id: place.place_id || `pharmacy-${index}`,
            name: place.name,
            address: place.vicinity || place.formatted_address || 'Address not available',
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            rating: place.rating,
            type: isGeneric ? 'generic' : 'private',
            distance: distance,
            isOpen: place.opening_hours?.open_now,
            placeId: place.place_id,
          };
        });

        // Sort by distance
        pharmacyLocations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setPharmacies(pharmacyLocations);
      } else if (data.status === 'REQUEST_DENIED') {
        // API key not configured
        Alert.alert(
          'Google Maps API Required',
          'To use this feature, you need to configure your Google Maps API key. Using demo data for now.',
          [{ text: 'OK' }]
        );
        // Load demo data instead
        loadDemoPharmacies(latitude, longitude);
      } else {
        // No results or other error, load demo data
        loadDemoPharmacies(latitude, longitude);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      // Load demo data on error
      loadDemoPharmacies(latitude, longitude);
    } finally {
      setLoading(false);
    }
  };

  // Demo pharmacies data (fallback when API is not configured)
  const loadDemoPharmacies = (userLat: number, userLon: number) => {
    const demoPharmacies: PharmacyLocation[] = [
      {
        id: 'demo-1',
        name: 'Jan Aushadhi Kendra - Civil Hospital',
        address: 'Civil Hospital, Jalandhar, Punjab 144001',
        latitude: 31.3260,
        longitude: 75.5762,
        rating: 4.5,
        type: 'generic',
        isOpen: true,
        distance: 0,
      },
      {
        id: 'demo-2',
        name: 'Apollo Pharmacy',
        address: 'GT Road, Jalandhar, Punjab 144001',
        latitude: 31.3250,
        longitude: 75.5800,
        rating: 4.6,
        type: 'private',
        isOpen: true,
        distance: 0,
      },
      {
        id: 'demo-3',
        name: 'MedPlus Pharmacy',
        address: 'Model Town Extension, Jalandhar, Punjab 144003',
        latitude: 31.3380,
        longitude: 75.5720,
        rating: 4.4,
        type: 'private',
        isOpen: true,
        distance: 0,
      },
      {
        id: 'demo-4',
        name: 'Jan Aushadhi Medical Store',
        address: 'BMC Chowk, Jalandhar, Punjab 144001',
        latitude: 31.3256,
        longitude: 75.5792,
        rating: 4.0,
        type: 'generic',
        isOpen: true,
        distance: 0,
      },
      {
        id: 'demo-5',
        name: 'Guardian Pharmacy',
        address: 'Central Town, Jalandhar, Punjab 144001',
        latitude: 31.3280,
        longitude: 75.5820,
        rating: 4.3,
        type: 'private',
        isOpen: false,
        distance: 0,
      },
    ];

    // Calculate distances
    const pharmaciesWithDistance = demoPharmacies.map(pharmacy => ({
      ...pharmacy,
      distance: calculateDistance(userLat, userLon, pharmacy.latitude, pharmacy.longitude),
    }));

    pharmaciesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setPharmacies(pharmaciesWithDistance);
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  };

  const deg2rad = (deg: number): number => deg * (Math.PI / 180);

  // Center map on user location
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(userLocation, 1000);
    }
  };

  // Open directions in maps app
  const openDirections = (pharmacy: PharmacyLocation) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${pharmacy.latitude},${pharmacy.longitude}`;
    const label = pharmacy.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
    }
  };

  // Get phone details from Google Places Details API
  const getPharmacyDetails = async (placeId: string): Promise<string | null> => {
    try {
      const apiKey = 'AIzaSyBG2rxa2AEmsJepxbRZ0wN3AG_jh8JWMcY';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result?.formatted_phone_number) {
        return data.result.formatted_phone_number;
      }
      return null;
    } catch (error) {
      console.error('Error getting pharmacy details:', error);
      return null;
    }
  };

  // Call pharmacy
  const callPharmacy = async (pharmacy: PharmacyLocation) => {
    let phoneNumber: string | undefined = pharmacy.phone;

    // If phone number not available and we have placeId, try to fetch it
    if (!phoneNumber && pharmacy.placeId) {
      setLoading(true);
      const fetchedNumber = await getPharmacyDetails(pharmacy.placeId);
      phoneNumber = fetchedNumber || undefined;
      setLoading(false);
    }

    if (phoneNumber) {
      const url = `tel:${phoneNumber}`;
      Linking.openURL(url).catch((err) => {
        console.error('Error making call:', err);
        Alert.alert('Error', 'Could not open phone dialer');
      });
    } else {
      Alert.alert('Phone Number', 'Phone number not available for this pharmacy');
    }
  };

  // Render pharmacy marker
  const renderMarker = (pharmacy: PharmacyLocation) => {
    const markerColor = pharmacy.type === 'generic' ? '#4CAF50' : '#2196F3';

    return (
      <Marker
        key={pharmacy.id}
        coordinate={{
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        }}
        pinColor={markerColor}
        title={pharmacy.name}
        description={pharmacy.address}
        onPress={() => setSelectedPharmacy(pharmacy)}
      >
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>{pharmacy.name}</Text>
            <Text style={styles.calloutAddress} numberOfLines={2}>
              {pharmacy.address}
            </Text>
            {pharmacy.distance !== undefined && (
              <Text style={styles.calloutDistance}>📍 {pharmacy.distance} km away</Text>
            )}
            {pharmacy.rating && (
              <View style={styles.calloutRating}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.calloutRatingText}>{pharmacy.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </Callout>
      </Marker>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          {userLocation && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={userLocation}
              showsUserLocation={locationPermission}
              showsMyLocationButton={false}
              showsCompass={true}
              showsScale={true}
              zoomEnabled={true}
              zoomControlEnabled={true}
              scrollEnabled={true}
              pitchEnabled={true}
              rotateEnabled={true}
              toolbarEnabled={true}
            >
              {pharmacies.map((pharmacy) => renderMarker(pharmacy))}
            </MapView>
          )}

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1E88E5" />
              <Text style={styles.loadingText}>Loading pharmacies...</Text>
            </View>
          )}

          {/* Header Controls */}
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
              <Text style={styles.headerSubtitle}>{pharmacies.length} pharmacies found</Text>
            </View>
          </View>

          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlButton} onPress={centerOnUser}>
              <MyLocationIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlButton} onPress={() => setShowList(!showList)}>
              <ListIcon />
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Generic Medicine</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>Private Pharmacy</Text>
            </View>
          </View>

          {/* Selected Pharmacy Info Card */}
          {selectedPharmacy && (
            <View style={styles.selectedCard}>
              <TouchableOpacity
                style={styles.closeCardButton}
                onPress={() => setSelectedPharmacy(null)}
              >
                <Text style={styles.closeCardText}>×</Text>
              </TouchableOpacity>

              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.cardTypeBadge,
                    selectedPharmacy.type === 'generic'
                      ? styles.cardGenericBadge
                      : styles.cardPrivateBadge,
                  ]}
                >
                  <Text style={styles.cardTypeBadgeText}>
                    {selectedPharmacy.type === 'generic' ? 'Generic' : 'Private'}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>{selectedPharmacy.name}</Text>
                <Text style={styles.cardAddress} numberOfLines={2}>
                  {selectedPharmacy.address}
                </Text>

                <View style={styles.cardDetailsRow}>
                  {selectedPharmacy.distance !== undefined && (
                    <Text style={styles.cardDistance}>📍 {selectedPharmacy.distance} km</Text>
                  )}
                  {selectedPharmacy.rating && (
                    <View style={styles.cardRating}>
                      <Text style={styles.cardStar}>⭐</Text>
                      <Text style={styles.cardRatingText}>{selectedPharmacy.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  {selectedPharmacy.isOpen !== undefined && (
                    <View
                      style={[
                        styles.cardStatusBadge,
                        selectedPharmacy.isOpen ? styles.cardOpenBadge : styles.cardClosedBadge,
                      ]}
                    >
                      <Text style={styles.cardStatusText}>
                        {selectedPharmacy.isOpen ? '● Open' : '● Closed'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.cardActionButton}
                    onPress={() => callPharmacy(selectedPharmacy)}
                  >
                    <Text style={styles.cardActionText}>📞 Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardActionButton, styles.cardDirectionsButton]}
                    onPress={() => openDirections(selectedPharmacy)}
                  >
                    <Text style={[styles.cardActionText, styles.cardDirectionsText]}>
                      🧭 Directions
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* List View */}
          {showList && (
            <View style={styles.listView}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Nearby Pharmacies ({pharmacies.length})</Text>
                <TouchableOpacity onPress={() => setShowList(false)}>
                  <Text style={styles.listCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                {pharmacies.map((pharmacy, index) => (
                  <TouchableOpacity
                    key={pharmacy.id}
                    style={styles.listItem}
                    onPress={() => {
                      setSelectedPharmacy(pharmacy);
                      setShowList(false);
                      if (mapRef.current) {
                        mapRef.current.animateToRegion(
                          {
                            latitude: pharmacy.latitude,
                            longitude: pharmacy.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          },
                          1000
                        );
                      }
                    }}
                  >
                    <View style={styles.listItemRank}>
                      <Text style={styles.listItemRankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemName} numberOfLines={1}>
                        {pharmacy.name}
                      </Text>
                      <Text style={styles.listItemAddress} numberOfLines={1}>
                        {pharmacy.address}
                      </Text>
                      <View style={styles.listItemDetails}>
                        {pharmacy.distance !== undefined && (
                          <Text style={styles.listItemDistance}>📍 {pharmacy.distance} km</Text>
                        )}
                        {pharmacy.rating && (
                          <Text style={styles.listItemRating}>⭐ {pharmacy.rating.toFixed(1)}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E88E5',
  },
  headerControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  closeIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeLine1: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2A4A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    zIndex: 100,
  },
  mapControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  myLocationIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCircleOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E88E5',
  },
  listIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listLine: {
    width: 16,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  calloutContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2A4A',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  calloutDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 4,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
  },
  calloutRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  selectedCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 200,
  },
  closeCardButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeCardText: {
    fontSize: 20,
    color: '#666',
  },
  cardContent: {
    paddingRight: 20,
  },
  cardTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardGenericBadge: {
    backgroundColor: '#E8F5E9',
  },
  cardPrivateBadge: {
    backgroundColor: '#E3F2FD',
  },
  cardTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2A4A',
    marginBottom: 6,
  },
  cardAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  cardDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9800',
    marginRight: 12,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  cardStar: {
    fontSize: 14,
  },
  cardRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  cardStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardOpenBadge: {
    backgroundColor: '#E8F5E9',
  },
  cardClosedBadge: {
    backgroundColor: '#FFEBEE',
  },
  cardStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cardActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardDirectionsButton: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardDirectionsText: {
    color: '#FFFFFF',
  },
  listView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 300,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E2A4A',
  },
  listCloseText: {
    fontSize: 24,
    color: '#666',
  },
  listScroll: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  listItemRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E88E5',
  },
  listItemContent: {
    flex: 1,
  },
  listItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E2A4A',
    marginBottom: 4,
  },
  listItemAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  listItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    marginRight: 12,
  },
  listItemRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});

export default NearbyPharmaciesMapModal;
