import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ConsultationsScreen from '../screens/ConsultationsScreen';
import RecordsScreen from '../screens/RecordsScreen';
import PharmacyScreen from '../screens/PharmacyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useI18n } from '../i18n';

const Tab = createBottomTabNavigator();

const Icon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <View style={styles.iconWrap}>
    <Text style={[styles.icon, focused && styles.iconActive]}>{emoji}</Text>
  </View>
);

export default function TabNavigator() {
  const { t } = useI18n();
  
  const renderIcon = useCallback(
    (emoji: string) =>
      ({ focused }: { focused: boolean }) => <Icon emoji={emoji} focused={focused} />,
    []
  );
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: renderIcon('🏠'), tabBarLabel: t('home') }} />
      <Tab.Screen name="Consult" component={ConsultationsScreen} options={{ tabBarIcon: renderIcon('👨‍⚕️'), tabBarLabel: t('consult') }} />
      <Tab.Screen name="Records" component={RecordsScreen} options={{ tabBarIcon: renderIcon('📋'), tabBarLabel: t('records') }} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} options={{ tabBarIcon: renderIcon('💊'), tabBarLabel: t('pharmacy') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: renderIcon('👤'), tabBarLabel: t('profile') }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: 80, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9ecef', paddingBottom: 20, paddingTop: 5 },
  tabLabel: { fontSize: 11, fontWeight: '500', marginTop: 4 },
  iconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  iconActive: { fontSize: 22 },
});
