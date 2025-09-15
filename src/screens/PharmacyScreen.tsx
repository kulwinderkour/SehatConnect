import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Header from '../components/common/Header';

type StockClass = 'inStock' | 'lowStock' | 'outStock';

type PharmacyCardProps = {
  name: string;
  statusClass: StockClass;
  statusText: string;
  meta: string;
  infoRight?: string;
  infoLeft: string;
};

const stockStyle = (cls: StockClass) => {
  switch (cls) {
    case 'inStock':
      return styles.inStock;
    case 'lowStock':
      return styles.lowStock;
    case 'outStock':
      return styles.outStock;
    default:
      return styles.inStock;
  }
};

const PharmacyCard = ({ name, statusClass, statusText, meta, infoRight, infoLeft }: PharmacyCardProps) => (
  <View style={styles.card}>
    <View style={styles.phHeader}>
      <Text style={styles.phName}>{name}</Text>
      <View style={[styles.badge, stockStyle(statusClass)]}>
        <Text style={styles.badgeText}>{statusText}</Text>
      </View>
    </View>
    <Text style={styles.meta}>{meta}</Text>
    <View style={styles.rowBetween}>
      <Text style={{ fontSize: 14 }}>{infoLeft}</Text>
      {!!infoRight && <Text style={{ color: '#4CAF50', fontWeight: '700' }}>{infoRight}</Text>}
    </View>
  </View>
);

export default function PharmacyScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput placeholder="Search medicines..." style={styles.searchInput} />
        </View>

        <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>

        <PharmacyCard
          name="Sharma Medical Store"
          statusClass="inStock"
          statusText="In Stock"
          meta="📍 0.8 km • Open until 10 PM"
          infoLeft="Amlodipine 5mg available"
          infoRight="₹45"
        />
        <PharmacyCard
          name="Apollo Pharmacy"
          statusClass="lowStock"
          statusText="Low Stock"
          meta="📍 1.2 km • Open 24/7"
          infoLeft="Only 3 strips left"
          infoRight="₹48"
        />
        <PharmacyCard
          name="City Medical"
          statusClass="outStock"
          statusText="Out of Stock"
          meta="📍 2.1 km • Open until 9 PM"
          infoLeft="Expected restock: Tomorrow"
        />

        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Medicine Reminders</Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={{ fontWeight: '600' }}>🔔 Amlodipine 5mg</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Due in 30 minutes</Text>
          </View>
          <TouchableOpacity style={styles.takeBtn}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Mark Taken</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  phHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  phName: { fontSize: 16, fontWeight: '600', color: '#333' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  inStock: { backgroundColor: '#e8f5e8' },
  lowStock: { backgroundColor: '#fff3e0' },
  outStock: { backgroundColor: '#ffebee' },
  meta: { fontSize: 12, color: '#666', marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardRow: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  takeBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 15 },
});
