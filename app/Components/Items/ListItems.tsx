import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
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
  { label: 'All Items', value: 'all' },
  { label: 'Favorites', value: 'favorites' },
  { label: 'Discounts', value: 'discounts' },
  { label: 'Veg', value: 'veg' },
];

const DIET_COLORS: { [key: string]: string } = {
  Veg: '#22C55E',
  'Non-Veg': '#EF4444',
  Egg: '#F59E0B',
};

export default function ListItems({ products: initialProducts = [], searchQuery = '' }: ListItemsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  async function fetchProducts() {
    try {
      setRefreshing(true);
      const response = await getMenuItems();
      console.log('Menu items fetched:', response);

      const mappedProducts: Product[] = response.map((item: any) => ({
        id: item.id?.toString() || `item-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || 'Unnamed Item',
        price: parseFloat(item.price) || 0,
        color: item.color || DIET_COLORS[item.diet] || '#3B82F6',
        diet: item.diet || 'Veg',
        portion: item.portion || 'Small',
        isFavorite: item.is_favorite || false,
        hasDiscount: item.discountPrice ? true : false,
        isVeg: item.diet === 'Veg',
        discountPrice: item.discountPrice ? parseFloat(item.discountPrice) : undefined,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleMenuAdded = () => {
    fetchProducts();
    setShowAddMenuModal(false);
  };

  const filterProducts = () => {
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
  };

  const handleProductPress = (product: Product) => {
    setProductQuantities((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const handleQuantityDecrease = (productId: string, event: any) => {
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
  };

  const handleQuantityIncrease = (productId: string, event: any) => {
    event.stopPropagation();
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const getSelectedProducts = (): ProductWithQuantity[] => {
    return Object.entries(productQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return product ? { ...product, quantity } : null;
      })
      .filter(Boolean) as ProductWithQuantity[];
  };

  const calculateTotalAmount = () => {
    return Object.entries(productQuantities).reduce((total, [productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return total;

      const price = product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;
      return total + price * quantity;
    }, 0);
  };

  const getTotalItemCount = () => {
    return Object.values(productQuantities).reduce((total, quantity) => total + quantity, 0);
  };

  const handleSave = () => {
    console.log('Saving selected products:', getSelectedProducts());
  };

  const handleCharge = () => {
    console.log('Charging for products:', getSelectedProducts());
    console.log('Total amount:', calculateTotalAmount());
  };

  const handleAddUser = () => {
    console.log('Adding new user');
  };

  const handleOrdersPress = () => {
    console.log('View orders pressed');
    console.log('Current orders:', getSelectedProducts());
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const quantity = productQuantities[item.id] || 0;
    const isSelected = quantity > 0;

    return (
      <TouchableOpacity
        style={[styles.productItem, isSelected && styles.selectedProductItem]}
        activeOpacity={0.7}
        onPress={() => handleProductPress(item)}
        accessible
        accessibilityLabel={`Select ${item.name}, ${item.diet}, ${item.portion}`}
      >
        <View style={[styles.colorStrip, { backgroundColor: item.color }]} />
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productSubInfo}>
                {item.diet} • {item.portion}
              </Text>
            </View>
            <View style={styles.badges}>
              {item.isVeg && (
                <View style={[styles.badge, styles.vegBadge]}>
                  <View style={styles.vegDot} />
                </View>
              )}
              {item.isFavorite && (
                <Ionicons name="heart" size={16} color="#EF4444" />
              )}
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                </View>
              )}
            </View>
          </View>
          <View style={styles.priceContainer}>
            {item.hasDiscount && item.discountPrice ? (
              <View style={styles.discountPriceRow}>
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
            {isSelected && (
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => handleQuantityDecrease(item.id, e)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityLabel={`Decrease quantity of ${item.name}`}
                >
                  <Ionicons name="remove" size={16} color="#2563EB" />
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => handleQuantityIncrease(item.id, e)}
                  activeOpacity={0.7}
                  accessible
                  accessibilityLabel={`Increase quantity of ${item.name}`}
                >
                  <Ionicons name="add" size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="sad-outline" size={48} color="#6B7280" />
      <Text style={styles.emptyText}>No items found</Text>
    </View>
  );

  const selectedFilterLabel = FILTER_OPTIONS.find((option) => option.value === selectedFilter)?.label || 'All Items';

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
            style={styles.dropdown}
            onPress={() => setShowDropdown(true)}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="Open filter options"
          >
            <Text style={styles.dropdownText}>{selectedFilterLabel}</Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
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
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddMenuModal(true)}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="Add new menu item"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={filterProducts()}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />}
          initialNumToRender={10}
          windowSize={5}
          removeClippedSubviews={true}
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
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedFilter === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedFilter === option.value && (
                  <Ionicons name="checkmark" size={20} color="#2563EB" />
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
    backgroundColor: '#F9FAFB',
  },
  navContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nav: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 50, // Space for sticky navbar
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    width: '100%',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
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
    fontSize: 14,
    color: '#111827',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    width: '100%',
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedProductItem: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  colorStrip: {
    width: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productDetails: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  productSubInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegBadge: {
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  selectedBadge: {
    marginLeft: 4,
  },
  priceContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  discountPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  originalPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityDisplay: {
    minWidth: 40,
    height: 32,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 16,
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  selectedOptionText: {
    color: '#2563EB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
});