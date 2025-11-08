import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft, Heart, Shield, Calendar, Phone, FileText, Plus, Edit2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface Insurance {
  id: string;
  provider: string;
  policyNumber: string;
  type: string;
  expiryDate: string;
  coverageAmount: string;
  status: 'Active' | 'Expired' | 'Pending';
}

const InsuranceInfoScreen = () => {
  const navigation = useNavigation();
  const [insurances, setInsurances] = useState<Insurance[]>([
    {
      id: '1',
      provider: 'HDFC ERGO Health Insurance',
      policyNumber: 'HDFC123456789',
      type: 'Family Health Insurance',
      expiryDate: '15 Dec 2025',
      coverageAmount: '₹10,00,000',
      status: 'Active',
    },
    {
      id: '2',
      provider: 'Ayushman Bharat PM-JAY',
      policyNumber: 'PMJAY987654321',
      type: 'Government Health Scheme',
      expiryDate: 'Lifetime',
      coverageAmount: '₹5,00,000',
      status: 'Active',
    },
  ]);

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Active': '#10b981',
      'Expired': '#ef4444',
      'Pending': '#f59e0b',
    };
    return colors[status] || '#64748b';
  };

  const handleAddInsurance = () => {
    console.log('Add insurance');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insurance Info</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddInsurance}
          activeOpacity={0.7}
        >
          <Plus size={24} color="#5a9e31" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Heart size={20} color="#ef4444" strokeWidth={2} />
          <Text style={styles.infoBannerText}>
            Keep your insurance information updated for seamless claims
          </Text>
        </View>

        {/* Insurance Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR INSURANCE POLICIES ({insurances.length})</Text>
          {insurances.map((insurance, index) => (
            <View key={insurance.id} style={[styles.insuranceCard, index !== 0 && { marginTop: 16 }]}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.providerIconContainer}>
                  <Shield size={24} color="#fff" strokeWidth={2} />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{insurance.provider}</Text>
                  <Text style={styles.policyType}>{insurance.type}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(insurance.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(insurance.status) }]}>
                    {insurance.status}
                  </Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <FileText size={16} color="#666" strokeWidth={2} />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Policy Number</Text>
                      <Text style={styles.infoValue}>{insurance.policyNumber}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Calendar size={16} color="#666" strokeWidth={2} />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Expiry Date</Text>
                      <Text style={styles.infoValue}>{insurance.expiryDate}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.coverageContainer}>
                  <Text style={styles.coverageLabel}>Coverage Amount</Text>
                  <Text style={styles.coverageAmount}>{insurance.coverageAmount}</Text>
                </View>
              </View>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <Edit2 size={16} color="#5a9e31" strokeWidth={2} />
                  <Text style={styles.actionButtonText}>Edit Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <FileText size={16} color="#3b82f6" strokeWidth={2} />
                  <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>View Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add Insurance CTA */}
        <TouchableOpacity 
          style={styles.addInsuranceCTA}
          onPress={handleAddInsurance}
          activeOpacity={0.8}
        >
          <View style={styles.addInsuranceIconContainer}>
            <Plus size={28} color="#ef4444" strokeWidth={2} />
          </View>
          <Text style={styles.addInsuranceCTAText}>Add New Insurance Policy</Text>
          <Text style={styles.addInsuranceCTASubtext}>
            Add your health insurance for easy claim processing
          </Text>
        </TouchableOpacity>

        {/* Government Schemes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GOVERNMENT HEALTH SCHEMES</Text>
          <View style={styles.schemeCard}>
            <View style={styles.schemeIconContainer}>
              <Shield size={32} color="#5a9e31" strokeWidth={2} />
            </View>
            <Text style={styles.schemeTitle}>Ayushman Bharat PM-JAY</Text>
            <Text style={styles.schemeDescription}>
              Free health coverage up to ₹5 lakhs for eligible families
            </Text>
            <TouchableOpacity style={styles.schemeButton} activeOpacity={0.8}>
              <Text style={styles.schemeButtonText}>Check Eligibility</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InsuranceInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#ef4444',
    lineHeight: 20,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  insuranceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  providerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5a9e31',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  policyType: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  coverageContainer: {
    backgroundColor: '#f0f7ed',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  coverageLabel: {
    fontSize: 13,
    color: '#5a9e31',
    fontWeight: '600',
    marginBottom: 4,
  },
  coverageAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5a9e31',
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9e31',
  },
  addInsuranceCTA: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addInsuranceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addInsuranceCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 4,
  },
  addInsuranceCTASubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  schemeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  schemeIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  schemeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  schemeButton: {
    backgroundColor: '#5a9e31',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  schemeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
