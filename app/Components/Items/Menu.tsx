import { deleteMenu, getMenuItems, updateMenuItem } from '@/app/Api/Services/Products';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCategories, getmodifiers, getTaxes } from '../../Api/Services/Products';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    categoryName: '',
    portion: '',
    diet: '',
    price: '',
    status: true,
    stock_track: false,
    stock: '',
    stock_alert: '',
    description: '',
    code: '',
    barcode: '',
    color: '#4F46E5',
    modifier: '',
    modifierName: '',
    tax: '',
    taxName: '',
    is_favorite: false,
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableModifiers, setAvailableModifiers] = useState([]);
  const [availableTaxes, setAvailableTaxes] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showModifierDropdown, setShowModifierDropdown] = useState(false);
  const [showTaxDropdown, setShowTaxDropdown] = useState(false);

  const colorPalette = [
    '#4F46E5', '#10B981', '#EF4444', '#F59E0B',
    '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1',
    '#F97316', '#84CC16', '#14B8A6', '#EAB308',
  ];

  useEffect(() => {
    fetchMenuItems();
    fetchDropdownData();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(items || []);
    } catch (error) {
      console.log('Error fetching menu items:', error);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [categoriesResponse, modifiersResponse, taxesResponse] = await Promise.all([
        getCategories(),
        getmodifiers(),
        getTaxes(),
      ]);
      setAvailableCategories(categoriesResponse || []);
      setAvailableModifiers(modifiersResponse.data || []);
      setAvailableTaxes((taxesResponse.data || []).filter(tax => tax && tax.id && tax.tax_name));
    } catch (error) {
      console.log('Error fetching dropdown data:', error);
      Alert.alert('Error', 'Failed to load dropdown data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMenuItems(), fetchDropdownData()]);
    setRefreshing(false);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      category: item.category?.id?.toString() || '',
      categoryName: item.category?.name || '',
      portion: item.portion || 'Small',
      diet: item.diet || 'Veg',
      price: item.price.toString(),
      status: item.status ?? true,
      stock_track: item.stock_track ?? false,
      stock: item.stock?.toString() || '',
      stock_alert: item.stock_alert?.toString() || '',
      description: item.description || '',
      code: item.code || '',
      barcode: item.barcode || '',
      color: item.color || '#4F46E5',
      modifier: item.modifier?.id?.toString() || '',
      modifierName: item.modifier?.name || '',
      tax: item.tax?.id?.toString() || '',
      taxName: item.tax?.tax_name || '',
      is_favorite: item.is_favorite ?? false,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.price || !editForm.category || !editForm.code.trim()) {
      Alert.alert('Error', 'Name, price, category, and code are required');
      return;
    }
    try {
      const updatedData = {
        name: editForm.name.trim(),
        category: parseInt(editForm.category),
        portion: editForm.portion,
        diet: editForm.diet,
        price: parseFloat(editForm.price),
        status: editForm.status,
        stock_track: editForm.stock_track,
        stock: editForm.stock ? parseInt(editForm.stock) : null,
        stock_alert: editForm.stock_alert ? parseInt(editForm.stock_alert) : null,
        description: editForm.description.trim(),
        code: editForm.code.trim(),
        barcode: editForm.barcode.trim(),
        color: editForm.color,
        modifier: editForm.modifier ? parseInt(editForm.modifier) : null,
        tax: editForm.tax ? parseInt(editForm.tax) : null,
        is_favorite: editForm.is_favorite,
      };
      const response = await updateMenuItem(selectedItem.id, updatedData);
      if (response && response.status === 200) {
        const updatedItems = menuItems.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                ...updatedData,
                category: { id: updatedData.category, name: editForm.categoryName },
                modifier: updatedData.modifier ? { id: updatedData.modifier, name: editForm.modifierName } : null,
                tax: updatedData.tax ? { id: updatedData.tax, name: editForm.taxName } : null,
              }
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
      console.log('Update error:', error);
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
                setMenuItems(menuItems.filter((i) => i.id !== item.id));
                Alert.alert('Success', 'Menu item deleted');
              } else {
                throw new Error('Invalid response from server');
              }
            } catch (error) {
              console.log('Delete error:', error);
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const updateEditForm = (field, value) => {
    setEditForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCategorySelect = (category) => {
    updateEditForm('category', category.id.toString());
    updateEditForm('categoryName', category.name);
    setShowCategoryModal(false);
  };

  const handleModifierSelect = (modifier) => {
    updateEditForm('modifier', modifier.id.toString());
    updateEditForm('modifierName', modifier.name);
    setShowModifierDropdown(false);
  };

  const handleTaxSelect = (tax) => {
    updateEditForm('tax', tax.id.toString());
    updateEditForm('taxName', tax.tax_name);
    setShowTaxDropdown(false);
  };

  const CategorySelectionModal = () => (
    <Modal
      visible={showCategoryModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowCategoryModal(false)}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.categoryModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryListContainer}>
            {availableCategories.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#6B7280', padding: 20 }}>
                No categories available
              </Text>
            ) : (
              <FlatList
                data={availableCategories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      editForm.category === item.id.toString() && styles.selectedCategoryItem,
                    ]}
                    onPress={() => handleCategorySelect(item)}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        editForm.category === item.id.toString() && styles.selectedCategoryText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {editForm.category === item.id.toString() && (
                      <Ionicons name="checkmark" size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.categoryListContent}
                style={styles.categoryList}
              />
            )}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const CustomDropdown = ({ label, value, displayValue, placeholder, options, onSelect, showDropdown, setShowDropdown, zIndex = 1 }) => (
    <View style={[styles.formGroup, { zIndex }]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, !displayValue && styles.placeholderButton]}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={displayValue ? styles.dropdownText : styles.dropdownPlaceholder}>
          {displayValue || placeholder}
        </Text>
        <Ionicons
          name={showDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      {showDropdown && (
        <View style={[styles.dropdownOptions, { zIndex: zIndex + 100 }]}>
          <ScrollView
            style={styles.dropdownScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.dropdownOption}
                onPress={() => onSelect(option)}
              >
                <Text style={styles.dropdownOptionText}>
                  {option.name || option.tax_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const ColorPicker = ({ selectedColor, onColorSelect }) => (
    <View style={styles.formGroup}>
      <Text style={styles.inputLabel}>Color</Text>
      <View style={styles.colorGrid}>
        {colorPalette.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor,
            ]}
            onPress={() => onColorSelect(color)}
          >
            {selectedColor === color && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.badges}>
          {item.is_favorite && (
            <Ionicons name="heart" size={16} color="#EF4444" style={styles.badge} />
          )}
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemInfo}>
          {item.diet} • {item.portion} • {item.category?.name || 'No Category'}
        </Text>
        <Text style={styles.itemPrice}>
          ₹{item.price}
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
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => updateEditForm('name', text)}
                placeholder="Enter item name"
                autoCapitalize="words"
                accessible
                accessibilityLabel="Menu item name input"
              />
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, !editForm.categoryName && styles.placeholderButton]}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={editForm.categoryName ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {editForm.categoryName || 'Select Category'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.price}
                onChangeText={(text) => updateEditForm('price', text)}
                placeholder="Enter price"
                keyboardType="numeric"
                accessible
                accessibilityLabel="Menu item price input"
              />
              <CustomDropdown
                label="Tax"
                value={editForm.tax}
                displayValue={editForm.taxName}
                placeholder="Select Tax (Optional)"
                options={availableTaxes}
                onSelect={handleTaxSelect}
                showDropdown={showTaxDropdown}
                setShowDropdown={setShowTaxDropdown}
                zIndex={60}
              />
              <CustomDropdown
                label="Modifier"
                value={editForm.modifier}
                displayValue={editForm.modifierName}
                placeholder="Select Modifier (Optional)"
                options={availableModifiers}
                onSelect={handleModifierSelect}
                showDropdown={showModifierDropdown}
                setShowDropdown={setShowModifierDropdown}
                zIndex={50}
              />
              <View style={[styles.formGroup, styles.switchContainer]}>
                <Text style={styles.inputLabel}>Status</Text>
                <Switch
                  value={editForm.status}
                  onValueChange={(value) => updateEditForm('status', value)}
                  thumbColor={editForm.status ? '#3B82F6' : '#ccc'}
                  trackColor={{ false: '#ddd', true: '#DBEAFE' }}
                />
              </View>
              <View style={[styles.formGroup, styles.switchContainer]}>
                <Text style={styles.inputLabel}>Track Stock</Text>
                <Switch
                  value={editForm.stock_track}
                  onValueChange={(value) => updateEditForm('stock_track', value)}
                  thumbColor={editForm.stock_track ? '#3B82F6' : '#ccc'}
                  trackColor={{ false: '#ddd', true: '#DBEAFE' }}
                />
              </View>
              {editForm.stock_track && (
                <>
                  <Text style={styles.inputLabel}>Stock Quantity</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.stock}
                    onChangeText={(text) => updateEditForm('stock', text)}
                    placeholder="Enter stock quantity"
                    keyboardType="numeric"
                    accessible
                    accessibilityLabel="Menu item stock quantity input"
                  />
                  <Text style={styles.inputLabel}>Stock Alert Level</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.stock_alert}
                    onChangeText={(text) => updateEditForm('stock_alert', text)}
                    placeholder="Enter stock alert level"
                    keyboardType="numeric"
                    accessible
                    accessibilityLabel="Menu item stock alert level input"
                  />
                </>
              )}
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editForm.description}
                onChangeText={(text) => updateEditForm('description', text)}
                placeholder="Enter description (max 1000 characters)"
                multiline
                numberOfLines={3}
                maxLength={1000}
                accessible
                accessibilityLabel="Menu item description input"
              />
              <Text style={styles.inputLabel}>Code *</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.code}
                onChangeText={(text) => updateEditForm('code', text)}
                placeholder="Enter code (max 10 characters)"
                maxLength={10}
                accessible
                accessibilityLabel="Menu item code input"
              />
              <Text style={styles.inputLabel}>Barcode</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.barcode}
                onChangeText={(text) => updateEditForm('barcode', text)}
                placeholder="Enter barcode (max 100 characters)"
                maxLength={100}
                accessible
                accessibilityLabel="Menu item barcode input"
              />
              <ColorPicker
                selectedColor={editForm.color}
                onColorSelect={(color) => updateEditForm('color', color)}
              />
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => updateEditForm('is_favorite', !editForm.is_favorite)}
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
      <CategorySelectionModal />
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  formGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  placeholderButton: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1F2937',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#6B7280',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#1F2937',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#1F2937',
  },
  categoryModalContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    width: '90%',
    maxWidth: 500,
  },
  categoryListContainer: {
    flex: 1,
    minHeight: 200,
  },
  categoryList: {
    flex: 1,
  },
  categoryListContent: {
    paddingBottom: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCategoryItem: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  selectedCategoryText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default Menu;