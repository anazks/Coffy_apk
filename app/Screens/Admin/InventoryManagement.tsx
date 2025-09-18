import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCategories, getmodifiers } from '../../Api/Services/Products';
import Categories from '../../Components/Items/Categories';
import Menu from '../../Components/Items/Menu';
import Modifier from '../../Components/Items/Modifier';
import AddCategory from '../../Components/Model/AddCategory';
import AddMenu from '../../Components/Model/AddMenu';
import AddModifiers from '../../Components/Model/AddModifiers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const InventoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [showAddModifier, setShowAddModifier] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCategories();
    fetchModifiers();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
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

  const handleTabPress = (tab) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      setSearchQuery(''); // Reset search when switching tabs
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Filter logic can be implemented in the respective components (Categories, Modifier, Menu)
  };

  const actionButtons = [
    {
      id: 'menu',
      icon: 'restaurant-outline',
      label: 'Menu',
      color: '#2563EB',
      onPress: () => setShowAddMenu(true),
      accessibilityLabel: 'Add new menu item',
    },
    {
      id: 'category',
      icon: 'pricetag-outline',
      label: 'Category',
      color: '#16A34A',
      onPress: () => setShowAddCategory(true),
      accessibilityLabel: 'Add new category',
    },
    {
      id: 'modifier',
      icon: 'options-outline',
      label: 'Modifier',
      color: '#D97706',
      onPress: () => setShowAddModifier(true),
      accessibilityLabel: 'Add new modifier',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Inventory Management</Text> */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}`}
            value={searchQuery}
            onChangeText={handleSearch}
            accessibilityLabel={`Search ${activeTab}`}
          />
        </View>
      </View>
      <View style={styles.tabContainer}>
        <View style={styles.tabIndicatorContainer}>
          {['categories', 'modifiers', 'menu'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
              accessible
              accessibilityLabel={`View ${tab}`}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [
                {
                  translateX: activeTab === 'categories' ? 0 : activeTab === 'modifiers' ? width * (isTablet ? 0.31 : 0.33) : width * (isTablet ? 0.62 : 0.66),
                },
              ],
              width: isTablet ? '31%' : '33%',
            },
          ]}
        />
      </View>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'categories' ? (
          <Categories categories={categories} onRefresh={fetchCategories} searchQuery={searchQuery} />
        ) : activeTab === 'modifiers' ? (
          <Modifier modifiers={modifiers} onRefresh={fetchModifiers} searchQuery={searchQuery} />
        ) : (
          <Menu searchQuery={searchQuery} />
        )}
      </Animated.View>
      <View style={styles.toolbar}>
        {actionButtons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={[styles.toolbarButton, { backgroundColor: button.color }]}
            onPress={button.onPress}
            activeOpacity={0.7}
            accessible
            accessibilityLabel={button.accessibilityLabel}
          >
            <Ionicons name={button.icon} size={20} color="#FFFFFF" />
            <Text style={styles.toolbarButtonText}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: isTablet ? 32 : 16,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  tabContainer: {
    marginBottom: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    overflow: 'hidden',
  },
  tabIndicatorContainer: {
    flexDirection: 'row',
    zIndex: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toolbarButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default InventoryManagement;