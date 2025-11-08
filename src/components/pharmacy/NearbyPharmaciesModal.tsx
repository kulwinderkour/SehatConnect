import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import PharmacyLocationService, { PharmacyStore, UserLocation } from '../../services/PharmacyLocationService';

const { width } = Dimensions.get('window');

interface NearbyPharmaciesModalProps {
  visible: boolean;
  onClose: () => void;
}

// Map Pin Icon Component
const MapPinIcon = () => (
  <View style={styles.mapPinContainer}>
    <View style={styles.mapPinOuter}>
      <View style={styles.mapPinInner} />
    </View>
    <View style={styles.mapPinPoint} />
  </View>
);

// Phone Icon Component
const PhoneIcon = () => (
  <View style={styles.phoneIconContainer}>
    <View style={styles.phoneBody}>
      <View style={styles.phoneSpeaker} />
    </View>
    <View style={styles.phoneHandle} />
  </View>
);

// Direction Icon Component
const DirectionIcon = () => (
  <View style={styles.directionIconContainer}>
    <View style={styles.directionCircle}>
      <View style={styles.directionArrow} />
      <View style={styles.directionArrowHead} />
    </View>
  </View>
);

// Generic Medicine Icon Component
const GenericMedicineIcon = () => (
  <View style={styles.genericIconContainer}>
    <View style={styles.genericPill}>
      <View style={styles.genericPillHalf} />
    </View>
    <Text style={styles.genericBadgeText}>₹</Text>
  </View>
);

// Private Pharmacy Icon Component
const PrivatePharmacyIcon = () => (
  <View style={styles.privateIconContainer}>
    <View style={styles.privateCross} />
    <View style={styles.privateCrossVertical} />
  </View>
);

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const stars = Math.floor(rating);
  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={styles.star}>
          {star <= stars ? '★' : '☆'}
        </Text>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
};

