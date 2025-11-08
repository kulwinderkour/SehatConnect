import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { StackScreenProps as RNStackScreenProps } from '@react-navigation/stack';

export type RootTabParamList = {
  Home: undefined;
  Consult: undefined;
  Records: undefined;
  Pharmacy: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  GovernmentSchemes: undefined;
  VideoCall: undefined;
  VideoConsult: undefined;
  PrescriptionDecoder: {
    prescription: any;
    imageUri: string;
  };
};

export type TabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

export type StackScreenProps<T extends keyof RootStackParamList> =
  RNStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList, RootStackParamList {}
  }
}
