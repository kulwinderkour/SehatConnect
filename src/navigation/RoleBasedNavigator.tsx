import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TabNavigator from './TabNavigator';
import DoctorTabNavigator from './DoctorTabNavigator';

// Role-based navigator that shows different interfaces based on user role
export default function RoleBasedNavigator() {
  const { user } = useAuth();

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
