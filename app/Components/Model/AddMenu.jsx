import { useEffect, useState } from 'react';
import {
  Alert,
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showModifierDropdown, setShowModifierDropdown] = useState(false);
  const [showTaxDropdown, setShowTaxDropdown] = useState(false);

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
      
      console.log(categoriesResponse,"---")

      if (categoriesResponse.length > 0) {
        setAvailableCategories(categoriesResponse || []);
      }
      if (modifiersResponse.status == 200) {
        setAvailableModifiers(modifiersResponse.data || []);
      }
      if (taxesResponse.status == 200) {
        // Filter out any invalid taxes that might cause issues
        const validTaxes = (taxesResponse.data || []).filter(tax => 
          tax && tax.id && tax.tax_name
        );
        setAvailableTaxes(validTaxes);
        
        // If we had a tax selected that no longer exists, clear it
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
    setShowCategoryDropdown(false);
    setShowModifierDropdown(false);
    setShowTaxDropdown(false);
  };

  const handleSaveMenu = async () => {
    if (!menuForm.name.trim() || !menuForm.price || !menuForm.category) {
      Alert.alert('Error', 'Name, price, and category are required');
      return;
    }

    // Validate that the selected tax exists in available taxes
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
        modifier: menuForm.modifier ? parseInt(menuForm.modifier) : null,
        // Send taxes as an array, even if empty or with a single item
        taxes: menuForm.tax ? [parseInt(menuForm.tax)] : []
      };

      const response = await addMenuItem(menuData);
      console.log(response,"---")
      
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
      
      // Handle specific tax error
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
    setShowCategoryDropdown(false);
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
      <View style={styles.labelContainer}>
        <Icon name={iconName} size={16} color="#4B5563" style={styles.labelIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      
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
          color="#4B5563" 
        />
      </TouchableOpacity>

      {showDropdown && (
        <View style={[styles.dropdownOptions, { zIndex: zIndex + 10 }]}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
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
    <View style={styles.colorPicker}>
      <View style={styles.labelContainer}>
        <Icon name="palette" size={16} color="#4B5563" style={styles.labelIcon} />
        <Text style={styles.label}>Color</Text>
      </View>
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
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        setShowCategoryDropdown(false);
        setShowModifierDropdown(false);
        setShowTaxDropdown(false);
      }}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Icon name="restaurant" size={24} color="#4F46E5" />
                <Text style={styles.modalTitle}>New Menu Item</Text>
              </View>
              
              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollViewContent}
              >
                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <Icon name="label" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Item Name *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={menuForm.name}
                    onChangeText={(text) => updateMenuForm('name', text)}
                    placeholder="Required"
                    maxLength={255}
                    autoFocus
                  />
                </View>

                <CustomDropdown
                  label="Category *"
                  value={menuForm.category}
                  displayValue={menuForm.categoryName}
                  placeholder="Select Category"
                  options={availableCategories}
                  onSelect={handleCategorySelect}
                  iconName="category"
                  showDropdown={showCategoryDropdown}
                  setShowDropdown={setShowCategoryDropdown}
                  zIndex={70}
                />

                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <Icon name="attach-money" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Price *</Text>
                  </View>
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
                  <View style={styles.labelContainer}>
                    <Icon name="toggle-on" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Status</Text>
                  </View>
                  <Switch
                    value={menuForm.status}
                    onValueChange={(value) => updateMenuForm('status', value)}
                    thumbColor={menuForm.status ? '#4F46E5' : '#f4f3f4'}
                    trackColor={{ false: '#E5E7EB', true: '#E0E7FF' }}
                  />
                </View>

                <View style={[styles.formGroup, styles.switchContainer]}>
                  <View style={styles.labelContainer}>
                    <Icon name="storage" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Track Stock</Text>
                  </View>
                  <Switch
                    value={menuForm.stock_track}
                    onValueChange={(value) => updateMenuForm('stock_track', value)}
                    thumbColor={menuForm.stock_track ? '#4F46E5' : '#f4f3f4'}
                    trackColor={{ false: '#E5E7EB', true: '#E0E7FF' }}
                  />
                </View>

                {menuForm.stock_track && (
                  <>
                    <View style={styles.formGroup}>
                      <View style={styles.labelContainer}>
                        <Icon name="inventory" size={16} color="#4B5563" style={styles.labelIcon} />
                        <Text style={styles.label}>Stock Quantity</Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        value={menuForm.stock}
                        onChangeText={(text) => updateMenuForm('stock', text)}
                        placeholder="Optional"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <View style={styles.labelContainer}>
                        <Icon name="warning" size={16} color="#4B5563" style={styles.labelIcon} />
                        <Text style={styles.label}>Stock Alert Level</Text>
                      </View>
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
                  <View style={styles.labelContainer}>
                    <Icon name="description" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Description</Text>
                  </View>
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
                  <View style={styles.labelContainer}>
                    <Icon name="code" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Code</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={menuForm.code}
                    onChangeText={(text) => updateMenuForm('code', text)}
                    placeholder="Optional (max 10 characters)"
                    maxLength={10}
                  />
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <Icon name="qr-code" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Barcode</Text>
                  </View>
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
                      <>
                        <Icon name="save" size={18} color="white" style={styles.buttonIcon} />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  formGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  labelIcon: {
    marginRight: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorPicker: {
    marginBottom: 20,
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
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderColor: '#4B5563',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default AddMenu;