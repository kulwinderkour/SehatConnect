import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, FlatList, Alert } from 'react-native';
import Header from '../../components/common/Header';

type Member = { id: string; name: string; relation: string; phone: string };

export default function FamilyMembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');

  const addMember = () => {
    if (!name || !relation) {
      Alert.alert('Validation', 'Please provide a name and relation');
      return;
    }
    const id = Date.now().toString();
    setMembers(prev => [...prev, { id, name, relation, phone }]);
    setName(''); setRelation(''); setPhone(''); setIsModalVisible(false);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Family Members</Text>

        <FlatList
          data={members}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <View style={styles.memberRow}>
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberMeta}>{item.relation} • {item.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => removeMember(item.id)}>
                <Text style={{ color: '#ef4444' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No family members added</Text>}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addText}>Add Member</Text>
        </TouchableOpacity>

        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Member</Text>
              <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
              <TextInput placeholder="Relation" style={styles.input} value={relation} onChangeText={setRelation} />
              <TextInput placeholder="Phone" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <TouchableOpacity style={styles.modalBtn} onPress={() => setIsModalVisible(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#5a9e31' }]} onPress={addMember}>
                  <Text style={{ color: '#fff' }}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  memberRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberName: { fontWeight: '700' },
  memberMeta: { color: '#6b7280' },
  addButton: { marginTop: 20, backgroundColor: '#5a9e31', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', padding: 16, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8, marginBottom: 8 },
  modalBtn: { padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6', paddingHorizontal: 20, alignItems: 'center' },
});
