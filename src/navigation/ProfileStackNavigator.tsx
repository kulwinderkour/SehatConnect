import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import FamilyMembersScreen from '../screens/profile/FamilyMembersScreen';
import InsuranceInfoScreen from '../screens/profile/InsuranceInfoScreen';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';
import LanguageScreen from '../screens/profile/LanguageScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    // Hide the native header so our custom green Header component is the only header shown
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
      <Stack.Screen name="InsuranceInfo" component={InsuranceInfoScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="PrivacySecurity" component={require('../screens/profile/PrivacySecurityScreen').default} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
