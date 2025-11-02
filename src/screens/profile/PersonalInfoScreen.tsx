import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Header from '../../components/common/Header';

export default function PersonalInfoScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');

  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);
  const validatePhone = (p: string) => /^\+?[0-9]{7,15}$/.test(p);

  const handleSave = () => {
    if (email && !validateEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }
    if (phone && !validatePhone(phone)) {
      Alert.alert('Invalid phone', 'Please enter a valid phone number');
      return;
    }

    // For now we store locally — you can wire this to context or API
    Alert.alert('Saved', 'Personal information saved successfully');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Personal Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full name" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="name@example.com" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+9198xxxxxxx" />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
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
