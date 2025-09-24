import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMenuItems } from '../../Api/Services/Products';
import AddMenu from '../Model/AddMenu';
import Nav from '../NavBar/Nav';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: number;
  color: string;
  diet: string;
  portion: string;
  isFavorite: boolean;
  hasDiscount: boolean;
  isVeg: boolean;
  discountPrice?: number;
}

interface ProductWithQuantity extends Product {
  quantity: number;
}

interface ListItemsProps {
  products?: Product[];
  searchQuery?: string;
}

const FILTER_OPTIONS = [
  { label: 'All Items', value: 'all', icon: 'grid-outline' },
  { label: 'Favorites', value: 'favorites', icon: 'heart-outline' },
  { label: 'Discounts', value: 'discounts', icon: 'pricetag-outline' },
  { label: 'Veg', value: 'veg', icon: 'leaf-outline' },
];

const DIET_COLORS = {
  Veg: '#10B981',
  'Non-Veg': '#F87171',
  Egg: '#FBBF24',
};

const ProductItem = React.memo(({ 
  item, 
  quantity, 
  onPress, 
  onQuantityDecrease, 
  onQuantityIncrease 
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const isSelected = quantity > 0;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress(item);
  }, [item, onPress, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.productItem, isSelected && styles.selectedProductItem]}
        activeOpacity={0.8}
        onPress={handlePress}
        accessible
        accessibilityLabel={`Select ${item.name}, ${item.diet}, ${item.portion}`}
      >
        {/* Gradient Background for Selected Items */}
        {isSelected && <View style={styles.selectedOverlay} />}
        
        {/* Color Strip with Glow Effect */}
        <View style={[styles.colorStrip, { backgroundColor: item.color }]}>
          {isSelected && <View style={[styles.colorGlow, { backgroundColor: item.color }]} />}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.subInfoContainer}>
                <Text style={styles.productSubInfo}>
                  {item.diet} • {item.portion}
                </Text>
              </View>
            </View>
            
            <View style={styles.badges}>
              {item.isVeg && (
                <View style={styles.vegBadge}>
                  <View style={styles.vegDot} />
                </View>
              )}
              {item.isFavorite && (
                <View style={styles.heartContainer}>
                  <Ionicons name="heart" size={18} color="#FF6B6B" />
                </View>
              )}
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              {item.hasDiscount && item.discountPrice ? (
                <View style={styles.discountPriceContainer}>
                  <Text style={styles.discountPrice}>₹{item.discountPrice}</Text>
                  <Text style={styles.originalPrice}>₹{item.price}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.price}>₹{item.price}</Text>
              )}
            </View>

            {isSelected && (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => onQuantityDecrease(item.id, e)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityLabel={`Decrease quantity of ${item.name}`}
                >
                  <Ionicons name="remove" size={18} color="#6366F1" />
                </TouchableOpacity>
                
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => onQuantityIncrease(item.id, e)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityLabel={`Increase quantity of ${item.name}`}
                >
                  <Ionicons name="add" size={18} color="#6366F1" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function ListItems({ products: initialProducts = [], searchQuery = '' }: ListItemsProps) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [productQuantities, setProductQuantities] = useState({});
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await getMenuItems();
      console.log('Menu items fetched:', response);

      const mappedProducts = response.map((item) => ({
        id: item.id?.toString() || `item-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || 'Unnamed Item',
        price: parseFloat(item.price) || 0,
        color: item.color || DIET_COLORS[item.diet] || '#6366F1',
        diet: item.diet || 'Veg',
        portion: item.portion || 'Small',
        isFavorite: item.is_favorite || false,
        hasDiscount: item.discountPrice ? true : false,
        isVeg: item.diet === 'Veg',
        discountPrice: item.discountPrice ? parseFloat(item.discountPrice) : undefined,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.log('Error fetching menu items:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleMenuAdded = useCallback(() => {
    fetchProducts();
    setShowAddMenuModal(false);
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    switch (selectedFilter) {
      case 'favorites':
        filtered = filtered.filter((product) => product.isFavorite);
        break;
      case 'discounts':
        filtered = filtered.filter((product) => product.hasDiscount);
        break;
      case 'veg':
        filtered = filtered.filter((product) => product.isVeg);
        break;
      default:
        break;
    }

    if (localSearchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedFilter, localSearchQuery]);

  const handleProductPress = useCallback((product) => {
    setProductQuantities((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  }, []);

  const handleQuantityDecrease = useCallback((productId, event) => {
    event.stopPropagation();
    setProductQuantities((prev) => {
      const currentQuantity = prev[productId] || 0;
      if (currentQuantity <= 1) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [productId]: currentQuantity - 1,
      };
    });
  }, []);

  const handleQuantityIncrease = useCallback((productId, event) => {
    event.stopPropagation();
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  }, []);

  const getSelectedProducts = useCallback(() => {
    return Object.entries(productQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return product ? { ...product, quantity } : null;
      })
      .filter(Boolean);
  }, [productQuantities, products]);

  const calculateTotalAmount = useCallback(() => {
    return Object.entries(productQuantities).reduce((total, [productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return total;

      const price = product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;
      return total + price * quantity;
    }, 0);
  }, [productQuantities, products]);

  const getTotalItemCount = useCallback(() => {
    return Object.values(productQuantities).reduce((total, quantity) => total + quantity, 0);
  }, [productQuantities]);

  const handleSave = useCallback(() => {
    console.log('Saving selected products:', getSelectedProducts());
  }, [getSelectedProducts]);

  const handleCharge = useCallback(() => {
    console.log('Charging for products:', getSelectedProducts());
    console.log('Total amount:', calculateTotalAmount());
  }, [getSelectedProducts, calculateTotalAmount]);

  const handleAddUser = useCallback(() => {
    console.log('Adding new user');
  }, []);

  const handleOrdersPress = useCallback(() => {
    console.log('View orders pressed');
    console.log('Current orders:', getSelectedProducts());
  }, [getSelectedProducts]);

  const renderProduct = useCallback(({ item }) => (
    <ProductItem
      item={item}
      quantity={productQuantities[item.id] || 0}
      onPress={handleProductPress}
      onQuantityDecrease={handleQuantityDecrease}
      onQuantityIncrease={handleQuantityIncrease}
    />
  ), [productQuantities, handleProductPress, handleQuantityDecrease, handleQuantityIncrease]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No items found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or filter criteria
      </Text>
    </View>
  ), []);

  const selectedFilterOption = FILTER_OPTIONS.find((option) => option.value === selectedFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navContainer}>
        <Nav
          totalAmount={calculateTotalAmount()}
          itemCount={getTotalItemCount()}
          selectedProducts={getSelectedProducts()}
          onSave={handleSave}
          onCharge={handleCharge}
          isProcessing={false}
          onAddUser={handleAddUser}
          onOrdersPress={handleOrdersPress}
          style={styles.nav}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowDropdown(true)}
            activeOpacity={0.8}
            accessible
            accessibilityLabel="Open filter options"
          >
            <Ionicons 
              name={selectedFilterOption?.icon || 'grid-outline'} 
              size={20} 
              color="#6366F1" 
            />
            <Text style={styles.filterText}>{selectedFilterOption?.label || 'All Items'}</Text>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search delicious items..."
              value={localSearchQuery}
              onChangeText={setLocalSearchQuery}
              placeholderTextColor="#9CA3AF"
              accessible
              accessibilityLabel="Search items"
            />
            {localSearchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setLocalSearchQuery('')}
                accessible
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddMenuModal(true)}
            activeOpacity={0.8}
            accessible
            accessibilityLabel="Add new menu item"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchProducts}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
          initialNumToRender={8}
          windowSize={10}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 140,
            offset: 140 * index,
            index,
          })}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Filter Items</Text>
            </View>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.dropdownOption, selectedFilter === option.value && styles.selectedOption]}
                onPress={() => {
                  setSelectedFilter(option.value);
                  setShowDropdown(false);
                }}
                accessible
                accessibilityLabel={`Select ${option.label} filter`}
              >
                <View style={styles.optionContent}>
                  <Ionicons 
                    name={option.icon} 
                    size={22} 
                    color={selectedFilter === option.value ? '#6366F1' : '#6B7280'} 
                  />
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedFilter === option.value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                {selectedFilter === option.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <AddMenu
        visible={showAddMenuModal}
        onClose={() => setShowAddMenuModal(false)}
        onMenuAdded={handleMenuAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  nav: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
    marginRight: 6,
    flex: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedProductItem: {
    borderColor: '#10B981',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ECFDF5',
    opacity: 0.5,
  },
  colorStrip: {
    width: 6,
    borderRadius: 3,
    position: 'relative',
  },
  colorGlow: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: -1,
    right: -1,
    borderRadius: 4,
    opacity: 0.3,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productDetails: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 4,
  },
  subInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productSubInfo: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vegBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  heartContainer: {
    padding: 2,
  },
  selectedBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  discountPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  originalPrice: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityDisplay: {
    minWidth: 40,
    height: 32,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingHorizontal: 20,
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectedOption: {
    backgroundColor: '#F0F9FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  selectedOptionText: {
    color: '#6366F1',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});