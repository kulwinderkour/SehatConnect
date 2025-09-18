import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Header from '../../components/common/Header';
import { useAuth } from '../../contexts/AuthContext';

export default function DoctorProfileScreen() {
  const { user, logout } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Opening profile editor...');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Opening password change form...');
  };

  const handleAvailability = () => {
    Alert.alert('Availability', 'Managing availability settings...');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Managing notification preferences...');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contacting support team...');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Logged Out', 'You have been successfully logged out.');
          }
        }
      ]
    );
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.shortName?.charAt(0) || 'D'}
            </Text>
          </View>
          <Text style={styles.doctorName}>{user?.fullName}</Text>
          <Text style={styles.doctorSpecialty}>{user?.specialty}</Text>
          <Text style={styles.doctorHospital}>{user?.hospital}</Text>
          <Text style={styles.doctorExperience}>{user?.experience} years experience</Text>
        </View>

        {/* Professional Information */}
        <ProfileSection title="Professional Information">
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Specialty</Text>
              <Text style={styles.infoValue}>{user?.specialty || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hospital</Text>
              <Text style={styles.infoValue}>{user?.hospital || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{user?.experience || 0} years</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Doctor ID</Text>
              <Text style={styles.infoValue}>{user?.patientId}</Text>
            </View>
          </View>
        </ProfileSection>

        {/* Account Settings */}
        <ProfileSection title="Account Settings">
          <View style={styles.menuCard}>
            <MenuItem
              icon="✏️"
              title="Edit Profile"
              subtitle="Update personal information"
              onPress={handleEditProfile}
            />
            <MenuItem
              icon="🔒"
              title="Change Password"
              subtitle="Update your password"
              onPress={handleChangePassword}
            />
            <MenuItem
              icon="⏰"
              title="Availability"
              subtitle="Manage working hours"
              onPress={handleAvailability}
            />
            <MenuItem
              icon="🔔"
              title="Notifications"
              subtitle="Notification preferences"
              onPress={handleNotifications}
            />
          </View>
        </ProfileSection>

        {/* Support & Help */}
        <ProfileSection title="Support & Help">
          <View style={styles.menuCard}>
            <MenuItem
              icon="❓"
              title="Help & Support"
              subtitle="Get help and support"
              onPress={handleSupport}
            />
            <MenuItem
              icon="ℹ️"
              title="About SehatConnect"
              subtitle="App version and information"
              onPress={() => Alert.alert('About', 'SehatConnect v2.0\nDoctor Portal')}
            />
          </View>
        </ProfileSection>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorHospital: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  doctorExperience: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  logoutSection: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
