import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Alert } from 'react-native';
import Header from '../../components/common/Header';
import { useNavigation } from '@react-navigation/native';

export default function PrivacySecurityScreen() {
  const navigation = useNavigation();
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [permissions, setPermissions] = useState({ Camera: true, Location: true, Microphone: false });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Privacy & Security</Text>

        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ChangePassword' as never)}>
          <Text style={styles.actionText}>Change Password</Text>
          <Text style={styles.actionChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Enable App Lock</Text>
            <Text style={styles.rowSubtitle}>Require passcode or biometrics to open the app</Text>
          </View>
          <Switch value={appLockEnabled} onValueChange={v => { setAppLockEnabled(v); Alert.alert('App Lock', v ? 'Enabled' : 'Disabled'); }} />
        </View>

        <TouchableOpacity style={styles.actionRow} onPress={() => setPermissionsModalVisible(true)}>
          <Text style={styles.actionText}>Manage Permissions</Text>
          <Text style={styles.actionChevron}>›</Text>
        </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  actionText: { fontSize: 15, color: '#111827', fontWeight: '600' },
  actionChevron: { color: '#6b7280', fontSize: 20 },
  saveAll: { marginTop: 8, backgroundColor: '#5a9e31', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveAllText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});
