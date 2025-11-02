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

  // For patients and admins, wrap TabNavigator in a Stack to allow navigation to screens
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="GovernmentSchemes" component={GovernmentSchemesScreen} />
    </Stack.Navigator>
  );
}
