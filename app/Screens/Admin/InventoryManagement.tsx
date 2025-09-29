import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchCategories();
    fetchModifiers();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
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
      console.log('Error fetching categories:', error);
    }
  };

  const fetchModifiers = async () => {
    try {
      const response = await getmodifiers();
      if (response.success) {
        setModifiers(response.data || []);
      }
    } catch (error) {
      console.log('Error fetching modifiers:', error);
    }
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    setShowAddCategory(false);
  };

  const handleModifierAdded = () => {
    fetchModifiers();
    setShowAddModifier(false);
  };

  const handleMenuAdded = () => {
    console.log('Menu item added successfully');
    setShowAddMenu(false);
  };

  const handleTabPress = (tab: string) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tab);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
                  translateX:
                    activeTab === 'categories'
                      ? 0
                      : activeTab === 'modifiers'
                      ? width * (isTablet ? 0.31 : 0.33)
                      : width * (isTablet ? 0.62 : 0.66),
                },
              ],
              width: isTablet ? '31%' : '33%',
            },
          ]}
        />
      </View>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.contentCard}>
          {activeTab === 'categories' ? (
            <Categories categories={categories} onRefresh={fetchCategories} />
          ) : activeTab === 'modifiers' ? (
            <Modifier modifiers={modifiers} onRefresh={fetchModifiers} />
          ) : (
            <Menu />
          )}
        </View>
      </Animated.View>
      <View style={[styles.toolbar, isTablet && styles.toolbarTablet]}>
        {actionButtons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={[styles.toolbarButton, { backgroundColor: button.color }]}
            onPress={button.onPress}
            activeOpacity={0.7}
            accessible
            accessibilityLabel={button.accessibilityLabel}
          >
            <Ionicons name={button.icon} size={isTablet ? 24 : 20} color="#FFFFFF" />
            {isTablet && (
              <Text style={styles.toolbarButtonText}>{button.label}</Text>
            )}
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
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: isTablet ? 32 : 16,
  },
  tabContainer: {
    marginBottom: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    overflow: 'hidden',
    marginTop: isTablet ? 20 : 16,
  },
  tabIndicatorContainer: {
    flexDirection: 'row',
    zIndex: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: isTablet ? 18 : 16,
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
    backgroundColor: '#2563EB',
    borderRadius: 10,
    zIndex: 1,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: isTablet ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: isTablet ? 16 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolbarTablet: {
    paddingHorizontal: 24,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: 12,
    marginHorizontal: isTablet ? 8 : 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toolbarButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default InventoryManagement;