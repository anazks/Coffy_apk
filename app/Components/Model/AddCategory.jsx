import { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addCateGory } from '../../Api/Services/Products';

const AddCategory = ({ 
  visible, 
  onClose, 
  onCategoryAdded,
  categories = [] 
}) => {
  const [loading, setLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    active: true,
    color: '#4F46E5'
  });

  const colorPalette = [
    '#4F46E5', '#10B981', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1',
    '#F97316', '#84CC16', '#14B8A6', '#EAB308'
  ];

  const updateCategoryForm = (field, value) => {
    setCategoryForm(currentForm => ({
      ...currentForm,
      [field]: value
    }));
  };

  const resetForm = () => {
    setCategoryForm({ name: '', active: true, color: '#4F46E5' });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    // Check if category name already exists
    const categoryExists = categories.some(
      cat => cat.name.toLowerCase() === categoryForm.name.toLowerCase().trim()
    );

    if (categoryExists) {
      Alert.alert('Error', 'A category with this name already exists');
      return;
    }

    try {
      setLoading(true);
      const response = await addCateGory({
        name: categoryForm.name.trim(),
        active: categoryForm.active,
        color: categoryForm.color
      });

      if (response.success) {
        Alert.alert('Success', 'Category created successfully');
        resetForm();
        onCategoryAdded?.();
        onClose?.();
      } else {
        Alert.alert('Error', response.message || 'Failed to create category');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create category');
      console.error('Category creation error:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Icon name="folder" size={24} color="#10B981" />
                  <Text style={styles.modalTitle}>New Category</Text>
                </View>
                
                <View style={styles.formGroup}>
                  <View style={styles.labelContainer}>
                    <Icon name="label" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Category Name *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={categoryForm.name}
                    onChangeText={(text) => updateCategoryForm('name', text)}
                    placeholder="Enter category name"
                    maxLength={20}
                    autoFocus
                  />
                </View>

                <View style={[styles.formGroup, styles.switchContainer]}>
                  <View style={styles.labelContainer}>
                    <Icon name="toggle-on" size={16} color="#4B5563" style={styles.labelIcon} />
                    <Text style={styles.label}>Active</Text>
                  </View>
                  <Switch
                    value={categoryForm.active}
                    onValueChange={(value) => updateCategoryForm('active', value)}
                    thumbColor={categoryForm.active ? '#10B981' : '#f4f3f4'}
                    trackColor={{ false: '#E5E7EB', true: '#D1FAE5' }}
                  />
                </View>

                <ColorPicker 
                  selectedColor={categoryForm.color}
                  onColorSelect={(color) => updateCategoryForm('color', color)}
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
                    style={[styles.saveButton, {backgroundColor: '#10B981'}]}
                    onPress={handleSaveCategory}
                    disabled={loading || !categoryForm.name.trim()}
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
              </View>
            </TouchableWithoutFeedback>
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
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: '#10B981',
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

export default AddCategory;