import React, { useState, useMemo, memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import DoctorCard from './DoctorCard';
import { Doctor } from '../../types/health';
import { optimizedFlatListProps, getOptimizedBatchSize, getOptimizedWindowSize } from '../../utils/performanceUtils';

interface DoctorListProps {
  doctors: Doctor[];
  onDoctorPress: (doctor: Doctor) => void;
  onConsultPress: (doctor: Doctor) => void;
  loading?: boolean;
  showFilters?: boolean;
  variant?: 'default' | 'horizontal' | 'grid';
  title?: string;
  onSeeAllPress?: () => void;
  showInternalMoreButton?: boolean;
}

const DoctorList: React.FC<DoctorListProps> = memo(({
  doctors,
  onDoctorPress,
  onConsultPress,
  loading = false,
  showFilters = false,
  variant = 'default',
  title,
  onSeeAllPress,
  showInternalMoreButton = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    const uniqueSpecialties = [...new Set(doctors.map(doctor => doctor.specialty))];
    return uniqueSpecialties.sort();
  }, [doctors]);

  // Filter and search doctors
  const filteredDoctors = useMemo(() => {
    let filtered = doctors;
    
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
  }, [doctors, searchQuery, selectedSpecialty]);

  const renderDoctor = useCallback(({ item }: { item: Doctor }) => (
    <DoctorCard
      doctor={item}
      onPress={onDoctorPress}
      onConsultPress={onConsultPress}
      variant={variant === 'grid' ? 'compact' : 'default'}
    />
  ), [onDoctorPress, onConsultPress, variant]);

  const renderHorizontalDoctor = useCallback(({ item }: { item: Doctor }) => (
    <DoctorCard
      doctor={item}
      onPress={onDoctorPress}
      onConsultPress={onConsultPress}
      variant="compact"
    />
  ), [onDoctorPress, onConsultPress]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {onSeeAllPress && (
            <TouchableOpacity onPress={onSeeAllPress}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          
          <View style={styles.specialtyFilter}>
            <Text style={styles.filterLabel}>Specialty:</Text>
            <View style={styles.specialtyButtons}>
              <TouchableOpacity
                style={[
                  styles.specialtyButton,
                  !selectedSpecialty && styles.specialtyButtonActive
                ]}
                onPress={() => setSelectedSpecialty('')}
              >
                <Text style={[
                  styles.specialtyButtonText,
                  !selectedSpecialty && styles.specialtyButtonTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {specialties.map(specialty => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.specialtyButton,
                    selectedSpecialty === specialty && styles.specialtyButtonActive
                  ]}
                  onPress={() => setSelectedSpecialty(specialty)}
                >
                  <Text style={[
                    styles.specialtyButtonText,
                    selectedSpecialty === specialty && styles.specialtyButtonTextActive
                  ]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  ), [title, onSeeAllPress, showFilters, searchQuery, selectedSpecialty, specialties]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No doctors found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || selectedSpecialty 
          ? 'Try adjusting your search or filters'
          : 'No doctors are available at the moment'
        }
      </Text>
    </View>
  ), [searchQuery, selectedSpecialty]);

  if (variant === 'horizontal') {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={filteredDoctors}
          renderItem={renderHorizontalDoctor}
          keyExtractor={(item) => `doctor-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ListEmptyComponent={renderEmptyState}
          key="horizontal-flatlist"
          {...optimizedFlatListProps}
          maxToRenderPerBatch={getOptimizedBatchSize()}
          windowSize={getOptimizedWindowSize()}
          initialNumToRender={3}
          getItemLayout={(data, index) => ({
            length: 160,
            offset: 160 * index,
            index,
          })}
        />
      </View>
    );
  }

  if (variant === 'grid') {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => `doctor-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridList}
          ListEmptyComponent={renderEmptyState}
          key="grid-flatlist"
          {...optimizedFlatListProps}
          maxToRenderPerBatch={getOptimizedBatchSize()}
          windowSize={getOptimizedWindowSize()}
          initialNumToRender={4}
        />
      </View>
    );
  }

  // Default vertical list - show limited doctors initially
  const doctorsToShow = showInternalMoreButton 
    ? (showAllDoctors ? filteredDoctors : filteredDoctors.slice(0, 2))
    : filteredDoctors;
  
  return (
    <View style={styles.container}>
      {renderHeader()}
      {filteredDoctors.length > 0 ? (
        <View style={styles.verticalList}>
          {doctorsToShow.map((doctor) => (
            <View key={`doctor-${doctor.id}`} style={{ marginBottom: 4 }}>
              {renderDoctor({ item: doctor })}
            </View>
          ))}
          {showInternalMoreButton && !showAllDoctors && filteredDoctors.length > 2 && (
            <TouchableOpacity 
              style={styles.showMoreButton}
              onPress={() => setShowAllDoctors(true)}
            >
              <Text style={styles.showMoreText}>
                Show More Doctors ({filteredDoctors.length - 2} more)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        renderEmptyState()
      )}
    </View>
  );
});

DoctorList.displayName = 'DoctorList';

const styles = StyleSheet.create({
  container: {
    // Remove flex: 1 to allow proper scrolling
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9e31',
  },
  filtersContainer: {
    gap: 16,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specialtyFilter: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  specialtyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specialtyButtonActive: {
    backgroundColor: '#5a9e31',
    borderColor: '#5a9e31',
  },
  specialtyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  specialtyButtonTextActive: {
    color: '#fff',
  },
  horizontalList: {
    paddingRight: 20,
  },
  gridList: {
    paddingHorizontal: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  verticalList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  showMoreButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  showMoreText: {
    fontSize: 14,
    color: '#5a9e31',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
});

export default DoctorList;
