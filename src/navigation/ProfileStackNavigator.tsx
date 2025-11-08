import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import FamilyMembersScreen from '../screens/FamilyMembersScreen';
import InsuranceInfoScreen from '../screens/InsuranceInfoScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AboutAppScreen from '../screens/AboutAppScreen';
import ABDMIntegrationScreen from '../screens/ABDMIntegrationScreen';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';
import LanguageScreen from '../screens/profile/LanguageScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    // Hide the native header so our custom screens have their own headers
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
      <Stack.Screen name="InsuranceInfo" component={InsuranceInfoScreen} />
      <Stack.Screen name="ABDMIntegration" component={ABDMIntegrationScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="AboutApp" component={AboutAppScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
