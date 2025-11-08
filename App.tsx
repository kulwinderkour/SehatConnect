import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { I18nProvider } from './src/i18n';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProfileProvider } from './src/contexts/UserProfileContext';
import { AppointmentProvider } from './src/contexts/AppointmentContext';
import { ChatbotProvider } from './src/contexts/ChatbotContext';
import { GlobalChatbot } from './src/components/chatbot';
import { navigationRef } from './src/services/NavigationService';

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <UserProfileProvider>
            <AppointmentProvider>
              <ChatbotProvider>
                <NavigationContainer ref={navigationRef}>
                  <SafeAreaView style={styles.container}>
                    <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                    <AppNavigator />
                    <GlobalChatbot />
                  </SafeAreaView>
                </NavigationContainer>
              </ChatbotProvider>
            </AppointmentProvider>
          </UserProfileProvider>
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
