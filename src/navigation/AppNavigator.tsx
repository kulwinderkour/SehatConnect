import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoleBasedNavigator from './RoleBasedNavigator';
import { useAuth } from '../contexts/AuthContext';

// Custom navigation parameter types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
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
  const { isAuthenticated, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [stableAuthState, setStableAuthState] = useState(isAuthenticated);

  console.log('AppNavigator render - isAuthenticated:', isAuthenticated, 'loading:', loading, 'isInitialized:', isInitialized, 'stableAuthState:', stableAuthState);

  useEffect(() => {
    // Simulate app initialization time
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Add effect to handle authentication state changes with debouncing
  useEffect(() => {
    if (isInitialized && !loading) {
      console.log('Authentication state changed - isAuthenticated:', isAuthenticated);
      // Add a small delay to prevent rapid state changes
      const timer = setTimeout(() => {
        setStableAuthState(isAuthenticated);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isInitialized, loading]);

  // Show splash screen during initialization or auth loading
  if (!isInitialized || loading) {
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
      </Stack.Navigator>
    );
  }

  // After initialization, show appropriate screen based on stable auth state
  if (stableAuthState) {
    console.log('Rendering MainApp navigator');
    return (
      <Stack.Navigator
        key="main-app"
        initialRouteName="MainApp"
        screenOptions={screenOptions}
      >
        <Stack.Screen 
          name="MainApp" 
          component={RoleBasedNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    );
  }

  console.log('Rendering Login navigator');
  return (
    <Stack.Navigator
      key="login-app"
      initialRouteName="Login"
      screenOptions={screenOptions}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}