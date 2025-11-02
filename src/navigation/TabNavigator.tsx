import React, { useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ConsultationsScreen from '../screens/ConsultationsScreen';
import VideoConsultScreen from '../screens/VideoConsultScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import RecordsScreen from '../screens/RecordsScreen';
import PharmacyScreen from '../screens/PharmacyScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import { useI18n } from '../i18n';

// Create navigator instances
const Tab = createBottomTabNavigator();
const ConsultStack = createStackNavigator();

// Custom tab icon component with original design
const CustomTabIcon = ({ emoji, isActive }: { emoji: string; isActive: boolean }) => (
  <View style={styles.tabIconContainer}>
    <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
      <Text style={[styles.iconEmoji, isActive && styles.iconEmojiActive]}>{emoji}</Text>
    </View>
  </View>
));

// Main tab navigator component
export default function TabNavigator() {
  const { getText } = useI18n();

  const tabScreens = useMemo(
    () => [
      { name: 'Home', component: HomeScreen, icon: '🏠', label: getText('navHome') },
      { name: 'Consult', component: ConsultationsScreen, icon: '👨‍⚕️', label: getText('navConsult') },
      { name: 'Records', component: RecordsScreen, icon: '📋', label: getText('navRecords') },
      { name: 'Pharmacy', component: PharmacyScreen, icon: '💊', label: getText('navPharmacy') },
      { name: 'Profile', component: ProfileStackNavigator, icon: '👤', label: getText('navProfile') },
    ],
    [getText]
  );

  const createIconRenderer = useCallback(
    (icon: string) => ({ focused }: { focused: boolean }) => <CustomTabIcon emoji={icon} isActive={focused} />,
    []
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#5a9e31',
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: true,
        lazy: true, // Enable lazy loading for better performance
        unmountOnBlur: false, // Keep screens mounted for smoother transitions
        animationEnabled: true, // Enable smooth animations
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is open
      }}
    >
      {tabScreens.map((screen) => (
        <Tab.Screen key={screen.name} name={screen.name} component={screen.component} options={{ tabBarIcon: createIconRenderer(screen.icon), tabBarLabel: screen.label }} />
      ))}
    </Tab.Navigator>
  );
});

export default TabNavigator;

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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(90, 158, 49, 0.1)',
  },
  iconEmoji: {
    fontSize: 20,
    color: '#6b7280',
  },
  iconEmojiActive: {
    fontSize: 22,
    color: '#5a9e31',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
});
