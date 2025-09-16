import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.profileHeader}>
          <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.avatar}>
            <Text style={{ fontSize: 32, color: '#fff' }}>👤</Text>
          </LinearGradient>
          <Text style={styles.name}>Rajinder Singh</Text>
          <Text style={styles.pid}>Patient ID: SH001234</Text>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>👤</Text>
              <Text>Personal Information</Text>
            </View>
            <Text>›</Text>
          </View>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>👨‍👩‍👧‍👦</Text>
              <Text>Family Members</Text>
            </View>
            <Text>›</Text>
          </View>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>🏥</Text>
              <Text>Insurance Info</Text>
            </View>
            <Text>›</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>⚙️</Text>
              <Text>App Settings</Text>
            </View>
            <Text>›</Text>
          </View>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>🌐</Text>
              <Text>Language: English</Text>
            </View>
            <Text>›</Text>
          </View>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>🔒</Text>
              <Text>Privacy & Security</Text>
            </View>
            <Text>›</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>❓</Text>
              <Text>Help & Support</Text>
            </View>
            <Text>›</Text>
          </View>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 15, fontSize: 18 }}>ℹ️</Text>
              <Text>About SehatConnect</Text>
            </View>
            <Text>›</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: '#fff', borderRadius: 15, padding: 25, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  name: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 5 },
  pid: { fontSize: 14, color: '#666' },
  menuSection: {
    backgroundColor: '#fff', borderRadius: 15, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  menuItem: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
});
