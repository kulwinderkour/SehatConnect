import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import TabNavigator from './TabNavigator';
import DoctorTabNavigator from './DoctorTabNavigator';
import GovernmentSchemesScreen from '../screens/GovernmentSchemesScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import VideoConsultScreen from '../screens/VideoConsultScreen';
import { RootStackParamList } from '../types/navigation.d';

const Stack = createStackNavigator<RootStackParamList>();

// Role-based navigator that shows different interfaces based on user role
export default function RoleBasedNavigator() {
  const { user, isAuthenticated } = useAuth();

  console.log('RoleBasedNavigator render - isAuthenticated:', isAuthenticated, 'user:', user?.fullName, 'role:', user?.role);

  // If not authenticated, don't render anything (AppNavigator will handle this)
  if (!isAuthenticated || !user) {
    console.log('RoleBasedNavigator: Not authenticated, returning null');
    return null;
  }

  // Show doctor interface for doctors - wrap in stack for modal screens
  if (user?.role === 'doctor') {
    console.log('RoleBasedNavigator: Rendering Doctor Stack Navigator');
    return (
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={DoctorTabNavigator}
          options={{
            animationEnabled: true,
          }}
        />
        <Stack.Screen
          name="GovernmentSchemes"
          component={GovernmentSchemesScreen}
          options={{
            animationEnabled: true,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="VideoCall"
          component={VideoCallScreen}
          options={{
            animationEnabled: true,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="VideoConsult"
          component={VideoConsultScreen}
          options={{
            animationEnabled: true,
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    );
  }

  // Show patient interface with stack navigator for modal screens
  console.log('RoleBasedNavigator: Rendering Patient Stack Navigator');
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="GovernmentSchemes"
        component={GovernmentSchemesScreen}
        options={{
          animationEnabled: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="VideoCall"
        component={VideoCallScreen}
        options={{
          animationEnabled: true,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="VideoConsult"
        component={VideoConsultScreen}
        options={{
          animationEnabled: true,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
