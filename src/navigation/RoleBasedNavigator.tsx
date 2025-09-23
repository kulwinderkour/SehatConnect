import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import TabNavigator from './TabNavigator';
import DoctorTabNavigator from './DoctorTabNavigator';
import GovernmentSchemesScreen from '../screens/GovernmentSchemesScreen';
import { RootStackParamList } from '../types/navigation.d';

const Stack = createStackNavigator<RootStackParamList>();

// Role-based navigator that shows different interfaces based on user role
export default function RoleBasedNavigator() {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything (AppNavigator will handle this)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Show doctor interface for doctors
  if (user?.role === 'doctor') {
    return <DoctorTabNavigator />;
  }

  // Show admin interface for admins (you can create AdminTabNavigator later)
  if (user?.role === 'admin') {
    return <TabNavigator />; // For now, show patient interface
  }

  // Default to patient interface
  return <TabNavigator />;
}
