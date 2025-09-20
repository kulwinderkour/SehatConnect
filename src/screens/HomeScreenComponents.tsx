import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './HomeScreen';

// Custom section header component
export function SectionHeader({
  title,
  actionText,
  onActionPress,
}: {
  title: string;
  actionText: string;
  onActionPress: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onActionPress}>
        <Text style={styles.sectionAction}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Custom service card component
export function NearbyServiceCard({ getText }: { getText: (key: string) => string }) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>
          Dr. Sharma {getText('statusAvailable')}
        </Text>
        <Text style={styles.serviceSubtitle}>
          {getText('specialtyGeneralMedicine')} • 2.5 km
        </Text>
        <View style={styles.serviceRating}>
          <Text style={styles.ratingDisplay}>⭐ 4.8</Text>
          <Text style={styles.ratingText}>• 15 {getText('statusMinAway')}</Text>
        </View>
      </View>
      <View style={styles.serviceStatus}>
        <View style={styles.availabilityIndicator} />
        <Text style={styles.availabilityText}>{getText('statusAvailable')}</Text>
      </View>
    </View>
  );
}
