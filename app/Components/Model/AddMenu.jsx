import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addMenuItem, getCategories, getmodifiers, getTaxes } from '../../Api/Services/Products';

const { height: screenHeight } = Dimensions.get('window');

const AddMenu = ({ 
  visible, 
  onClose, 
  onMenuAdded,
  categories = [],
  modifiers = []
}) => {
  const [loading, setLoading] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: '',
    categoryName: '',
    portion: 'Small',
    diet: 'Veg',
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
    taxName: ''
  });

  const [availableCategories, setAvailableCategories] = useState(categories);
  const [availableModifiers, setAvailableModifiers] = useState(modifiers);
  const [availableTaxes, setAvailableTaxes] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showModifierDropdown, setShowModifierDropdown] = useState(false);
  const [showTaxDropdown, setShowTaxDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const colorPalette = [
    '#4F46E5', '#10B981', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1',
    '#F97316', '#84CC16', '#14B8A6', '#EAB308'
  ];

  const portionOptions = ['Small', 'Medium', 'Large'];
  const dietOptions = ['Veg', 'Non-Veg', 'Egg'];

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    try {
      const [categoriesResponse, modifiersResponse, taxesResponse] = await Promise.all([
        getCategories(),
        getmodifiers(),
        getTaxes()
      ]);
      
      console.log(categoriesResponse,"---");

      if (categoriesResponse.length > 0) {
        setAvailableCategories(categoriesResponse || []);
      }
      if (modifiersResponse.status == 200) {
        setAvailableModifiers(modifiersResponse.data || []);
      }
      if (taxesResponse.status == 200) {
        const validTaxes = (taxesResponse.data || []).filter(tax => 
          tax && tax.id && tax.tax_name
        );
        setAvailableTaxes(validTaxes);
        
        if (menuForm.tax && !validTaxes.some(tax => tax.id.toString() === menuForm.tax)) {
          updateMenuForm('tax', '');
          updateMenuForm('taxName', '');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateMenuForm = (field, value) => {
    setMenuForm(currentForm => ({
      ...currentForm,
      [field]: value
    }));
  };

  const resetForm = () => {
    setMenuForm({
      name: '',
      category: '',
      categoryName: '',
      portion: 'Small',
      diet: 'Veg',
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
      taxName: ''
    });
    setShowCategoryModal(false);
    setShowModifierDropdown(false);
    setShowTaxDropdown(false);
    setSelectedCategory(null);
  };

  const handleSaveMenu = async () => {
    if (!menuForm.name.trim() || !menuForm.price || !menuForm.category) {
      Alert.alert('Error', 'Name, price, and category are required');
      return;
    }

    if (menuForm.tax) {
      const taxExists = availableTaxes.some(tax => tax.id.toString() === menuForm.tax);
      if (!taxExists) {
        Alert.alert('Error', 'The selected tax does not exist. Please select a valid tax.');
        return;
      }
    }

    try {
      setLoading(true);
      const menuData = {
        name: menuForm.name.trim(),
        category: parseInt(menuForm.category),
        portion: menuForm.portion,
        diet: menuForm.diet,
        price: parseFloat(menuForm.price),
        status: menuForm.status,
        stock_track: menuForm.stock_track,
        stock: menuForm.stock ? parseInt(menuForm.stock) : null,
        stock_alert: menuForm.stock_alert ? parseInt(menuForm.stock_alert) : null,
        description: menuForm.description.trim(),
        code: menuForm.code.trim(),
        barcode: menuForm.barcode.trim(),
        color: menuForm.color,
        modifier: menuForm.modifier ? parseInt(menuForm.modifier) : null
      };

      const response = await addMenuItem(menuData);
      console.log(response,"---");
      
      if (response.success || response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Menu item created successfully');
        resetForm();
        onMenuAdded?.();
        onClose?.();
      } else {
        const errorMessage = response.message || 
                            response.data?.message || 
                            'Failed to create menu item';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create menu item';
      
      if (errorMessage.includes('taxes') || errorMessage.includes('tax')) {
        Alert.alert('Tax Error', 'The selected tax is invalid. Please choose a different tax or contact support.');
      } else {
        Alert.alert('Error', errorMessage);
      }
      
      console.error('Menu item creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    updateMenuForm('category', category.id.toString());
    updateMenuForm('categoryName', category.name);
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handlePortionSelect = (portion) => {
    updateMenuForm('portion', portion);
  };

  const handleDietSelect = (diet) => {
    updateMenuForm('diet', diet);
  };

  const handleModifierSelect = (modifier) => {
    updateMenuForm('modifier', modifier.id.toString());
    updateMenuForm('modifierName', modifier.name);
    setShowModifierDropdown(false);
  };

  const handleTaxSelect = (tax) => {
    updateMenuForm('tax', tax.id.toString());
    updateMenuForm('taxName', tax.tax_name);
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
    <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.categoryModalContainer}>
          <View style={styles.categoryModalHeader}>
            <Text style={styles.categoryModalTitle}>Select Category</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Make FlatList fill the available space */}
          <View style={styles.categoryListContainer}>
            <FlatList
              data={availableCategories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategory?.id === item.id && styles.selectedCategoryItem
                  ]}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text style={[
                    styles.categoryItemText,
                    selectedCategory?.id === item.id && styles.selectedCategoryText
                  ]}>
                    {item.name}
                  </Text>
                  {selectedCategory?.id === item.id && (
                    <Icon name="check" size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.categoryListContent}
              style={styles.categoryList}
            />
          </View>
          
          <View style={styles.categoryModalFooter}>
            <TouchableOpacity 
              style={styles.cancelCategoryButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelCategoryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

  const CustomDropdown = ({ 
    label, 
    value, 
    displayValue, 
    placeholder, 
    options, 
    onSelect, 
    iconName,
    showDropdown,
    setShowDropdown,
    zIndex = 1 
  }) => (
    <View style={[styles.formGroup, { zIndex }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={displayValue ? styles.dropdownText : styles.dropdownPlaceholder}>
          {displayValue || placeholder}
        </Text>
        <Icon 
          name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={20} 
          color="#333" 
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
      <Text style={styles.label}>Color</Text>
      <View style={styles.colorGrid}>
        {colorPalette.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor
            ]}
            onPress={() => onColorSelect(color)}
          >
            {selectedColor === color && <Icon name="check" size={16} color="white" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  return (
    <>
      <Modal 
        visible={visible} 
        animationType="slide" 
        transparent
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          setShowModifierDropdown(false);
          setShowTaxDropdown(false);
        }}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>New Menu Item</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={handleClose}
                    >
                      <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Scrollable Content */}
                  <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                  >
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Item Name *</Text>
                      <TextInput
                        style={styles.input}
                        value={menuForm.name}
                        onChangeText={(text) => updateMenuForm('name', text)}
                        placeholder="Required"
                        maxLength={255}
                        autoFocus
                      />
                    </View>

                    {/* Category Selection Button */}
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Category *</Text>
                      <TouchableOpacity 
                        style={[
                          styles.dropdownButton,
                          !menuForm.categoryName && styles.placeholderButton
                        ]}
                        onPress={() => setShowCategoryModal(true)}
                      >
                        <Text style={menuForm.categoryName ? styles.dropdownText : styles.dropdownPlaceholder}>
                          {menuForm.categoryName || 'Select Category'}
                        </Text>
                        <Icon name="keyboard-arrow-down" size={20} color="#333" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Price *</Text>
                      <TextInput
                        style={styles.input}
                        value={menuForm.price}
                        onChangeText={(text) => updateMenuForm('price', text)}
                        placeholder="0.00"
                        keyboardType="numeric"
                      />
                    </View>

                    <CustomDropdown
                      label="Tax"
                      value={menuForm.tax}
                      displayValue={menuForm.taxName}
                      placeholder="Select Tax (Optional)"
                      options={availableTaxes}
                      onSelect={handleTaxSelect}
                      iconName="receipt"
                      showDropdown={showTaxDropdown}
                      setShowDropdown={setShowTaxDropdown}
                      zIndex={60}
                    />

                    <CustomDropdown
                      label="Modifier"
                      value={menuForm.modifier}
                      displayValue={menuForm.modifierName}
                      placeholder="Select Modifier (Optional)"
                      options={availableModifiers}
                      onSelect={handleModifierSelect}
                      iconName="tune"
                      showDropdown={showModifierDropdown}
                      setShowDropdown={setShowModifierDropdown}
                      zIndex={50}
                    />

                    <View style={[styles.formGroup, styles.switchContainer]}>
                      <Text style={styles.label}>Status</Text>
                      <Switch
                        value={menuForm.status}
                        onValueChange={(value) => updateMenuForm('status', value)}
                        thumbColor={menuForm.status ? '#4F46E5' : '#ccc'}
                        trackColor={{ false: '#ddd', true: '#E0E7FF' }}
                      />
                    </View>

                    <View style={[styles.formGroup, styles.switchContainer]}>
                      <Text style={styles.label}>Track Stock</Text>
                      <Switch
                        value={menuForm.stock_track}
                        onValueChange={(value) => updateMenuForm('stock_track', value)}
                        thumbColor={menuForm.stock_track ? '#4F46E5' : '#ccc'}
                        trackColor={{ false: '#ddd', true: '#E0E7FF' }}
                      />
                    </View>

                    {menuForm.stock_track && (
                      <>
                        <View style={styles.formGroup}>
                          <Text style={styles.label}>Stock Quantity</Text>
                          <TextInput
                            style={styles.input}
                            value={menuForm.stock}
                            onChangeText={(text) => updateMenuForm('stock', text)}
                            placeholder="Optional"
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.formGroup}>
                          <Text style={styles.label}>Stock Alert Level</Text>
                          <TextInput
                            style={styles.input}
                            value={menuForm.stock_alert}
                            onChangeText={(text) => updateMenuForm('stock_alert', text)}
                            placeholder="Optional"
                            keyboardType="numeric"
                          />
                        </View>
                      </>
                    )}

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Description</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={menuForm.description}
                        onChangeText={(text) => updateMenuForm('description', text)}
                        placeholder="Optional (max 1000 characters)"
                        multiline
                        numberOfLines={3}
                        maxLength={1000}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Code</Text>
                      <TextInput
                        style={styles.input}
                        value={menuForm.code}
                        onChangeText={(text) => updateMenuForm('code', text)}
                        placeholder="required (max 10 characters)"
                        maxLength={10}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Barcode</Text>
                      <TextInput
                        style={styles.input}
                        value={menuForm.barcode}
                        onChangeText={(text) => updateMenuForm('barcode', text)}
                        placeholder="Optional (max 100 characters)"
                        maxLength={100}
                      />
                    </View>

                    <ColorPicker 
                      selectedColor={menuForm.color}
                      onColorSelect={(color) => updateMenuForm('color', color)}
                    />
                  </ScrollView>

                  {/* Fixed Footer with Buttons */}
                  <View style={styles.modalFooter}>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={handleClose}
                        disabled={loading}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.saveButton, {backgroundColor: '#4F46E5'}]}
                        onPress={handleSaveMenu}
                        disabled={loading || !menuForm.name.trim() || !menuForm.price || !menuForm.category}
                      >
                        {loading ? (
                          <Text style={styles.saveButtonText}>Saving...</Text>
                        ) : (
                          <Text style={styles.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Category Selection Modal */}
      <CategorySelectionModal />
    </>
  );
};

const styles = StyleSheet.create({
  categoryModalContainer: {
  margin: 20,
  backgroundColor: '#fff',
  borderRadius: 12,
  maxHeight: screenHeight * 0.7,
  minHeight: 300,
  width: '100%',
  maxWidth: 500,
  flex: 0, // Important: don't let it expand beyond maxHeight
},

// Add this new style:
categoryListContainer: {
  flex: 1, // Take up all available space between header and footer
  minHeight: 200, // Ensure minimum scrollable area
},

categoryList: {
  flex: 1,
},

// Add this new style:
categoryListContent: {
  paddingBottom: 10, // Add some padding at the bottom
},

categoryModalFooter: {
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderTopWidth: 1,
  borderTopColor: '#eee',
  backgroundColor: '#fff',
  flexShrink: 0, // Prevent footer from shrinking
},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    height: screenHeight * 0.85,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'visible',
  },
  modalContent: {
    flex: 1,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  placeholderButton: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: screenHeight * 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: screenHeight * 0.3,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderColor: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  // Category Modal Styles
  categoryModalContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: screenHeight * 0.7,
    minHeight: 300,
    width: '100%',
    maxWidth: 500,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryList: {
    paddingVertical: 10,
    maxHeight: screenHeight * 0.5,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCategoryItem: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedCategoryText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  categoryModalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  cancelCategoryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  cancelCategoryButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});

export default AddMenu;