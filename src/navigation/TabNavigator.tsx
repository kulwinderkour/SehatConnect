import React, { useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ConsultationsScreen from '../screens/ConsultationsScreen';
import RecordsScreen from '../screens/RecordsScreen';
import PharmacyScreen from '../screens/PharmacyScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import { useI18n } from '../i18n';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Home, Stethoscope, FileText, Pill } from 'lucide-react-native';

// Create navigator instances
const Tab = createBottomTabNavigator();

// Custom tab icon component with modern icons
const CustomTabIcon = ({ 
  IconComponent, 
  isActive 
}: { 
  IconComponent: React.ComponentType<{ size: number; color: string }>; 
  isActive: boolean;
}) => (
  <View style={styles.tabIconContainer}>
    <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
      <IconComponent 
        size={22} 
        color={isActive ? '#5a9e31' : '#6b7280'} 
      />
    </View>
  </View>
);

// Custom profile photo tab icon component
const ProfilePhotoTabIcon = ({ isActive }: { isActive: boolean }) => {
  const { userProfile } = useUserProfile();
  
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.profilePhotoWrapper, isActive && styles.profilePhotoWrapperActive]}>
        <Image 
          source={typeof userProfile.profileImage === 'string' ? { uri: userProfile.profileImage } : userProfile.profileImage}
          style={styles.profilePhotoTab}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

// Main tab navigator component
export default function TabNavigator() {
  console.log('TabNavigator: Rendering');
  
  const { getText } = useI18n();

  console.log('TabNavigator: i18n loaded, getText available');

  const tabScreens = useMemo(
    () => {
      console.log('TabNavigator: Creating tab screens array');
      return [
        { name: 'Home', component: HomeScreen, icon: Home, label: getText('navHome'), isProfile: false },
        { name: 'Consult', component: ConsultationsScreen, icon: Stethoscope, label: getText('navConsult'), isProfile: false },
        { name: 'Records', component: RecordsScreen, icon: FileText, label: getText('navRecords'), isProfile: false },
        { name: 'Pharmacy', component: PharmacyScreen, icon: Pill, label: getText('navPharmacy'), isProfile: false },
        { name: 'Profile', component: ProfileStackNavigator, icon: null, label: getText('navProfile'), isProfile: true },
      ];
    },
    [getText]
  );

  console.log('TabNavigator: Tab screens created, count:', tabScreens.length);

  const createIconRenderer = useCallback(
    (IconComponent: React.ComponentType<{ size: number; color: string }>) => 
      ({ focused }: { focused: boolean }) => 
        <CustomTabIcon IconComponent={IconComponent} isActive={focused} />,
    []
  );

  console.log('TabNavigator: Returning Tab.Navigator');

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#5a9e31',
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: true,
        lazy: true, // Enable lazy loading for better performance
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is open
      }}
    >
      {tabScreens.map((screen) => (
        <Tab.Screen 
          key={screen.name} 
          name={screen.name} 
          component={screen.component} 
          options={{ 
            tabBarIcon: screen.isProfile 
              ? ({ focused }: { focused: boolean }) => <ProfilePhotoTabIcon isActive={focused} />
              : createIconRenderer(screen.icon!), 
            tabBarLabel: screen.label 
          }} 
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(90, 158, 49, 0.12)',
  },
  profilePhotoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    marginBottom: 4,
  },
  profilePhotoWrapperActive: {
    borderColor: '#5a9e31',
    borderWidth: 3,
  },
  profilePhotoTab: {
    width: '100%',
    height: '100%',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
});
