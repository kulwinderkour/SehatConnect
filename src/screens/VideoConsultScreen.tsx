import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Header from '../components/common/Header';
import DoctorCard from '../components/consultations/DoctorCard';
import { Doctor } from '../types/health';
import { ConsultStackParamList } from '../types/navigation';
import { useI18n } from '../i18n';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');

// Video consultation screen component
export default function VideoConsultScreen() {
  const navigation = useNavigation<StackNavigationProp<ConsultStackParamList>>();
  const { getText } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  // Mock data for available doctors - in real app this would come from API
  const availableDoctors: Doctor[] = useMemo(() => [
    { 
      id: "1",
      name: "Dr. Rajesh Sharma", 
      specialty: "General Medicine", 
      rating: 4.8,
      reviewCount: 127,
      experience: 12,
      consultationFee: 500,
      languages: ['English', 'Hindi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '2:00 PM',
        workingHours: { start: '09:00', end: '18:00' },
        workingDays: [1, 2, 3, 4, 5, 6],
        timeSlots: []
      },
      emoji: "👨‍⚕️",
      isOnline: true,
      nextAvailableSlot: "Available Now",
      hospital: "Apollo Hospital",
      distance: 2.5,
      qualifications: ['MBBS', 'MD General Medicine']
    },
    { 
      id: "2",
      name: "Dr. Priya Kaur", 
      specialty: "Pediatrics", 
      rating: 4.9,
      reviewCount: 89,
      experience: 8,
      consultationFee: 600,
      languages: ['English', 'Hindi', 'Punjabi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '3:30 PM',
        workingHours: { start: '10:00', end: '19:00' },
        workingDays: [1, 2, 3, 4, 5, 6],
        timeSlots: []
      },
      emoji: "👩‍⚕️",
      isOnline: true,
      nextAvailableSlot: "Available Now",
      hospital: "Fortis Hospital",
      distance: 1.8,
      qualifications: ['MBBS', 'MD Pediatrics']
    },
    { 
      id: "3",
      name: "Dr. Amit Singh", 
      specialty: "Cardiology", 
      rating: 4.7,
      reviewCount: 156,
      experience: 15,
      consultationFee: 800,
      languages: ['English', 'Hindi'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '4:00 PM',
        workingHours: { start: '09:00', end: '17:00' },
        workingDays: [1, 2, 3, 4, 5],
        timeSlots: []
      },
      emoji: "👨‍⚕️",
      isOnline: true,
      nextAvailableSlot: "Available Now",
      hospital: "Max Hospital",
      distance: 3.2,
      qualifications: ['MBBS', 'MD Cardiology', 'DM Cardiology']
    },
    { 
      id: "4",
      name: "Dr. Neha Gupta", 
      specialty: "Dermatology", 
      rating: 4.6,
      reviewCount: 98,
      experience: 10,
      consultationFee: 700,
      languages: ['English', 'Hindi'],
      availability: {
        isAvailable: false,
        nextAvailableTime: '10:00 AM',
        workingHours: { start: '09:00', end: '18:00' },
        workingDays: [1, 2, 3, 4, 5, 6],
        timeSlots: []
      },
      emoji: "👩‍⚕️",
      isOnline: false,
      nextAvailableSlot: "Tomorrow 10:00 AM",
      hospital: "AIIMS",
      distance: 4.1,
      qualifications: ['MBBS', 'MD Dermatology']
    },
    { 
      id: "5",
      name: "Dr. Vikram Patel", 
      specialty: "Orthopedics", 
      rating: 4.5,
      reviewCount: 134,
      experience: 14,
      consultationFee: 750,
      languages: ['English', 'Hindi', 'Gujarati'],
      availability: {
        isAvailable: true,
        nextAvailableTime: '5:00 PM',
        workingHours: { start: '08:00', end: '20:00' },
        workingDays: [1, 2, 3, 4, 5, 6],
        timeSlots: []
      },
      emoji: "👨‍⚕️",
      isOnline: true,
      nextAvailableSlot: "Available Now",
      hospital: "Medanta Hospital",
      distance: 2.8,
      qualifications: ['MBBS', 'MS Orthopedics']
    }
  ], []);

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    const uniqueSpecialties = [...new Set(availableDoctors.map(doctor => doctor.specialty))];
    return uniqueSpecialties.sort();
  }, [availableDoctors]);

  // Filter and search doctors
  const filteredDoctors = useMemo(() => {
    let filtered = availableDoctors;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        (doctor.hospital && doctor.hospital.toLowerCase().includes(query))
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    return filtered;
  }, [availableDoctors, searchQuery, selectedSpecialty]);

  // Handle doctor selection for video consultation
  const handleDoctorSelect = useCallback((doctor: Doctor) => {
    if (!doctor.availability.isAvailable) {
      Alert.alert(
        'Doctor Not Available',
        `${doctor.name} is not available right now. Next available slot: ${doctor.nextAvailableSlot}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to video call screen
    navigation.navigate('VideoCall', { doctor });
  }, [navigation]);

  // Handle doctor press for more details
  const handleDoctorPress = useCallback((doctor: Doctor) => {
    Alert.alert(
      'Doctor Details',
      `${doctor.name}\n${doctor.specialty}\n${doctor.hospital}\nRating: ${doctor.rating} ⭐\nExperience: ${doctor.experience} years\nConsultation Fee: ₹${doctor.consultationFee}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Video Call', 
          onPress: () => handleDoctorSelect(doctor)
        }
      ]
    );
  }, [handleDoctorSelect]);

  // Custom filter chip component
  const FilterChip = ({ 
    label, 
    isSelected, 
    onPress 
  }: { 
    label: string; 
    isSelected: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && styles.filterChipSelected
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        isSelected && styles.filterChipTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Custom doctor card wrapper for video consultation
  const VideoConsultDoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <View style={styles.doctorCardWrapper}>
      <DoctorCard
        doctor={doctor}
        onPress={handleDoctorPress}
        onConsultPress={handleDoctorSelect}
        variant="default"
      />
      <View style={styles.availabilityBadge}>
        <View style={[
          styles.availabilityDot,
          { backgroundColor: doctor.availability.isAvailable ? '#5a9e31' : '#f59e0b' }
        ]} />
        <Text style={styles.availabilityText}>
          {doctor.availability.isAvailable ? 'Available Now' : doctor.nextAvailableSlot}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Video Consultation</Text>
          <Text style={styles.subtitle}>
            Choose a doctor for your video consultation
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors by name, specialty, or hospital..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Specialty Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Specialty</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <FilterChip
              label="All"
              isSelected={!selectedSpecialty}
              onPress={() => setSelectedSpecialty('')}
            />
            {specialties.map(specialty => (
              <FilterChip
                key={specialty}
                label={specialty}
                isSelected={selectedSpecialty === specialty}
                onPress={() => setSelectedSpecialty(specialty)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Available Doctors Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available
          </Text>
          <Text style={styles.resultsSubtext}>
            {filteredDoctors.filter(d => d.availability.isAvailable).length} online now
          </Text>
        </View>

        {/* Doctors List */}
        <View style={styles.doctorsList}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <VideoConsultDoctorCard
                key={doctor.id}
                doctor={doctor}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No doctors found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery || selectedSpecialty 
                  ? 'Try adjusting your search or filters'
                  : 'No doctors are available at the moment'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>
            • Ensure you have a stable internet connection
          </Text>
          <Text style={styles.tipText}>
            • Find a quiet, well-lit place for your consultation
          </Text>
          <Text style={styles.tipText}>
            • Have your medical records ready if needed
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filtersSection: {
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filtersContainer: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#5a9e31',
    borderColor: '#5a9e31',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  resultsSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  doctorsList: {
    marginBottom: 24,
  },
  doctorCardWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
});
