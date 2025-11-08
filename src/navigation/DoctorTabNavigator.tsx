import React, { useMemo, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboardScreen';
import PatientManagementScreen from '../screens/doctor/PatientManagementScreen';
import AppointmentManagementScreen from '../screens/doctor/AppointmentManagementScreen';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import { LayoutDashboard, Users, CalendarDays, FileText, UserCircle } from 'lucide-react-native';

// Create tab navigator instance
const Tab = createBottomTabNavigator();

// Custom tab icon component for doctor interface with modern icons
const DoctorTabIcon = ({ 
  IconComponent, 
  isActive 
}: { 
  IconComponent: React.ComponentType<{ size: number; color: string }>; 
  isActive: boolean; 
}) => (
  <View style={styles.tabIconContainer}>
    <View style={[
      styles.iconWrapper,
      isActive && styles.iconWrapperActive
    ]}>
      <IconComponent 
        size={22} 
        color={isActive ? '#2563eb' : '#6b7280'} 
      />
    </View>
  </View>
);

// Main doctor tab navigator component
export default function DoctorTabNavigator() {
  // Doctor-specific tab configuration
  const tabScreens = useMemo(() => [
    {
      name: 'Dashboard',
      component: DoctorDashboardScreen,
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      name: 'Patients',
      component: PatientManagementScreen,
      icon: Users,
      label: 'Patients',
    },
    {
      name: 'Appointments',
      component: AppointmentManagementScreen,
      icon: CalendarDays,
      label: 'Appointments',
    },
    {
      name: 'Prescriptions',
      component: PrescriptionScreen,
      icon: FileText,
      label: 'Prescriptions',
    },
    {
      name: 'Profile',
      component: DoctorProfileScreen,
      icon: UserCircle,
      label: 'Profile',
    },
  ], []);

  // Custom icon renderer
  const createIconRenderer = useCallback(
    (IconComponent: React.ComponentType<{ size: number; color: string }>) => {
      return ({ focused }: { focused: boolean }) => (
        <DoctorTabIcon
          IconComponent={IconComponent}
          isActive={focused}
        />
      );
    }, 
    []
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#2563eb', // Blue theme for doctors
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: true,
      }}
    >
      {tabScreens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarIcon: createIconRenderer(screen.icon),
            tabBarLabel: screen.label,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// Doctor-specific styles
const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)', // Blue theme
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
});
