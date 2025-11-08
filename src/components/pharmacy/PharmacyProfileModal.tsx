import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface PharmacyProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const PharmacyProfileModal: React.FC<PharmacyProfileModalProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<any>();
  const { userProfile } = useUserProfile();

  const handleNavigate = (screen: string, params?: any) => {
    onClose();
    navigation.navigate('Profile', { screen, ...params });
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={false}
      statusBarTranslucent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Profile Info Card */}
          <View style={styles.profileInfoCard}>
            <View style={styles.avatarContainer}>
              <Image 
                source={typeof userProfile.profileImage === 'string' ? { uri: userProfile.profileImage } : userProfile.profileImage}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.userName}>{userProfile.fullName}</Text>
            <TouchableOpacity 
              style={styles.addDetailsButton}
              onPress={() => handleNavigate('PersonalInfo')}
            >
              <Text style={styles.addDetailsText}>Add your details</Text>
              <Text style={styles.addDetailsArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <MenuItem
              icon="📦"
              title="My Orders"
              onPress={() => handleNavigate('Main')}
            />
            <MenuDivider />
            
            <MenuItem
              icon="💳"
              title="TM Wallet"
              onPress={() => handleNavigate('Main')}
            />
            <MenuDivider />
            
            <MenuItem
              icon="👥"
              title="Manage Patients"
              onPress={() => handleNavigate('FamilyMembers')}
            />
            <MenuDivider />
            
            <MenuItem
              icon="📍"
              title="Manage Addresses"
              onPress={() => handleNavigate('Main')}
            />
            <MenuDivider />
            
            <MenuItem
              icon="₹"
              title="Refer and Earn"
              onPress={() => handleNavigate('Main')}
            />
            <MenuDivider />
            
            <MenuItem
              icon="🔔"
              title="Reminder"
              onPress={() => handleNavigate('Main')}
            />
            <MenuDivider />
            
            <MenuItem
              icon="📄"
              title="Health Articles"
              onPress={() => handleNavigate('Main')}
            />
            <MenuDivider />
            
            <MenuItem
              icon="❓"
              title="Help"
              onPress={() => handleNavigate('Main')}
            />
          </View>

          {/* Terms & Conditions */}
          <View style={styles.footer}>
            <Text style={styles.termsText}>Terms & Conditions</Text>
            <Text style={styles.versionText}>v 8.4.1</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// Menu Item Component
interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
    <Text style={styles.menuText}>{title}</Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

// Menu Divider Component
const MenuDivider: React.FC = () => (
  <View style={styles.menuDivider} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
    marginRight: 12,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  profileInfoCard: {
    backgroundColor: '#E8F4FF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  addDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  addDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 4,
  },
  addDetailsArrow: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 72,
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 8,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default PharmacyProfileModal;