const NearbyPharmaciesModal: React.FC<NearbyPharmaciesModalProps> = ({
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyStore[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'generic' | 'private'>('all');
  const [selectedRadius, setSelectedRadius] = useState(5); // in km

  useEffect(() => {
    if (visible) {
      loadNearbyPharmacies();
    }
  }, [visible, filterType, selectedRadius]);

  const loadNearbyPharmacies = async () => {
    setLoading(true);
    try {
      // Get user's current location (will request permission if needed)
      const location = await PharmacyLocationService.getCurrentLocation();
      
      if (location) {
        setUserLocation(location);
        
        // Get nearby pharmacies
        const nearby = await PharmacyLocationService.getNearbyPharmacies(
          location,
          selectedRadius,
          filterType === 'all' ? undefined : filterType
        );
        
        setPharmacies(nearby);
      } else {
        // This shouldn't happen now as we always return a default location
        Alert.alert(
          'Location Unavailable', 
          'Using default location (Jalandhar, Punjab). For accurate results, please enable location permissions.'
        );
        // Set a default location
        const defaultLocation = {
          latitude: 31.3260,
          longitude: 75.5762,
          address: 'Jalandhar, Punjab, India (Default)'
        };
        setUserLocation(defaultLocation);
        
        const nearby = await PharmacyLocationService.getNearbyPharmacies(
          defaultLocation,
          selectedRadius,
          filterType === 'all' ? undefined : filterType
        );
        setPharmacies(nearby);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      Alert.alert('Error', 'Failed to load nearby pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = (pharmacy: PharmacyStore) => {
    PharmacyLocationService.openInMaps(pharmacy);
  };

  const handleCall = (pharmacy: PharmacyStore) => {
    if (pharmacy.phone) {
      PharmacyLocationService.callPharmacy(pharmacy);
    } else {
      Alert.alert('Info', 'Phone number not available for this pharmacy');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Nearby Pharmacies</Text>
              {userLocation && (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  📍 {userLocation.address || 'Current Location'}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType('all')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  All Stores
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === 'generic' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType('generic')}
              >
                <GenericMedicineIcon />
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'generic' && styles.filterButtonTextActive,
                  ]}
                >
                  Generic Medicine
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === 'private' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType('private')}
              >
                <PrivatePharmacyIcon />
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'private' && styles.filterButtonTextActive,
                  ]}
                >
                  Private Stores
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Radius Selector */}
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Search Radius:</Text>
            <View style={styles.radiusButtons}>
              {[2, 5, 10, 20].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    selectedRadius === radius && styles.radiusButtonActive,
                  ]}
                  onPress={() => setSelectedRadius(radius)}
                >
                  <Text
                    style={[
                      styles.radiusButtonText,
                      selectedRadius === radius && styles.radiusButtonTextActive,
                    ]}
                  >
                    {radius} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pharmacy List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E88E5" />
              <Text style={styles.loadingText}>Finding nearby pharmacies...</Text>
            </View>
          ) : (
            <ScrollView style={styles.pharmacyList} showsVerticalScrollIndicator={false}>
              {pharmacies.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No pharmacies found within {selectedRadius} km
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Try increasing the search radius
                  </Text>
                </View>
              ) : (
                pharmacies.map((pharmacy, index) => (
                  <View key={pharmacy.id} style={styles.pharmacyCard}>
                    {/* Pharmacy Type Badge */}
                    <View
                      style={[
                        styles.typeBadge,
                        pharmacy.type === 'generic'
                          ? styles.genericBadge
                          : styles.privateBadge,
                      ]}
                    >
                      {pharmacy.type === 'generic' ? (
                        <GenericMedicineIcon />
                      ) : (
                        <PrivatePharmacyIcon />
                      )}
                      <Text style={styles.typeBadgeText}>
                        {pharmacy.type === 'generic' ? 'Generic' : 'Private'}
                      </Text>
                    </View>

                    {/* Pharmacy Info */}
                    <View style={styles.pharmacyInfo}>
                      <View style={styles.pharmacyHeader}>
                        <Text style={styles.pharmacyRank}>#{index + 1}</Text>
                        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                      </View>

                      <View style={styles.pharmacyDetails}>
                        <View style={styles.detailRow}>
                          <MapPinIcon />
                          <Text style={styles.detailText} numberOfLines={2}>
                            {pharmacy.address}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.distanceText}>
                            📍 {pharmacy.distance} km away
                          </Text>
                          {pharmacy.isOpen !== undefined && (
                            <View
                              style={[
                                styles.statusBadge,
                                pharmacy.isOpen
                                  ? styles.openBadge
                                  : styles.closedBadge,
                              ]}
                            >
                              <Text style={styles.statusText}>
                                {pharmacy.isOpen ? '● Open' : '● Closed'}
                              </Text>
                            </View>
                          )}
                        </View>

                        {pharmacy.openingHours && (
                          <Text style={styles.hoursText}>
                            ⏰ {pharmacy.openingHours}
                          </Text>
                        )}

                        {pharmacy.rating && (
                          <StarRating rating={pharmacy.rating} />
                        )}
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleCall(pharmacy)}
                        >
                          <PhoneIcon />
                          <Text style={styles.actionButtonText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.directionButton]}
                          onPress={() => handleDirections(pharmacy)}
                        >
                          <DirectionIcon />
                          <Text style={[styles.actionButtonText, styles.directionButtonText]}>
                            Directions
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E2A4A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    maxWidth: width - 100,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1E88E5',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  radiusButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  radiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  radiusButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  radiusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  radiusButtonTextActive: {
    color: '#1E88E5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  pharmacyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  genericBadge: {
    backgroundColor: '#E8F5E9',
  },
  privateBadge: {
    backgroundColor: '#E3F2FD',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    color: '#333',
  },
  pharmacyInfo: {
    padding: 16,
    paddingTop: 8,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pharmacyRank: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E88E5',
    marginRight: 8,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2A4A',
    flex: 1,
  },
  pharmacyDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9800',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openBadge: {
    backgroundColor: '#E8F5E9',
  },
  closedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  hoursText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    color: '#FFC107',
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  directionButton: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  directionButtonText: {
    color: '#FFFFFF',
  },
  // Icon Styles
  mapPinContainer: {
    width: 16,
    height: 16,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  mapPinOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPinInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  mapPinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF5252',
    marginTop: -2,
  },
  phoneIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneBody: {
    width: 12,
    height: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 2,
  },
  phoneSpeaker: {
    width: 6,
    height: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 0.5,
  },
  phoneHandle: {
    position: 'absolute',
    bottom: 2,
    width: 8,
    height: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
  },
  directionIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  directionArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '0deg' }],
  },
  directionArrowHead: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  genericIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  genericPill: {
    width: 14,
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    overflow: 'hidden',
  },
  genericPillHalf: {
    width: 7,
    height: 8,
    backgroundColor: '#81C784',
  },
  genericBadgeText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privateIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  privateCross: {
    width: 10,
    height: 2,
    backgroundColor: '#2196F3',
    borderRadius: 1,
  },
  privateCrossVertical: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#2196F3',
    borderRadius: 1,
  },
});

export default NearbyPharmaciesModal;
