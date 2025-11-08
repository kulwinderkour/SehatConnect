import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { ArrowLeft, Plus, User, Phone, Calendar, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ModernDialog from '../components/common/ModernDialog';
import { useDialog } from '../hooks/useDialog';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  phone: string;
  bloodGroup: string;
}

const FamilyMembersScreen = () => {
  const navigation = useNavigation();
  const { visible, dialogOptions, hideDialog, showConfirm } = useDialog();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Sunita Singh',
      relation: 'Mother',
      age: 58,
      phone: '+91 98765 43211',
      bloodGroup: 'A+',
    },
    {
      id: '2',
      name: 'Harpreet Singh',
      relation: 'Father',
      age: 62,
      phone: '+91 98765 43212',
      bloodGroup: 'O+',
    },
    {
      id: '3',
      name: 'Simran Kaur',
      relation: 'Wife',
      age: 32,
      phone: '+91 98765 43213',
      bloodGroup: 'B+',
    },
  ]);

  const getRelationColor = (relation: string) => {
    const colors: any = {
      'Mother': '#ec4899',
      'Father': '#3b82f6',
      'Wife': '#8b5cf6',
      'Husband': '#8b5cf6',
      'Son': '#10b981',
      'Daughter': '#f59e0b',
      'Brother': '#06b6d4',
      'Sister': '#ef4444',
    };
    return colors[relation] || '#64748b';
  };

  const handleAddMember = () => {
    // Navigate to add family member screen
    console.log('Add family member');
  };

  const handleDeleteMember = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    showConfirm(
      'Delete Family Member',
      `Are you sure you want to remove ${member?.name} from your family members?`,
      () => {
        setFamilyMembers(familyMembers.filter(m => m.id !== id));
      },
      undefined,
      'DELETE',
      'CANCEL'
    );
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
        <Text style={styles.headerTitle}>Family Members</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddMember}
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
          <Text style={styles.infoBannerText}>
            Manage your family members' health profiles and appointments in one place
          </Text>
        </View>

        {/* Family Members List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAMILY MEMBERS ({familyMembers.length})</Text>
          {familyMembers.map((member, index) => (
            <View key={member.id} style={[styles.memberCard, index !== 0 && { marginTop: 12 }]}>
              <View style={styles.memberHeader}>
                <View style={styles.memberAvatar}>
                  <User size={24} color="#fff" strokeWidth={2} />
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={[styles.relationBadge, { backgroundColor: `${getRelationColor(member.relation)}20` }]}>
                    <Text style={[styles.relationText, { color: getRelationColor(member.relation) }]}>
                      {member.relation}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMember(member.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={20} color="#ef4444" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.memberDetails}>
                <View style={styles.detailItem}>
                  <Calendar size={16} color="#666" strokeWidth={2} />
                  <Text style={styles.detailText}>{member.age} years</Text>
                </View>
                <View style={styles.detailItem}>
                  <Phone size={16} color="#666" strokeWidth={2} />
                  <Text style={styles.detailText}>{member.phone}</Text>
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.bloodGroupIcon}>
                    <Text style={styles.bloodGroupIconText}>{member.bloodGroup}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.viewProfileButton} activeOpacity={0.7}>
                <Text style={styles.viewProfileButtonText}>View Health Profile</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Member CTA */}
        <TouchableOpacity 
          style={styles.addMemberCTA}
          onPress={handleAddMember}
          activeOpacity={0.8}
        >
          <View style={styles.addMemberIconContainer}>
            <Plus size={28} color="#5a9e31" strokeWidth={2} />
          </View>
          <Text style={styles.addMemberCTAText}>Add New Family Member          </Text>
        </TouchableOpacity>
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

export default FamilyMembersScreen;

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
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1976d2',
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
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5a9e31',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  relationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  relationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  bloodGroupIcon: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bloodGroupIconText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  viewProfileButton: {
    backgroundColor: '#f0f7ed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a9e31',
  },
  addMemberCTA: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5a9e31',
    borderStyle: 'dashed',
  },
  addMemberIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addMemberCTAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5a9e31',
  },
});
