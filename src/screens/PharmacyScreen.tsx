import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
// lucide-react-native icons removed
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

type Medicine = {
  id: string;
  name: string;
  price: number;
  pharmacy: string;
  stock: StockClass;
  image?: string;
};

type CartItem = {
  medicine: Medicine;
  quantity: number;
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
    <View style={styles.metaRow}>
  {/* Icon removed */}
      <Text style={styles.meta}>{meta}</Text>
    </View>
    <View style={styles.rowBetween}>
  <Text style={styles.infoLeft}>{infoLeft}</Text>
  {!!infoRight && <Text style={styles.infoRight}>{infoRight}</Text>}
    </View>
  </View>
);

export default function PharmacyScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Sample medicine data
  const medicines: Medicine[] = [
    { id: '1', name: 'Amlodipine 5mg', price: 45, pharmacy: 'Sharma Medical Store', stock: 'inStock' },
    { id: '2', name: 'Paracetamol 500mg', price: 25, pharmacy: 'Apollo Pharmacy', stock: 'inStock' },
    { id: '3', name: 'Vitamin D3', price: 99, pharmacy: 'City Medical', stock: 'lowStock' },
    { id: '4', name: 'Metformin 500mg', price: 35, pharmacy: 'Sharma Medical Store', stock: 'inStock' },
    { id: '5', name: 'Aspirin 75mg', price: 15, pharmacy: 'Apollo Pharmacy', stock: 'outStock' },
  ];

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
    Alert.alert('Added to Cart', `${medicine.name} added to cart`);
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(medicineId);
    } else {
      setCart(cart.map(item =>
        item.medicine.id === medicineId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
  };

  return (
  <View style={styles.screenContainer}>
      <Header />
  <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBar}>
          {/* Icon removed */}
          <TextInput
            placeholder="Search medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={() => setShowCart(true)} style={styles.cartButton}>
            {/* Icon removed */}
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {filteredMedicines.map(medicine => (
              <View key={medicine.id} style={styles.medicineCard}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <Text style={styles.medicinePharmacy}>{medicine.pharmacy}</Text>
                  <Text style={styles.medicinePrice}>₹{medicine.price}</Text>
                </View>
                <View style={styles.medicineActions}>
                  <View style={[styles.stockBadge, stockStyle(medicine.stock)]}>
                    <Text style={styles.stockText}>
                      {medicine.stock === 'inStock' ? 'In Stock' : 
                       medicine.stock === 'lowStock' ? 'Low Stock' : 'Out of Stock'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.addToCartBtn, medicine.stock === 'outStock' && styles.disabledBtn]}
                    onPress={() => medicine.stock !== 'outStock' && addToCart(medicine)}
                    disabled={medicine.stock === 'outStock'}
                  >
                    <Text style={styles.addToCartText}>
                      {medicine.stock === 'outStock' ? 'Out of Stock' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {filteredMedicines.length === 0 && (
              <Text style={styles.noResults}>No medicines found for "{searchQuery}"</Text>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>

        <PharmacyCard
          name="Sharma Medical Store"
          statusClass="inStock"
          statusText="In Stock"
          meta="0.8 km • Open until 10 PM"
          infoLeft="Amlodipine 5mg available"
          infoRight="₹45"
        />
        <PharmacyCard
          name="Apollo Pharmacy"
          statusClass="lowStock"
          statusText="Low Stock"
          meta="1.2 km • Open 24/7"
          infoLeft="Only 3 strips left"
          infoRight="₹48"
        />
        <PharmacyCard
          name="City Medical"
          statusClass="outStock"
          statusText="Out of Stock"
          meta="2.1 km • Open until 9 PM"
          infoLeft="Expected restock: Tomorrow"
        />

  <Text style={styles.sectionTitleWithMargin}>Medicine Reminders</Text>
        <View style={styles.cardRow}>
          <View style={styles.reminderContent}>
            {/* Icon removed */}
            <View style={styles.reminderText}>
              <Text style={styles.reminderTitle}>Amlodipine 5mg</Text>
              <Text style={styles.reminderDue}>Due in 30 minutes</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.takeBtn}>
            <Text style={styles.markTakenText}>Mark Taken</Text>
          </TouchableOpacity>
        </View>

        {/* Prescription Upload */}
  <Text style={styles.sectionTitleWithMargin}>Upload Prescription</Text>
        <TouchableOpacity style={styles.prescriptionCard}>
          {/* Icon removed */}
          <Text style={styles.prescriptionTitle}>Upload Prescription</Text>
          <Text style={styles.prescriptionDesc}>
            Take a photo or upload your prescription for easy ordering
          </Text>
        </TouchableOpacity>

        {/* Quick Actions */}
  <Text style={styles.sectionTitleWithMargin}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn}>
            {/* Icon removed */}
            <Text style={styles.quickActionText}>Order Medicine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
            {/* Icon removed */}
            <Text style={styles.quickActionText}>Lab Tests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
            {/* Icon removed */}
            <Text style={styles.quickActionText}>Find Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
            {/* Icon removed */}
            <Text style={styles.quickActionText}>Emergency</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.cartModal}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Shopping Cart ({cart.length})</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                {/* Icon removed */}
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.cartItems}>
              {cart.map(item => (
                <View key={item.medicine.id} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.medicine.name}</Text>
                    <Text style={styles.cartItemPrice}>₹{item.medicine.price}</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                      style={styles.quantityBtn}
                    >
                      {/* Icon removed */}
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                      style={styles.quantityBtn}
                    >
                      {/* Icon removed */}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.cartFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>₹{getTotalPrice()}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn}>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#000' },
  screenContainer: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20 },
  infoLeft: { fontSize: 14 },
  infoRight: { color: '#4CAF50', fontWeight: '700' },
  sectionTitleWithMargin: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15, marginTop: 25 },
  reminderTitle: { fontWeight: '600' },
  reminderDue: { fontSize: 12, color: '#666' },
  markTakenText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  iconMarginBottom: { marginBottom: 10 },
  prescriptionTitle: { fontWeight: '600', marginBottom: 5 },
  prescriptionDesc: { fontSize: 12, color: '#666', textAlign: 'center' },
  quickActionText: { fontSize: 12, textAlign: 'center' },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reminderContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  reminderText: { marginLeft: 8 },
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
  // Search Results Styles
  searchResults: {
    marginBottom: 20,
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  medicinePharmacy: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  medicinePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addToCartBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  // Cart Styles
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cartModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#666',
  },
  cartItems: {
    maxHeight: 300,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    backgroundColor: '#f0f0f0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#333',
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  checkoutBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Prescription Upload Styles
  prescriptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
});
