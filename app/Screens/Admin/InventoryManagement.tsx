import Categories from '@/app/Components/Items/Categories';
import Modifier from '@/app/Components/Items/Modifier';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCategories, getmodifiers } from '../../Api/Services/Products';
import AddCategory from '../../Components/Model/AddCategory';
import AddMenu from '../../Components/Model/AddMenu';
import AddModifiers from '../../Components/Model/AddModifiers';

const { width } = Dimensions.get('window');

const InventoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [showAddModifier, setShowAddModifier] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('categories'); // Default to categories tab

  useEffect(() => {
    fetchCategories();
    fetchModifiers();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchModifiers = async () => {
    try {
      const response = await getmodifiers();
      if (response.success) {
        setModifiers(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching modifiers:', error);
    }
  };

  const handleCategoryAdded = () => {
    fetchCategories();
  };

  const handleModifierAdded = () => {
    fetchModifiers();
  };

  const handleMenuAdded = () => {
    console.log('Menu item added successfully');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Icon name="inventory" size={28} color="#4F46E5" />
          </View>
          <Text style={styles.title}>Inventory Management</Text>
        </View>
      </View>
      
      {/* Quick Actions Section */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsContainer}
        >
          {/* Add Menu Item Card */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.menuCard]}
            onPress={() => setShowAddMenu(true)}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Icon name="restaurant" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.optionTitle}>Add Menu Item</Text>
            <Text style={styles.optionDescription}>Create new menu items</Text>
          </TouchableOpacity>

          {/* Add Category Card */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.categoryCard]}
            onPress={() => setShowAddCategory(true)}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Icon name="category" size={24} color="#10B981" />
            </View>
            <Text style={styles.optionTitle}>Add Category</Text>
            <Text style={styles.optionDescription}>Organize items</Text>
          </TouchableOpacity>

          {/* Add Modifier Card */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.modifierCard]}
            onPress={() => setShowAddModifier(true)}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#FFFBEB' }]}>
              <Icon name="tune" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.optionTitle}>Add Modifier</Text>
            <Text style={styles.optionDescription}>Create variations</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'modifiers' && styles.activeTab]}
          onPress={() => setActiveTab('modifiers')}
        >
          <Text style={[styles.tabText, activeTab === 'modifiers' && styles.activeTabText]}>
            Modifiers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'categories' ? (
          <Categories categories={categories} onRefresh={fetchCategories} />
        ) : (
          <Modifier modifiers={modifiers} onRefresh={fetchModifiers} />
        )}
      </View>

      {/* Modals */}
      <AddMenu
        visible={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        onMenuAdded={handleMenuAdded}
        categories={categories}
        modifiers={modifiers}
      />

      <AddCategory
        visible={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onCategoryAdded={handleCategoryAdded}
        categories={categories}
      />

      <AddModifiers
        visible={showAddModifier}
        onClose={() => setShowAddModifier(false)}
        onModifierAdded={handleModifierAdded}
        modifiers={modifiers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 16,
    paddingRight: 16,
  },
  optionCard: {
    width: width * 0.65,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuCard: {
    borderTopWidth: 4,
    borderTopColor: '#4F46E5',
  },
  categoryCard: {
    borderTopWidth: 4,
    borderTopColor: '#10B981',
  },
  modifierCard: {
    borderTopWidth: 4,
    borderTopColor: '#F59E0B',
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

export default InventoryManagement;