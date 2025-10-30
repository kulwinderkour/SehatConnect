import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import Header from '../../components/common/Header';
import { useNavigation } from '@react-navigation/native';
import { Eye } from 'lucide-react-native';

export default function AppSettingsScreen() {
  const navigation = useNavigation();

  // App Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(false);
  const [integrationsEnabled, setIntegrationsEnabled] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState('Smartwatch');


  // Privacy & Security
  const [appLockEnabled, _setAppLockEnabled] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [permissions, setPermissions] = useState({ Camera: true, Location: true, Microphone: false });

  // Handlers
  const toggleNotifications = (v: boolean) => {
    setNotificationsEnabled(v);
    Alert.alert('Notifications', `Notifications ${v ? 'enabled' : 'disabled'}`);
  };

  const toggleDataSharing = (v: boolean) => {
    setDataSharingEnabled(v);
    Alert.alert('Data Sharing', v ? 'Data sharing enabled' : 'Data sharing disabled');
  };

  const toggleIntegrations = (v: boolean) => {
    setIntegrationsEnabled(v);
    if (!v) setIntegrationStatus('Disconnected');
    else setIntegrationStatus('Smartwatch');
    Alert.alert('Integrations', `Integrations ${v ? 'enabled' : 'disabled'}`);
  };

  // Language selection is handled in a separate screen

  // Change password navigation is removed from this screen because password changes
  // are handled in their dedicated screen — call navigation.navigate('ChangePassword')
  // from the appropriate place where the option is presented.

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveAllSettings = () => {
    // Mock save — replace with AsyncStorage or context persistence if desired
    console.log('Saving settings', { notificationsEnabled, dataSharingEnabled, integrationsEnabled, integrationStatus, appLockEnabled, permissions });
    Alert.alert('Settings saved', 'Your settings have been saved locally');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.pageTitle}>App Settings</Text>

        {/* APP SETTINGS CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Eye size={18} color="#111827" />
            <Text style={styles.cardTitle}>App Settings</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSubtitle}>Receive alerts and reminders</Text>
            </View>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Data Sharing</Text>
              <Text style={styles.rowSubtitle}>Allow sharing anonymized health data</Text>
            </View>
            <Switch value={dataSharingEnabled} onValueChange={toggleDataSharing} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Device Integrations</Text>
              <Text style={styles.rowSubtitle}>Connected to: {integrationsEnabled ? integrationStatus : 'None'}</Text>
            </View>
            <Switch value={integrationsEnabled} onValueChange={toggleIntegrations} />
          </View>
        </View>

        {/* Language moved to its own screen */}

        {/* Privacy & Security moved to its own screen */}

        <TouchableOpacity style={styles.saveAll} onPress={saveAllSettings}>
          <Text style={styles.saveAllText}>Save Settings</Text>
        </TouchableOpacity>

        {/* Permissions Modal */}
        <Modal visible={permissionsModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Manage Permissions</Text>
              {Object.keys(permissions).map((k) => (
                <View key={k} style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{k}</Text>
                    <Text style={styles.rowSubtitle}>Allow access to {k.toLowerCase()}</Text>
                  </View>
                  <Switch value={(permissions as any)[k]} onValueChange={() => togglePermission(k as any)} />
                </View>
              ))}

              <TouchableOpacity style={[styles.saveAll, { marginTop: 12 }]} onPress={() => setPermissionsModalVisible(false)}>
                <Text style={styles.saveAllText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 0, borderBottomWidth: 0 },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  pickerRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pickerText: { fontSize: 15, color: '#111827' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 0, borderBottomWidth: 0 },
  actionText: { fontSize: 15, color: '#111827', fontWeight: '600' },
  actionChevron: { color: '#6b7280', fontSize: 20 },
  saveAll: { marginTop: 8, backgroundColor: '#5a9e31', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveAllText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});
