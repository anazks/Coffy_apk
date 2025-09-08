import { useState } from 'react';
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
import { addModifier } from '../../Api/Services/Products';

const AddModifiers = ({ 
  visible, 
  onClose, 
  onModifierAdded,
  modifiers = [] 
}) => {
  const [loading, setLoading] = useState(false);
  const [modifierForm, setModifierForm] = useState({
    name: '',
    price: '',
    status: true,
    options: [{ name: '', price: '' }],
    color: '#F59E0B'
  });

  const colorPalette = [
    '#4F46E5', '#10B981', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1',
    '#F97316', '#84CC16', '#14B8A6', '#EAB308'
  ];

  const updateModifierForm = (field, value) => {
    setModifierForm(currentForm => ({
      ...currentForm,
      [field]: value
    }));
  };

  const resetForm = () => {
    setModifierForm({
      name: '',
      price: '',
      status: true,
      options: [{ name: '', price: '' }],
      color: '#F59E0B'
    });
  };

  const addModifierOption = () => {
    setModifierForm({
      ...modifierForm,
      options: [...modifierForm.options, { name: '', price: '' }]
    });
  };

  const removeModifierOption = (index) => {
    if (modifierForm.options.length > 1) {
      const newOptions = modifierForm.options.filter((_, i) => i !== index);
      setModifierForm({ ...modifierForm, options: newOptions });
    }
  };

  const updateModifierOption = (index, field, value) => {
    const newOptions = modifierForm.options.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    );
    setModifierForm({ ...modifierForm, options: newOptions });
  };

  const handleSaveModifier = async () => {
    // Validate modifier name
    if (!modifierForm.name.trim()) {
      Alert.alert('Error', 'Modifier name is required');
      return;
    }

    // Check if modifier name already exists
    const modifierExists = modifiers.some(
      mod => mod.name.toLowerCase() === modifierForm.name.toLowerCase().trim()
    );

    if (modifierExists) {
      Alert.alert('Error', 'A modifier with this name already exists');
      return;
    }

    // Validate options
    const emptyOptions = modifierForm.options.filter(opt => !opt.name.trim());
    if (emptyOptions.length > 0) {
      Alert.alert('Error', 'All option names are required');
      return;
    }

    // Check for duplicate option names
    const optionNames = modifierForm.options.map(opt => opt.name.toLowerCase().trim());
    const uniqueOptionNames = new Set(optionNames);
    if (optionNames.length !== uniqueOptionNames.size) {
      Alert.alert('Error', 'Option names must be unique');
      return;
    }

    try {
      setLoading(true);
      const modifierData = {
        name: modifierForm.name.trim(),
        price: modifierForm.price ? parseFloat(modifierForm.price) : 0,
        status: modifierForm.status,
        options: modifierForm.options.map(option => ({
          name: option.name.trim(),
          price: option.price ? parseFloat(option.price) : 0
        })),
        color: modifierForm.color
      };

      const response = await addModifier(modifierData);

      if (response.success) {
        Alert.alert('Success', 'Modifier created successfully');
        resetForm();
        onModifierAdded?.();
        onClose?.();
      } else {
        Alert.alert('Error', response.message || 'Failed to create modifier');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create modifier');
      console.error('Modifier creation error:', error);
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
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.modalHeader}>
                    <Icon name="tune" size={24} color="#F59E0B" />
                    <Text style={styles.modalTitle}>New Modifier</Text>
                  </View>
                  
                  <View style={styles.formGroup}>
                    <View style={styles.labelContainer}>
                      <Icon name="label" size={16} color="#4B5563" style={styles.labelIcon} />
                      <Text style={styles.label}>Modifier Name *</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={modifierForm.name}
                      onChangeText={(text) => updateModifierForm('name', text)}
                      placeholder="Required"
                      maxLength={255}
                      autoFocus
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <View style={styles.labelContainer}>
                      <Icon name="attach-money" size={16} color="#4B5563" style={styles.labelIcon} />
                      <Text style={styles.label}>Base Price</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      value={modifierForm.price}
                      onChangeText={(text) => updateModifierForm('price', text)}
                      placeholder="0.00"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, styles.switchContainer]}>
                    <View style={styles.labelContainer}>
                      <Icon name="toggle-on" size={16} color="#4B5563" style={styles.labelIcon} />
                      <Text style={styles.label}>Status</Text>
                    </View>
                    <Switch
                      value={modifierForm.status}
                      onValueChange={(value) => updateModifierForm('status', value)}
                      thumbColor={modifierForm.status ? '#F59E0B' : '#f4f3f4'}
                      trackColor={{ false: '#E5E7EB', true: '#FEF3C7' }}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <View style={styles.labelContainer}>
                      <Icon name="list" size={16} color="#4B5563" style={styles.labelIcon} />
                      <Text style={styles.label}>Options *</Text>
                    </View>
                    {modifierForm.options.map((option, index) => (
                      <View key={index} style={styles.optionRow}>
                        <TextInput
                          style={[styles.input, styles.optionInput]}
                          value={option.name}
                          onChangeText={(text) => updateModifierOption(index, 'name', text)}
                          placeholder="Option name"
                          maxLength={20}
                        />
                        <TextInput
                          style={[styles.input, styles.priceInput]}
                          value={option.price}
                          onChangeText={(text) => updateModifierOption(index, 'price', text)}
                          placeholder="0.00"
                          keyboardType="numeric"
                        />
                        {modifierForm.options.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeOptionButton}
                            onPress={() => removeModifierOption(index)}
                          >
                            <Icon name="remove" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addOptionButton}
                      onPress={addModifierOption}
                    >
                      <Icon name="add" size={20} color="#10B981" />
                      <Text style={styles.addOptionText}>Add Option</Text>
                    </TouchableOpacity>
                  </View>

                  <ColorPicker 
                    selectedColor={modifierForm.color}
                    onColorSelect={(color) => updateModifierForm('color', color)}
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
                      style={[styles.saveButton, {backgroundColor: '#F59E0B'}]}
                      onPress={handleSaveModifier}
                      disabled={loading || !modifierForm.name.trim() || modifierForm.options.some(opt => !opt.name.trim())}
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
    maxHeight: '90%',
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
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  optionInput: {
    flex: 2,
  },
  priceInput: {
    flex: 1,
  },
  removeOptionButton: {
    padding: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
  },
  addOptionText: {
    color: '#10B981',
    fontWeight: '500',
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
    backgroundColor: '#F59E0B',
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

export default AddModifiers;