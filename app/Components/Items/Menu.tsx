import { getMenuItems, updateMenuItem, deleteMenu } from '@/app/Api/Services/Products';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    diet: '',
    portion: '',
    discountPrice: '',
    is_favorite: false,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(items || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      price: item.price.toString(),
      diet: item.diet,
      portion: item.portion,
      discountPrice: item.discountPrice ? item.discountPrice.toString() : '',
      is_favorite: item.is_favorite,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.price.trim()) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }
    try {
      const updatedData = {
        name: editForm.name,
        price: parseFloat(editForm.price),
        diet: editForm.diet,
        portion: editForm.portion,
        discountPrice: editForm.discountPrice ? parseFloat(editForm.discountPrice) : null,
        is_favorite: editForm.is_favorite,
      };
      const response = await updateMenuItem(selectedItem.id, updatedData);
      if (response && response.status === 200) {
        const updatedItems = menuItems.map((item) =>
          item.id === selectedItem.id
            ? { ...item, ...updatedData }
            : item
        );
        setMenuItems(updatedItems);
        setEditModalVisible(false);
        setSelectedItem(null);
        Alert.alert('Success', 'Menu item updated');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update menu item');
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteMenu(item.id);
              if (response && response.status === 204) {
                const updatedItems = menuItems.filter((i) => i.id !== item.id);
                setMenuItems(updatedItems);
                Alert.alert('Success', 'Menu item deleted');
              } else {
                throw new Error('Invalid response from server');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.badges}>
          {item.is_favorite && (
            <Ionicons name="heart" size={16} color="#EF4444" style={styles.badge} />
          )}
          {item.discountPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemInfo}>
          {item.diet} • {item.portion}
        </Text>
        <Text style={styles.itemPrice}>
          ₹{item.discountPrice || item.price}
          {item.discountPrice && (
            <Text style={styles.originalPrice}> ₹{item.price}</Text>
          )}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
          accessible
          accessibilityLabel={`Edit ${item.name}`}
        >
          <Ionicons name="create-outline" size={20} color="#22C55E" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
          accessible
          accessibilityLabel={`Delete ${item.name}`}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={48} color="#6B7280" />
      <Text style={styles.emptyText}>No menu items found</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Menu Items</Text>
        <Text style={styles.pageSubtitle}>{menuItems.length} items</Text>
      </View>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmptyState}
      />
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Menu Item</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
                accessible
                accessibilityLabel="Close edit modal"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter item name"
                autoCapitalize="words"
                accessible
                accessibilityLabel="Menu item name input"
              />
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.price}
                onChangeText={(text) => setEditForm({ ...editForm, price: text })}
                placeholder="Enter price"
                keyboardType="numeric"
                accessible
                accessibilityLabel="Menu item price input"
              />
              <Text style={styles.inputLabel}>Discount Price (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.discountPrice}
                onChangeText={(text) => setEditForm({ ...editForm, discountPrice: text })}
                placeholder="Enter discount price"
                keyboardType="numeric"
                accessible
                accessibilityLabel="Menu item discount price input"
              />
              <Text style={styles.inputLabel}>Diet</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.diet}
                onChangeText={(text) => setEditForm({ ...editForm, diet: text })}
                placeholder="Enter diet (e.g., Veg, Non-Veg)"
                accessible
                accessibilityLabel="Menu item diet input"
              />
              <Text style={styles.inputLabel}>Portion</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.portion}
                onChangeText={(text) => setEditForm({ ...editForm, portion: text })}
                placeholder="Enter portion (e.g., Small, Medium)"
                accessible
                accessibilityLabel="Menu item portion input"
              />
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => setEditForm({ ...editForm, is_favorite: !editForm.is_favorite })}
                accessible
                accessibilityLabel={editForm.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Ionicons
                  name={editForm.is_favorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={editForm.is_favorite ? '#EF4444' : '#6B7280'}
                />
                <Text style={styles.favoriteButtonText}>
                  {editForm.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                accessible
                accessibilityLabel="Cancel edit"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
                accessible
                accessibilityLabel="Save menu item changes"
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    marginLeft: 4,
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  originalPrice: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  favoriteButtonText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default Menu;