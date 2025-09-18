import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import { useAuth } from '../contexts/AuthContext';

// Custom navigation parameter types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainTabs: undefined;
};

// Create stack navigator instance
const Stack = createStackNavigator<RootStackParamList>();

// Custom screen options configuration
const screenOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardStyle: { backgroundColor: '#ffffff' },
};

// Main app navigator component
export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={screenOptions}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}