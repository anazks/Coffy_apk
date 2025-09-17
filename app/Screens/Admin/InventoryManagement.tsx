import Categories from '@/app/Components/Items/Categories';
import Modifier from '@/app/Components/Items/Modifier';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategories, getmodifiers } from '../../Api/Services/Products';
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
  const cardAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const scaleAnims = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];

  useEffect(() => {
    fetchCategories();
    fetchModifiers();
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      ...cardAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        })
      ),
    ]).start();
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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleCardPressIn = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const quickActionCards = [
    {
      id: 'menu',
      title: '+ Menu',
      description: 'Add new menu item',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      borderColor: '#4F46E5',
      onPress: () => setShowAddMenu(true),
    },
    {
      id: 'category',
      title: '+ Category',
      description: 'Create new category',
      color: '#10B981',
      bgColor: '#ECFDF5',
      borderColor: '#10B981',
      onPress: () => setShowAddCategory(true),
    },
    {
      id: 'modifier',
      title: '+ Modifier',
      description: 'Add new modifier',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#F59E0B',
      onPress: () => setShowAddModifier(true),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Quick Actions Section - Grid Layout */}
      <View style={styles.quickActions}>
        <View style={styles.gridContainer}>
          {quickActionCards.map((card, index) => (
            <Animated.View
              key={card.id}
              style={[
                styles.optionCard,
                { borderTopColor: card.borderColor, opacity: cardAnims[index] },
                {
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.cardTouchable}
                onPress={card.onPress}
                onPressIn={() => handleCardPressIn(index)}
                onPressOut={() => handleCardPressOut(index)}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: card.bgColor }]}>
                  <Text style={[styles.plusIcon, { color: card.color }]}>+</Text>
                </View>
                <Text style={styles.optionTitle}>{card.title}</Text>
                <Text style={styles.optionDescription}>{card.description}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabIndicatorContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
            onPress={() => handleTabPress('categories')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
              Categories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'modifiers' && styles.activeTab]}
            onPress={() => handleTabPress('modifiers')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'modifiers' && styles.activeTabText]}>
              Modifiers
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabIndicatorBackground}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [{
                  translateX: activeTab === 'categories' ? 0 : width * (isTablet ? 0.46 : 0.48)
                }],
                width: isTablet ? '46%' : '48%',
              },
            ]}
          />
        </View>
      </View>

      {/* Content Area */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {activeTab === 'categories' ? (
          <Categories categories={categories} onRefresh={fetchCategories} />
        ) : (
          <Modifier modifiers={modifiers} onRefresh={fetchModifiers} />
        )}
      </Animated.View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: isTablet ? 24 : 16,
  },
  quickActions: {
    marginTop: 16,
    marginBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: isTablet ? 16 : 12,
  },
  optionCard: {
    flex: 1,
    minWidth: isTablet ? 160 : 110,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderTopWidth: 4,
  },
  cardTouchable: {
    flex: 1,
    alignItems: 'center',
  },
  optionIconContainer: {
    width: isTablet ? 50 : 44,
    height: isTablet ? 50 : 44,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  plusIcon: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
  },
  optionTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: isTablet ? 12 : 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  tabContainer: {
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 6,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    zIndex: 2,
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
    color: '#4F46E5',
    fontWeight: '700',
  },
  tabIndicatorBackground: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 6,
    right: 6,
    zIndex: 1,
  },
  tabIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    transitionProperty: 'transform',
    transitionDuration: '300ms',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});

export default InventoryManagement;