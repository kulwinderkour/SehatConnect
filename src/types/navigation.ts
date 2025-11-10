// Navigation type definitions for SehatConnect

import { Doctor } from './health';

// Root stack navigator types
export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
};

// Tab navigator types
export type TabParamList = {
  Home: undefined;
  Consult: undefined;
  Records: undefined;
  Pharmacy: undefined;
  Profile: undefined;
};

// Consult stack navigator types
export type ConsultStackParamList = {
  ConsultationsMain: undefined;
  VideoConsult: undefined;
};

// Combined navigation types
export type RootNavigationProp = import('@react-navigation/native').NavigationProp<RootStackParamList>;
export type TabNavigationProp = import('@react-navigation/bottom-tabs').BottomTabNavigationProp<TabParamList>;
export type ConsultStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<ConsultStackParamList>;

// Route types
export type RootRouteProp<T extends keyof RootStackParamList> = import('@react-navigation/native').RouteProp<RootStackParamList, T>;
export type TabRouteProp<T extends keyof TabParamList> = import('@react-navigation/bottom-tabs').BottomTabNavigationProp<TabParamList, T>;
export type ConsultStackRouteProp<T extends keyof ConsultStackParamList> = import('@react-navigation/stack').StackNavigationProp<ConsultStackParamList, T>;
