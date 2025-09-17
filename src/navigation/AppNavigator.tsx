import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import SplashScreen from '../screens/SplashScreen';

// Custom navigation parameter types
export type RootStackParamList = {
  Splash: undefined;
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
        name="MainTabs" 
        component={TabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}