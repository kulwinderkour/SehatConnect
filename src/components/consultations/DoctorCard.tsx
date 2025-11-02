import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Doctor } from '../../types/health';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
  onConsultPress: (doctor: Doctor) => void;
  showConsultButton?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onPress,
  onConsultPress,
  showConsultButton = true,
  variant = 'default'
}) => {
  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const getStatusColor = () => {
    if (doctor.isOnline) return '#5a9e31';
    if (doctor.availability.isAvailable) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusText = () => {
    if (doctor.isOnline) return 'Online Now';
    if (doctor.availability.isAvailable) return 'Available';
    return 'Offline';
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        style={styles.compactCard} 
        onPress={() => onPress(doctor)}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactAvatar}>
            <Text style={styles.compactEmoji}>{doctor.emoji}</Text>
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{doctor.name}</Text>
            <Text style={styles.compactSpecialty}>{doctor.specialty}</Text>
          </View>
          <View style={styles.compactStatus}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'detailed') {
    return (
      <TouchableOpacity 
        style={styles.detailedCard} 
        onPress={() => onPress(doctor)}
        activeOpacity={0.8}
      >
        <View style={styles.detailedHeader}>
          <View style={styles.detailedAvatar}>
            <Text style={styles.detailedEmoji}>{doctor.emoji}</Text>
          </View>
          <View style={styles.detailedInfo}>
            <Text style={styles.detailedName}>{doctor.name}</Text>
            <Text style={styles.detailedSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.detailedExperience}>{doctor.experience} years experience</Text>
            {doctor.hospital && (
              <Text style={styles.detailedHospital}>{doctor.hospital}</Text>
            )}
          </View>
          <View style={styles.detailedStatus}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        
        <View style={styles.detailedBody}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>{renderStars(doctor.rating)}</Text>
            <Text style={styles.ratingText}>{doctor.rating} ({doctor.reviewCount} reviews)</Text>
          </View>
          
          <View style={styles.feeContainer}>
            <Text style={styles.feeLabel}>Consultation Fee:</Text>
            <Text style={styles.feeAmount}>
              {doctor.consultationFee === 0 ? 'Free' : `₹${doctor.consultationFee}`}
            </Text>
          </View>
          
          {doctor.distance && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>📍 {doctor.distance} km away</Text>
            </View>
          )}
          
          {doctor.nextAvailableSlot && (
            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityText}>
                Next available: {doctor.nextAvailableSlot}
              </Text>
            </View>
          )}
        </View>
        
        {showConsultButton && (
          <TouchableOpacity 
            style={styles.consultButton}
            onPress={() => onConsultPress(doctor)}
            activeOpacity={0.9}
          >
            <Text style={styles.consultButtonText}>Consult Now</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity 
      style={styles.defaultCard} 
      onPress={() => onPress(doctor)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
          <View style={styles.avatar}>
            <Text style={styles.emoji}>{doctor.emoji}</Text>
          </View>
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{doctor.name}</Text>
          <Text style={styles.specialty} numberOfLines={1}>{doctor.specialty}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>{renderStars(doctor.rating)}</Text>
            <Text style={styles.ratingText} numberOfLines={1}>{doctor.rating} ({doctor.reviewCount} reviews)</Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          {showConsultButton && (
            <TouchableOpacity 
              style={styles.consultButton}
              onPress={() => onConsultPress(doctor)}
              activeOpacity={0.9}
            >
              <Text style={styles.consultButtonText}>Consult</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default card styles
  defaultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 100,
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 100,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
    color: '#fff',
  },
  info: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
  },
  specialty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  ratingStars: {
    fontSize: 14,
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  consultButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
    flexShrink: 0,
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Compact card styles
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  compactContent: {
    alignItems: 'center',
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  compactEmoji: {
    fontSize: 20,
  },
  compactInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  compactSpecialty: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  compactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Detailed card styles
  detailedCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailedAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailedEmoji: {
    fontSize: 36,
    color: '#fff',
  },
  detailedInfo: {
    flex: 1,
  },
  detailedName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  detailedSpecialty: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailedExperience: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detailedHospital: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  detailedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedBody: {
    marginBottom: 16,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  distanceContainer: {
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  availabilityContainer: {
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default DoctorCard;
