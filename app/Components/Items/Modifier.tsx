import { getmodifiers } from '@/app/Api/Services/Products';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
  const [selectedModifier, setSelectedModifier] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    active: true,
    price: ''
  });

  useEffect(() => {
    loadModifiers();
  }, []);

  const loadModifiers = async () => {
    try {
      setLoading(true);
      const response = await getmodifiers();
      if (response && response.status === 200) {
        setModifiers(response.data || []);
      } else if (response && Array.isArray(response)) {
        setModifiers(response);
      } else {
        Alert.alert('Error', 'Failed to load modifiers');
      }
    } catch (error) {
      console.error('Modifiers fetch error:', error);
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
      Alert.alert('Validation Error', 'Modifier name is required');
      return;
    }

    try {
      // TODO: Replace with your actual update API call
      // const response = await updateModifier(selectedModifier.id, editForm);
      
      // For now, update locally (replace with actual API call)
      const updatedModifiers = modifiers.map(mod => 
        mod.id === selectedModifier.id 
          ? { ...mod, ...editForm, price: parseFloat(editForm.price) || 0 }
          : mod
      );
      setModifiers(updatedModifiers);
      
      setEditModalVisible(false);
      setSelectedModifier(null);
      Alert.alert('Success', 'Modifier updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update modifier');
    }
  };

  const handleDelete = (modifier) => {
    Alert.alert(
      'Delete Modifier',
      `Are you sure you want to delete "${modifier.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
      // TODO: Replace with your actual delete API call
      // const response = await deleteModifier(modifier.id);
      
      // For now, delete locally (replace with actual API call)
      const updatedModifiers = modifiers.filter(mod => mod.id !== modifier.id);
      setModifiers(updatedModifiers);
      
      Alert.alert('Success', 'Modifier deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete modifier');
    }
  };

  const toggleStatus = async (modifier) => {
    try {
      // TODO: Replace with your actual update API call
      // const response = await updateModifier(modifier.id, { active: !modifier.active });
      
      // For now, update locally (replace with actual API call)
      const updatedModifiers = modifiers.map(mod => 
        mod.id === modifier.id 
          ? { ...mod, active: !mod.active }
          : mod
      );
      setModifiers(updatedModifiers);
    } catch (error) {
      console.error('Status toggle error:', error);
      Alert.alert('Error', 'Failed to update modifier status');
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Free';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatusBadge = ({ isActive }) => (
    <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
      <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
        {isActive ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );

  const renderModifierItem = ({ item }) => (
    <View style={styles.modifierCard}>
      <View style={styles.modifierHeader}>
        <View style={styles.modifierInfo}>
          <Text style={styles.modifierName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.modifierDescription}>{item.description}</Text>
          )}
          <View style={styles.modifierMeta}>
            <Text style={styles.modifierPrice}>{formatPrice(item.price)}</Text>
            {item.date_added && (
              <Text style={styles.modifierDate}>
                Added: {formatDate(item.date_added)}
              </Text>
            )}
          </View>
        </View>
        <StatusBadge isActive={item.active} />
      </View>

      <View style={styles.modifierActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => toggleStatus(item)}
        >
          <Ionicons 
            name={item.active ? "pause-circle" : "play-circle"} 
            size={20} 
            color="#2563EB" 
          />
          <Text style={styles.statusButtonText}>
            {item.active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color="#059669" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="options-outline" size={64} color="#94A3B8" />
      <Text style={styles.emptyTitle}>No Modifiers Found</Text>
      <Text style={styles.emptyText}>Start by adding your first modifier</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading modifiers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Modifiers</Text>
        <Text style={styles.pageSubtitle}>
          {modifiers.length} {modifiers.length === 1 ? 'modifier' : 'modifiers'} found
        </Text>
      </View>

      {/* Modifiers List */}
      <FlatList
        data={modifiers}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderModifierItem}
        contentContainerStyle={[
          styles.listContainer,
          modifiers.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Modifier</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Modifier Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  placeholder="Enter modifier name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                  placeholder="Enter modifier description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.price}
                  onChangeText={(text) => setEditForm({ ...editForm, price: text })}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.inputLabel}>Active Status</Text>
                  <Switch
                    value={editForm.active}
                    onValueChange={(value) => setEditForm({ ...editForm, active: value })}
                    trackColor={{ false: '#F1F5F9', true: '#DCFCE7' }}
                    thumbColor={editForm.active ? '#059669' : '#64748B'}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  listContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  modifierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  modifierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modifierInfo: {
    flex: 1,
    marginRight: 12,
  },
  modifierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  modifierDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  modifierMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modifierPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  modifierDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  inactiveText: {
    color: '#DC2626',
  },
  modifierActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  statusButton: {
    backgroundColor: '#EFF6FF',
  },
  statusButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  editButton: {
    backgroundColor: '#F0FDF4',
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});