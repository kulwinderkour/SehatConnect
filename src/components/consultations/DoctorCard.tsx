import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Doctor } from '../../types/health';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
  onConsultPress: (doctor: Doctor) => void;
  showConsultButton?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  actionLabel?: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onPress,
  onConsultPress,
  showConsultButton = true,
  variant = 'default',
  actionLabel,
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

  const formattedLanguages = doctor.languages?.join(', ');
  const hasExpertise = Array.isArray(doctor.expertise) && doctor.expertise.length > 0;
  const experienceLabel = doctor.experience ? `${doctor.experience} ${doctor.experience === 1 ? 'Year' : 'Years'} Experience` : undefined;
  const consultationLabel = doctor.consultationCount ? `${doctor.consultationCount.toLocaleString()} consultations` : undefined;
  const actionText = actionLabel || 'Consult';

  // Default variant redesigned for consultation screen
  return (
    <TouchableOpacity 
      style={styles.defaultCard} 
      onPress={() => onPress(doctor)}
      activeOpacity={0.8}
    >
      {(experienceLabel || consultationLabel) && (
        <View style={styles.metaBanner}>
          {experienceLabel && (
            <Text style={styles.metaText}>{experienceLabel}</Text>
          )}
          {consultationLabel && (
            <View style={styles.metaDivider} />
          )}
          {consultationLabel && (
            <Text style={styles.metaText}>{consultationLabel}</Text>
          )}
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarFallback}>
            <Text style={styles.emoji}>{doctor.emoji}</Text>
          </View>
          <View style={styles.badgeIconContainer}>
            <Text style={styles.badgeIcon}>💬</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          {formattedLanguages ? (
            <Text style={styles.languages} numberOfLines={1}>Languages: {formattedLanguages}</Text>
          ) : null}
          {doctor.qualifications?.length ? (
            <Text style={styles.qualifications} numberOfLines={1}>{doctor.qualifications.join(', ')}</Text>
          ) : null}
          {hasExpertise ? (
            <Text style={styles.expertise} numberOfLines={2}>
              Expertise in: <Text style={styles.expertiseHighlight}>{doctor.expertise?.join(', ')}</Text>
            </Text>
          ) : null}
        </View>
      </View>

      {showConsultButton && (
        <View style={styles.footerRow}>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => onConsultPress(doctor)}
            activeOpacity={0.9}
          >
            <Text style={styles.selectButtonText}>{actionText}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default card styles
  defaultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
    marginBottom: 8,
  },
  languages: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
  },
  qualifications: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  expertise: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  expertiseHighlight: {
    fontWeight: '600',
    color: '#0f172a',
  },
  footerRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#0f766e',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ecfeff',
    width: '100%',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '700',
  },
  avatarWrapper: {
    width: 72,
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  badgeIconContainer: {
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeIcon: {
    fontSize: 12,
  },
  metaBanner: {
    backgroundColor: '#e0f2fe',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#bae6fd',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  ratingStars: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  consultButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 14,
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
