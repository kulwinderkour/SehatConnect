import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { ArrowLeft, Heart, Users, Award, Shield, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const AboutAppScreen = () => {
  const navigation = useNavigation();

  const FeatureItem = ({ icon, title, description }: any) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>About SehatConnect</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appLogoContainer}>
            <Heart size={48} color="#5a9e31" strokeWidth={2} fill="#5a9e31" />
          </View>
          <Text style={styles.appName}>SehatConnect</Text>
          <Text style={styles.appTagline}>Your Digital Health Companion</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OUR MISSION</Text>
          <View style={styles.card}>
            <Text style={styles.missionText}>
              SehatConnect aims to revolutionize healthcare delivery in India by providing accessible, 
              affordable, and quality healthcare services to everyone, everywhere. We bridge the gap 
              between patients and healthcare providers through cutting-edge technology.
            </Text>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KEY FEATURES</Text>
          <View style={styles.card}>
            <FeatureItem
              icon={<CheckCircle size={24} color="#5a9e31" strokeWidth={2} />}
              title="Video Consultations"
              description="Connect with doctors from anywhere"
            />
            <View style={styles.divider} />
            <FeatureItem
              icon={<CheckCircle size={24} color="#5a9e31" strokeWidth={2} />}
              title="Digital Health Records"
              description="Access your medical history anytime"
            />
            <View style={styles.divider} />
            <FeatureItem
              icon={<CheckCircle size={24} color="#5a9e31" strokeWidth={2} />}
              title="Nearby Pharmacies"
              description="Find medicines and healthcare products"
            />
            <View style={styles.divider} />
            <FeatureItem
              icon={<CheckCircle size={24} color="#5a9e31" strokeWidth={2} />}
              title="ABDM Integration"
              description="Linked with Ayushman Bharat Digital Mission"
            />
            <View style={styles.divider} />
            <FeatureItem
              icon={<CheckCircle size={24} color="#5a9e31" strokeWidth={2} />}
              title="Multi-language Support"
              description="Available in Hindi, English, and Punjabi"
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OUR IMPACT</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Users size={32} color="#5a9e31" strokeWidth={2} />
              <Text style={styles.statNumber}>100K+</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statCard}>
              <Heart size={32} color="#ef4444" strokeWidth={2} />
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Doctors</Text>
            </View>
            <View style={styles.statCard}>
              <Award size={32} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
          </View>
        </View>

        {/* Government Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GOVERNMENT PARTNERSHIPS</Text>
          <View style={styles.govCard}>
            <Shield size={32} color="#5a9e31" strokeWidth={2} />
            <Text style={styles.govCardTitle}>Integrated with National Health Programs</Text>
            <View style={styles.govList}>
              <Text style={styles.govItem}>• Ayushman Bharat Digital Mission (ABDM)</Text>
              <Text style={styles.govItem}>• National Health Portal</Text>
              <Text style={styles.govItem}>• PM-JAY (Ayushman Bharat)</Text>
              <Text style={styles.govItem}>• e-Sanjeevani Platform</Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVELOPED BY</Text>
          <View style={styles.card}>
            <Text style={styles.creditsText}>
              SehatConnect is developed as part of Smart India Hackathon 2024
            </Text>
            <Text style={styles.creditsSubtext}>
              Ministry of Health & Family Welfare{'\n'}
              Government of India
            </Text>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.legalSection}>
          <TouchableOpacity style={styles.legalLink} activeOpacity={0.7}>
            <Text style={styles.legalLinkText}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity style={styles.legalLink} activeOpacity={0.7}>
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity style={styles.legalLink} activeOpacity={0.7}>
            <Text style={styles.legalLinkText}>Licenses</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2024 SehatConnect. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
};

export default AboutAppScreen;

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
  appInfoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  appLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  versionBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976d2',
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  missionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    textAlign: 'justify',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  govCard: {
    backgroundColor: '#f0f7ed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  govCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  govList: {
    alignSelf: 'stretch',
  },
  govItem: {
    fontSize: 14,
    color: '#5a9e31',
    marginBottom: 8,
    lineHeight: 20,
  },
  creditsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  creditsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  legalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  legalLink: {
    paddingHorizontal: 8,
  },
  legalLinkText: {
    fontSize: 13,
    color: '#5a9e31',
    fontWeight: '500',
  },
  legalDivider: {
    fontSize: 13,
    color: '#999',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
