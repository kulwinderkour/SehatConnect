import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ArrowLeft, Settings, Bell, Share2, Smartphone, Sun, Moon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ModernDialog from '../../components/common/ModernDialog';
import { useDialog } from '../../hooks/useDialog';

export default function AppSettingsScreen() {
  const navigation = useNavigation();
  const { visible, dialogOptions, hideDialog, showSuccess } = useDialog();

  const [settings, setSettings] = useState({
    notifications: true,
    dataSharing: false,
    deviceIntegrations: true,
    darkMode: false,
    autoUpdate: true,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }));
  };

  const handleSaveSettings = () => {
    showSuccess('Settings Saved', 'Your app settings have been saved successfully');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1a1a1a" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Bell size={22} color="#5a9e31" strokeWidth={2} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>Receive alerts and reminders</Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
                trackColor={{ false: '#ddd', true: '#5a9e31' }}
                thumbColor="#fff"
                ios_backgroundColor="#ddd"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Share2 size={22} color="#3b82f6" strokeWidth={2} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Data Sharing</Text>
                  <Text style={styles.settingDescription}>Share anonymized health data</Text>
                </View>
              </View>
              <Switch
                value={settings.dataSharing}
                onValueChange={() => toggleSetting('dataSharing')}
                trackColor={{ false: '#ddd', true: '#5a9e31' }}
                thumbColor="#fff"
                ios_backgroundColor="#ddd"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Smartphone size={22} color="#8b5cf6" strokeWidth={2} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Device Integrations</Text>
                  <Text style={styles.settingDescription}>
                    {settings.deviceIntegrations ? 'Connected to Smartwatch' : 'Not connected'}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.deviceIntegrations}
                onValueChange={() => toggleSetting('deviceIntegrations')}
                trackColor={{ false: '#ddd', true: '#5a9e31' }}
                thumbColor="#fff"
                ios_backgroundColor="#ddd"
              />
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  {settings.darkMode ? (
                    <Moon size={22} color="#64748b" strokeWidth={2} />
                  ) : (
                    <Sun size={22} color="#f59e0b" strokeWidth={2} />
                  )}
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    {settings.darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={() => toggleSetting('darkMode')}
                trackColor={{ false: '#ddd', true: '#5a9e31' }}
                thumbColor="#fff"
                ios_backgroundColor="#ddd"
              />
            </View>
          </View>
        </View>

        {/* Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPDATES</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Settings size={22} color="#10b981" strokeWidth={2} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Automatic Updates</Text>
                  <Text style={styles.settingDescription}>Download updates automatically</Text>
                </View>
              </View>
              <Switch
                value={settings.autoUpdate}
                onValueChange={() => toggleSetting('autoUpdate')}
                trackColor={{ false: '#ddd', true: '#5a9e31' }}
                thumbColor="#fff"
                ios_backgroundColor="#ddd"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        {/* Info Note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Settings are saved locally on your device. Some changes may require app restart.
          </Text>
        </View>
      </ScrollView>

      {/* Modern Dialog */}
      <ModernDialog
        visible={visible}
        title={dialogOptions.title}
        message={dialogOptions.message}
        type={dialogOptions.type}
        buttons={dialogOptions.buttons}
        onClose={hideDialog}
        showCloseButton={dialogOptions.showCloseButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 50,
  },
  saveButton: {
    backgroundColor: '#5a9e31',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#5a9e31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
});
