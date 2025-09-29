import { deleteCategory, getCategories, updateCategory } from '@/app/Api/Services/Products';
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

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response && Array.isArray(response)) {
        setCategories(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        Alert.alert('Error', 'Failed to load categories');
      }
    } catch (error) {
      console.log('Categories fetch error:', error);
      Alert.alert('Error', 'Something went wrong while fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      active: category.active
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      const response = await updateCategory(selectedCategory.id, editForm);
      if (response && response.status === 200) {
        const updatedCategories = categories.map(cat => 
          cat.id === selectedCategory.id 
            ? { ...cat, ...editForm }
            : cat
        );
        setCategories(updatedCategories);
        setEditModalVisible(false);
        setSelectedCategory(null);
        Alert.alert('Success', 'Category updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.log('Update error:', error);
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const handleDelete = (category) => {
    Alert.alert(
      'Delete Category',
      `Delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteCategory(category.id);
              if (response && response.status === 204) {
                const updatedCategories = categories.filter(cat => cat.id !== category.id);
                setCategories(updatedCategories);
                Alert.alert('Success', 'Category deleted');
              } else {
                throw new Error('Invalid response from server');
              }
            } catch (error) {
              console.log('Delete error:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ],
    );
  };

  const toggleStatus = async (category) => {
    try {
      const updatedCategories = categories.map(cat => 
        cat.id === category.id 
          ? { ...cat, active: !cat.active }
          : cat
      );
      setCategories(updatedCategories);
    } catch (error) {
      console.log('Status toggle error:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryCard}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.itemCount}>{item.items_count} items</Text>
        </View>
        <View style={[styles.statusDot, item.active ? styles.activeDot : styles.inactiveDot]} />
      </View>

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
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No categories found</Text>
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
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>{categories.length} total</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Category</Text>
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
                placeholder="Category name"
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
  categoryCard: {
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
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 13,
    color: '#666',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 12,
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