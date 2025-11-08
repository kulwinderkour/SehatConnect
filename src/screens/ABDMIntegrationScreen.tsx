import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { ArrowLeft, Activity, Shield, Link, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ModernDialog from '../components/common/ModernDialog';
import { useDialog } from '../hooks/useDialog';

const ABDMIntegrationScreen = () => {
  const navigation = useNavigation();
  const [abhaId, setAbhaId] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const { visible, dialogOptions, hideDialog, showSuccess, showError } = useDialog();

  const handleLinkAbha = () => {
    // ABDM integration logic here
    if (abhaId.trim()) {
      setIsLinked(true);
      showSuccess('Successfully Linked!', 'Your ABHA ID is now connected to SehatConnect');
    } else {
      showError('Invalid ABHA ID', 'Please enter a valid 14-digit ABHA ID');
    }
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
        <Text style={styles.headerTitle}>ABDM Integration</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Activity size={48} color="#5a9e31" strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>Ayushman Bharat Digital Mission</Text>
          <Text style={styles.heroSubtitle}>
            Link your ABHA (Ayushman Bharat Health Account) ID to access your complete health records across India
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits of Linking ABHA</Text>
          <View style={styles.benefitCard}>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color="#5a9e31" strokeWidth={2} />
              <Text style={styles.benefitText}>Access health records anytime, anywhere</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color="#5a9e31" strokeWidth={2} />
              <Text style={styles.benefitText}>Share records with doctors securely</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color="#5a9e31" strokeWidth={2} />
              <Text style={styles.benefitText}>Manage family health in one place</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color="#5a9e31" strokeWidth={2} />
              <Text style={styles.benefitText}>Government verified and secure</Text>
            </View>
          </View>
        </View>

        {/* Link ABHA Section */}
        {!isLinked ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link Your ABHA ID</Text>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>ABHA ID / Health ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your 14-digit ABHA ID"
                placeholderTextColor="#999"
                value={abhaId}
                onChangeText={setAbhaId}
                keyboardType="numeric"
                maxLength={14}
              />
              <Text style={styles.inputHint}>
                Don't have ABHA ID? <Text style={styles.linkText}>Create Now</Text>
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.linkButton, !abhaId.trim() && styles.linkButtonDisabled]}
              onPress={handleLinkAbha}
              activeOpacity={0.8}
              disabled={!abhaId.trim()}
            >
              <Link size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.linkButtonText}>Link ABHA Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.successCard}>
              <CheckCircle2 size={48} color="#5a9e31" strokeWidth={2} />
              <Text style={styles.successTitle}>Successfully Linked!</Text>
              <Text style={styles.successSubtitle}>
                Your ABHA ID is now connected to SehatConnect
              </Text>
              <View style={styles.linkedIdContainer}>
                <Text style={styles.linkedIdLabel}>ABHA ID:</Text>
                <Text style={styles.linkedId}>{abhaId}</Text>
              </View>
              <TouchableOpacity 
                style={styles.unlinkButton}
                onPress={() => setIsLinked(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.unlinkButtonText}>Unlink Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Notice */}
        <View style={styles.securityCard}>
          <Shield size={24} color="#1976d2" strokeWidth={2} />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Your Data is Secure</Text>
            <Text style={styles.securityText}>
              We follow strict security protocols and comply with government health data standards
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modern Dialog */}
      <ModernDialog
        visible={visible}
        title={dialogOptions.title}
        message={dialogOptions.message}
        type={dialogOptions.type}
        buttons={dialogOptions.buttons}
        onClose={hideDialog}
        showCloseButton={dialogOptions.showCloseButton}
      />
    </View>
  );
};

export default ABDMIntegrationScreen;

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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  benefitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 13,
    color: '#666',
  },
  linkText: {
    color: '#5a9e31',
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: '#5a9e31',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#5a9e31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  linkButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  linkedIdContainer: {
    backgroundColor: '#f0f7ed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  linkedIdLabel: {
    fontSize: 12,
    color: '#5a9e31',
    fontWeight: '600',
    marginBottom: 4,
  },
  linkedId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  unlinkButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  unlinkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  securityCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
});
