import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { I18nProvider } from './src/i18n';
import { UserProfileProvider } from './src/contexts/UserProfileContext';
import { AppointmentProvider } from './src/contexts/AppointmentContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <UserProfileProvider>
          <AppointmentProvider>
            <NavigationContainer>
              <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <AppNavigator />
              </SafeAreaView>
            </NavigationContainer>
          </AppointmentProvider>
        </UserProfileProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
