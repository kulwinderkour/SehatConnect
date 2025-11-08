import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Edit2, Save } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserProfile } from '../contexts/UserProfileContext';
import ModernDialog from '../components/common/ModernDialog';
import { useDialog } from '../hooks/useDialog';

const PersonalInfoScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const { visible, dialogOptions, hideDialog, showSuccess } = useDialog();
  
  const [formData, setFormData] = useState({
    fullName: userProfile.fullName || 'Rajinder Singh',
    email: 'rajinder.singh@example.com',
    phone: '+91 98765 43210',
    dateOfBirth: '15 March 1990',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '123, Green Park, New Delhi - 110016',
  });

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    showSuccess('Saved', 'Your personal information has been updated successfully');
  };

  const InfoField = ({ label, value, icon, editable = true }: any) => (
    <View style={styles.infoField}>
      <View style={styles.infoFieldHeader}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          style={styles.infoInput}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [label.toLowerCase().replace(' ', '')]: text })}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
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
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          activeOpacity={0.7}
        >
          {isEditing ? (
            <Save size={22} color="#5a9e31" strokeWidth={2} />
          ) : (
            <Edit2 size={22} color="#5a9e31" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
          <View style={styles.card}>
            <InfoField 
              label="Full Name" 
              value={formData.fullName}
              icon={<User size={20} color="#5a9e31" strokeWidth={2} />}
            />
            <View style={styles.divider} />
            <InfoField 
              label="Email" 
              value={formData.email}
              icon={<Mail size={20} color="#3b82f6" strokeWidth={2} />}
            />
            <View style={styles.divider} />
            <InfoField 
              label="Phone" 
              value={formData.phone}
              icon={<Phone size={20} color="#8b5cf6" strokeWidth={2} />}
            />
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MEDICAL INFORMATION</Text>
          <View style={styles.card}>
            <InfoField 
              label="Date of Birth" 
              value={formData.dateOfBirth}
              icon={<Calendar size={20} color="#f59e0b" strokeWidth={2} />}
            />
            <View style={styles.divider} />
            <View style={styles.infoField}>
              <View style={styles.infoFieldHeader}>
                <View style={styles.iconContainer}>
                  <User size={20} color="#06b6d4" strokeWidth={2} />
                </View>
                <Text style={styles.infoLabel}>Gender</Text>
              </View>
              {isEditing ? (
                <View style={styles.genderContainer}>
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        formData.gender === gender && styles.genderButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, gender })}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        formData.gender === gender && styles.genderButtonTextActive
                      ]}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>{formData.gender}</Text>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.infoField}>
              <View style={styles.infoFieldHeader}>
                <View style={styles.iconContainer}>
                  <User size={20} color="#ef4444" strokeWidth={2} />
                </View>
                <Text style={styles.infoLabel}>Blood Group</Text>
              </View>
              {isEditing ? (
                <View style={styles.bloodGroupContainer}>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((blood) => (
                    <TouchableOpacity
                      key={blood}
                      style={[
                        styles.bloodGroupButton,
                        formData.bloodGroup === blood && styles.bloodGroupButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, bloodGroup: blood })}
                    >
                      <Text style={[
                        styles.bloodGroupButtonText,
                        formData.bloodGroup === blood && styles.bloodGroupButtonTextActive
                      ]}>
                        {blood}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>{formData.bloodGroup}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADDRESS</Text>
          <View style={styles.card}>
            <InfoField 
              label="Address" 
              value={formData.address}
              icon={<MapPin size={20} color="#10b981" strokeWidth={2} />}
            />
          </View>
        </View>

        {/* Patient ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PATIENT DETAILS</Text>
          <View style={styles.card}>
            <InfoField 
              label="Patient ID" 
              value={userProfile.patientId}
              icon={<User size={20} color="#64748b" strokeWidth={2} />}
              editable={false}
            />
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

export default PersonalInfoScreen;

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
  editButton: {
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
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoField: {
    paddingVertical: 12,
  },
  infoFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 32,
  },
  infoInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#5a9e31',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    marginLeft: 32,
    gap: 8,
    marginTop: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  genderButtonActive: {
    backgroundColor: '#5a9e31',
    borderColor: '#5a9e31',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 32,
    gap: 8,
    marginTop: 8,
  },
  bloodGroupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  bloodGroupButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  bloodGroupButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  bloodGroupButtonTextActive: {
    color: '#fff',
  },
});
