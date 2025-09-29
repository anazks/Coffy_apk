import { addModifierOptions, getmodifiers, updateModifier } from '@/app/Api/Services/Products';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function Modifier() {
  const [modifiers, setModifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addOptionModalVisible, setAddOptionModalVisible] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState(null);
  const [expandedModifiers, setExpandedModifiers] = useState({}); // State to track expanded modifiers
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    active: true,
    price: ''
  });
  const [optionForm, setOptionForm] = useState({
    name: '',
    price: ''
  });

  useEffect(() => {
    loadModifiers();
  }, []);

  const loadModifiers = async () => {
    try {
      setLoading(true);
      const response = await getmodifiers();
      console.log('Fetched modifiers:', response);
      if (response && response.status === 200) {
        setModifiers(response.data || []);
      } else if (response && Array.isArray(response)) {
        setModifiers(response);
      } else {
        Alert.alert('Error', 'Failed to load modifiers');
      }
    } catch (error) {
      console.log('Modifiers fetch error:', error);
      Alert.alert('Error', 'Something went wrong while fetching modifiers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadModifiers();
    setRefreshing(false);
  };

  const handleEdit = (modifier) => {
    setSelectedModifier(modifier);
    setEditForm({
      name: modifier.name || '',
      description: modifier.description || '',
      active: modifier.active !== undefined ? modifier.active : true,
      price: modifier.price?.toString() || ''
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Modifier name is required');
      return;
    }

    try {
      const updatedData = {
        ...editForm,
        price: parseFloat(editForm.price) || 0
      };
      const response = await updateModifier(selectedModifier.id, updatedData);
      if (response && response.status === 200) {
        const updatedModifiers = modifiers.map(mod => 
          mod.id === selectedModifier.id 
            ? { ...mod, ...updatedData }
            : mod
        );
        setModifiers(updatedModifiers);
        setEditModalVisible(false);
        setSelectedModifier(null);
        Alert.alert('Success', 'Modifier updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.log('Update error:', error);
      Alert.alert('Error', 'Failed to update modifier');
    }
  };

  const handleDelete = (modifier) => {
    Alert.alert(
      'Delete Modifier',
      `Delete "${modifier.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(modifier),
        },
      ],
    );
  };

  const confirmDelete = async (modifier) => {
    try {
      const updatedModifiers = modifiers.filter(mod => mod.id !== modifier.id);
      setModifiers(updatedModifiers);
      setExpandedModifiers(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[modifier.id];
        return newExpanded;
      });
      Alert.alert('Success', 'Modifier deleted');
    } catch (error) {
      console.log('Delete error:', error);
      Alert.alert('Error', 'Failed to delete modifier');
    }
  };

  const handleAddOption = (modifier) => {
    setSelectedModifier(modifier);
    setOptionForm({ name: '', price: '' });
    setAddOptionModalVisible(true);
  };

  const handleSaveOption = async () => {
    if (!optionForm.name.trim()) {
      Alert.alert('Error', 'Option name is required');
      return;
    }
    if (optionForm.name.length > 20) {
      Alert.alert('Error', 'Option name must be 20 characters or less');
      return;
    }

    try {
      const optionData = {
        name: optionForm.name.trim(),
        price: parseFloat(optionForm.price) || 0,
        modifierId: selectedModifier.id
      };
      const response = await addModifierOptions(optionData);
      if (response && response.status === 201) {
        const newOption = response.data || { ...optionData, id: Math.random() };
        const updatedModifiers = modifiers.map(mod => 
          mod.id === selectedModifier.id 
            ? { ...mod, options: [...(mod.options || []), newOption] }
            : mod
        );
        setModifiers(updatedModifiers);
        setAddOptionModalVisible(false);
        setOptionForm({ name: '', price: '' });
        setSelectedModifier(null);
        Alert.alert('Success', 'Modifier option added successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Add option error:', error);
      Alert.alert('Error', 'Failed to add modifier option');
    }
  };

  const toggleExpand = (modifierId) => {
    setExpandedModifiers(prev => ({
      ...prev,
      [modifierId]: !prev[modifierId]
    }));
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Free';
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const renderModifierItem = ({ item }) => (
    <View style={styles.modifierCard}>
      <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.cardHeader}>
        <View style={styles.modifierInfo}>
          <View style={styles.modifierHeader}>
            <Text style={styles.modifierName}>{item.name}</Text>
            <Ionicons 
              name={expandedModifiers[item.id] ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </View>
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          )}
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>
        <View style={[styles.statusDot, item.active ? styles.activeDot : styles.inactiveDot]} />
      </TouchableOpacity>

      {expandedModifiers[item.id] && item.options && item.options.length > 0 && (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsLabel}>Options</Text>
          <View style={styles.optionsList}>
            {item.options.map(option => (
              <View key={option.id} style={styles.optionItem}>
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionPrice}>{formatPrice(option.price)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={16} color="#e74c3c" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleAddOption(item)}
        >
          <Ionicons name="add-circle" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="options-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No modifiers found</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Modifiers</Text>
        <Text style={styles.subtitle}>{modifiers.length} total</Text>
      </View>

      <FlatList
        data={modifiers}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderModifierItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Edit Modifier Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Modifier</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Modifier name"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.description}
                onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                placeholder="Description (optional)"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={editForm.price}
                onChangeText={(text) => setEditForm({ ...editForm, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={editForm.active}
                  onValueChange={(value) => setEditForm({ ...editForm, active: value })}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.saveBtn]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Modifier Option Modal */}
      <Modal
        visible={addOptionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddOptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Modifier Option</Text>
              <TouchableOpacity onPress={() => setAddOptionModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={optionForm.name}
                onChangeText={(text) => setOptionForm({ ...optionForm, name: text })}
                placeholder="Option name"
                maxLength={20}
              />

              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={optionForm.price}
                onChangeText={(text) => setOptionForm({ ...optionForm, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => setAddOptionModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.saveBtn]}
                onPress={handleSaveOption}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  modifierCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modifierInfo: {
    flex: 1,
  },
  modifierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modifierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 8,
  },
  optionsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  optionsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
  },
  optionName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionPrice: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 12,
    marginTop: 4,
  },
  activeDot: {
    backgroundColor: '#27ae60',
  },
  inactiveDot: {
    backgroundColor: '#e74c3c',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  btn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  cancelBtn: {
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
  },
  saveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});