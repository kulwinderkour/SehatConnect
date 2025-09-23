import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { 
  FileText, 
  Pill, 
  Calendar, 
  MapPin, 
  CheckCircle,
  Clock,
  User,
  Download
} from 'lucide-react-native';
import { PostEmergencySupport as PostEmergencySupportType } from '../../types/emergency';

interface PostEmergencySupportProps {
  support: PostEmergencySupportType;
  onClose: () => void;
}

const PostEmergencySupport: React.FC<PostEmergencySupportProps> = ({
  support,
  onClose,
}) => {

  const handleDownloadReport = () => {
    Alert.alert(
      'Download Report',
      'Emergency incident report will be saved to your health records.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => console.log('Downloading report...') }
      ]
    );
  };

  const handleBookConsultation = () => {
    Alert.alert(
      'Book Follow-up',
      `Book a ${support.followUpConsultation.specialty} consultation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => console.log('Booking consultation...') }
      ]
    );
  };

  const handleFindPharmacy = (medicine: any) => {
    Alert.alert(
      'Find Pharmacy',
      `Locate nearest pharmacy with ${medicine.name} in stock?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Find', onPress: () => console.log('Finding pharmacy...') }
      ]
    );
  };

  const renderMedicineCard = (medicine: any, index: number) => (
    <View key={index} style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineIcon}>
          <Pill size={20} color="#3b82f6" />
        </View>
        <View style={styles.medicineContent}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
        </View>
        <View style={[
          styles.availabilityBadge,
          { backgroundColor: getAvailabilityColor(medicine.availability) }
        ]}>
          <Text style={styles.availabilityText}>
            {medicine.availability.charAt(0).toUpperCase() + medicine.availability.slice(1)}
          </Text>
        </View>
      </View>
      
      {medicine.nearestPharmacy && (
        <View style={styles.pharmacyInfo}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.pharmacyText}>{medicine.nearestPharmacy}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.findPharmacyButton}
        onPress={() => handleFindPharmacy(medicine)}
      >
        <Text style={styles.findPharmacyText}>Find Nearby Pharmacy</Text>
      </TouchableOpacity>
    </View>
  );

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return '#dcfce7';
      case 'limited': return '#fef3c7';
      case 'unavailable': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return '#ef4444';
      case 'within_24h': return '#f59e0b';
      case 'within_week': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Post-Emergency Support</Text>
        <Text style={styles.subtitle}>
          Your emergency response is complete. Here's your follow-up care plan.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Incident Report Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <FileText size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Incident Report</Text>
          </View>
          
          <View style={styles.reportContent}>
            <Text style={styles.reportSummary}>{support.incidentReport.summary}</Text>
            
            <View style={styles.reportDetails}>
              <Text style={styles.reportLabel}>Actions Taken:</Text>
              {support.incidentReport.actions_taken.map((action, index) => (
                <View key={index} style={styles.actionItem}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.actionText}>{action}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.reportMeta}>
              <Text style={styles.reportOutcome}>
                Outcome: {support.incidentReport.outcome}
              </Text>
              <Text style={styles.reportTime}>
                Completed: {new Date(support.incidentReport.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadReport}
          >
            <Download size={16} color="#3b82f6" />
            <Text style={styles.downloadButtonText}>Save to Health Records</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Medicines */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Pill size={24} color="#059669" />
            <Text style={styles.sectionTitle}>Recommended Medicines</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Based on your emergency, these medicines are recommended and their availability at nearby pharmacies:
          </Text>
          
          <View style={styles.medicinesContainer}>
            {support.recommendedMedicines.map((medicine, index) => 
              renderMedicineCard(medicine, index)
            )}
          </View>
        </View>

        {/* Follow-up Consultation */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Follow-up Consultation</Text>
          </View>
          
          <View style={styles.consultationContent}>
            <View style={styles.consultationDetail}>
              <User size={16} color="#6b7280" />
              <Text style={styles.consultationText}>
                Specialty: {support.followUpConsultation.specialty}
              </Text>
            </View>
            
            <View style={styles.consultationDetail}>
              <Clock size={16} color="#6b7280" />
              <Text style={[
                styles.consultationText,
                { color: getUrgencyColor(support.followUpConsultation.urgency) }
              ]}>
                Urgency: {support.followUpConsultation.urgency.replace('_', ' ')}
              </Text>
            </View>
            
            <Text style={styles.availableDoctorsText}>
              {support.followUpConsultation.availableDoctors.length} specialists available
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.bookConsultationButton}
            onPress={handleBookConsultation}
          >
            <Calendar size={16} color="#fff" />
            <Text style={styles.bookConsultationText}>Book Follow-up Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts & Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Additional Help?</Text>
          <Text style={styles.supportText}>
            Your emergency contacts have been notified of the incident resolution. 
            If you need additional support or have concerns about your recovery, 
            please don't hesitate to reach out.
          </Text>
          
          <View style={styles.supportActions}>
            <TouchableOpacity style={styles.supportButton}>
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportButton}>
              <Text style={styles.supportButtonText}>Emergency Helpline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Complete Emergency Response</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          All information has been saved to your health profile
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#059669',
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  reportContent: {
    marginBottom: 16,
  },
  reportSummary: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 22,
  },
  reportDetails: {
    marginBottom: 16,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
  },
  reportMeta: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  reportOutcome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  medicinesContainer: {
    gap: 12,
  },
  medicineCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicineContent: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  medicineDosage: {
    fontSize: 14,
    color: '#6b7280',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  pharmacyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  findPharmacyButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  findPharmacyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4338ca',
  },
  consultationContent: {
    marginBottom: 16,
  },
  consultationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  consultationText: {
    fontSize: 14,
    color: '#374151',
  },
  availableDoctorsText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  bookConsultationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  bookConsultationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  supportCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  closeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default PostEmergencySupport;