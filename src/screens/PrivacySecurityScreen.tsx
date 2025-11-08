import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch } from 'react-native';
import { ArrowLeft, Shield, Lock, Eye, Fingerprint, Bell, Share2, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const PrivacySecurityScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    biometricAuth: true,
    twoFactorAuth: false,
    shareHealthData: true,
    allowNotifications: true,
    shareLocation: false,
    autoLock: true,
  });

  const toggleSetting = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    settingKey, 
    showChevron = false 
  }: any) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          {icon}
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      {showChevron ? (
        <ChevronRight size={20} color="#999" strokeWidth={2} />
      ) : (
        <Switch
          value={settings[settingKey as keyof typeof settings] as boolean}
          onValueChange={() => toggleSetting(settingKey)}
          trackColor={{ false: '#ddd', true: '#5a9e31' }}
          thumbColor="#fff"
          ios_backgroundColor="#ddd"
        />
      )}
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconContainer}>
            <Shield size={32} color="#5a9e31" strokeWidth={2} />
          </View>
          <Text style={styles.bannerTitle}>Your Privacy Matters</Text>
          <Text style={styles.bannerText}>
            We protect your health data with industry-standard encryption and security practices
          </Text>
        </View>

        {/* Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUTHENTICATION</Text>
          <View style={styles.card}>
            <SettingItem
              icon={<Fingerprint size={22} color="#5a9e31" strokeWidth={2} />}
              title="Biometric Authentication"
              description="Use fingerprint or face ID to unlock"
              settingKey="biometricAuth"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Lock size={22} color="#3b82f6" strokeWidth={2} />}
              title="Two-Factor Authentication"
              description="Add extra security layer"
              settingKey="twoFactorAuth"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Lock size={22} color="#8b5cf6" strokeWidth={2} />}
              title="Auto-Lock App"
              description="Lock app after inactivity"
              settingKey="autoLock"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY CONTROLS</Text>
          <View style={styles.card}>
            <SettingItem
              icon={<Share2 size={22} color="#10b981" strokeWidth={2} />}
              title="Share Health Data"
              description="Allow sharing with healthcare providers"
              settingKey="shareHealthData"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Bell size={22} color="#f59e0b" strokeWidth={2} />}
              title="Push Notifications"
              description="Receive health updates and reminders"
              settingKey="allowNotifications"
            />
            <View style={styles.divider} />
            <SettingItem
              icon={<Eye size={22} color="#ef4444" strokeWidth={2} />}
              title="Share Location"
              description="For nearby healthcare services"
              settingKey="shareLocation"
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Lock size={22} color="#64748b" strokeWidth={2} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Change Password</Text>
                  <Text style={styles.settingDescription}>Update your account password</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#999" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Share2 size={22} color="#64748b" strokeWidth={2} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Download My Data</Text>
                  <Text style={styles.settingDescription}>Get a copy of your health records</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#999" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Eye size={22} color="#64748b" strokeWidth={2} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Privacy Policy</Text>
                  <Text style={styles.settingDescription}>View our privacy policy</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#999" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER ZONE</Text>
          <TouchableOpacity style={styles.dangerCard} activeOpacity={0.8}>
            <Text style={styles.dangerCardTitle}>Delete My Account</Text>
            <Text style={styles.dangerCardText}>
              Permanently delete your account and all associated data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Compliance Info */}
        <View style={styles.complianceCard}>
          <Shield size={20} color="#1976d2" strokeWidth={2} />
          <Text style={styles.complianceText}>
            We comply with HIPAA, GDPR, and Indian healthcare data protection regulations
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacySecurityScreen;

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
  banner: {
    backgroundColor: '#f0f7ed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  bannerIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 50,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dangerCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 8,
  },
  dangerCardText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  complianceText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
    flex: 1,
  },
});
