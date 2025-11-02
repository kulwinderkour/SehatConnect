import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import Header from '../../components/common/Header';

export default function InsuranceInfoScreen() {
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [validTill, setValidTill] = useState('');
  const [active, setActive] = useState(true);

  const handleSave = () => {
    // Basic validation
    if (!provider) return Alert.alert('Validation', 'Please enter provider name');
    Alert.alert('Saved', 'Insurance information saved');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Insurance Information</Text>

        <Text style={styles.label}>Provider Name</Text>
        <TextInput style={styles.input} value={provider} onChangeText={setProvider} placeholder="Provider name" />

        <Text style={styles.label}>Policy Number</Text>
        <TextInput style={styles.input} value={policyNumber} onChangeText={setPolicyNumber} placeholder="Policy number" />

        <Text style={styles.label}>Valid Till</Text>
        <TextInput style={styles.input} value={validTill} onChangeText={setValidTill} placeholder="YYYY-MM-DD" />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <Text style={styles.label}>Active Insurance</Text>
          <Switch value={active} onValueChange={setActive} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, color: '#374151', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8 },
  saveButton: { marginTop: 24, backgroundColor: '#5a9e31', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
