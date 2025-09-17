import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getMenuItems } from '../../Api/Services/Products';
import AddMenu from '../Model/AddMenu';
import Nav from '../NavBar/Nav';
import Save from '../SaveOptions/Save';

interface Product {
  id: string;
  name: string;
  price: number;
  color: string; // Added color field
  diet: string; // Added diet field (e.g., "Veg", "Non-Veg", "Egg")
  portion: string; // Added portion field (e.g., "Small", "Medium", "Large")
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
}

const FILTER_OPTIONS = [
  { label: 'All Items', value: 'all' },
  { label: 'Favorites', value: 'favorites' },
  { label: 'Discounts', value: 'discounts' },
  { label: 'Veg', value: 'veg' },
];

export default function ListItems({ products: initialProducts = [] }: ListItemsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);

  async function fetchProducts() {
    try {
      const response = await getMenuItems();
      console.log('Menu items fetched:', response);
      
      const mappedProducts: Product[] = response.map((item: any) => ({
        id: item.id?.toString() || `item-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || 'Unnamed Item',
        price: parseFloat(item.price) || 0,
        color: item.color || '#4F46E5', // Default color if not provided
        diet: item.diet || 'Veg', // Default to "Veg" if not provided
        portion: item.portion || 'Small', // Default to "Small" if not provided
        isFavorite: item.is_favorite || false,
        hasDiscount: item.discountPrice ? true : false,
        isVeg: item.diet === 'Veg',
        discountPrice: item.discountPrice ? parseFloat(item.discountPrice) : undefined,
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.log('Failed to fetch menu items', error);
      console.error('Error fetching menu items:', error);
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
        filtered = filtered.filter(product => product.isFavorite);
        break;
      case 'discounts':
        filtered = filtered.filter(product => product.hasDiscount);
        break;
      case 'veg':
        filtered = filtered.filter(product => product.isVeg);
        break;
      default:
        break;
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleProductPress = (product: Product) => {
    setProductQuantities(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
  };

  const handleQuantityDecrease = (productId: string, event: any) => {
    event.stopPropagation();
    setProductQuantities(prev => {
      const currentQuantity = prev[productId] || 0;
      if (currentQuantity <= 1) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [productId]: currentQuantity - 1
      };
    });
  };

  const handleQuantityIncrease = (productId: string, event: any) => {
    event.stopPropagation();
    setProductQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const getSelectedProducts = (): ProductWithQuantity[] => {
    return Object.entries(productQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return product ? { ...product, quantity } : null;
      })
      .filter(Boolean) as ProductWithQuantity[];
  };

  const calculateTotalAmount = () => {
    return Object.entries(productQuantities).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      if (!product) return total;
      
      const price = product.hasDiscount && product.discountPrice 
        ? product.discountPrice 
        : product.price;
      return total + (price * quantity);
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
        style={[
          styles.productItem,
          isSelected && styles.selectedProductItem
        ]} 
        activeOpacity={0.7}
        onPress={() => handleProductPress(item)}
      >
        <View style={[styles.colorSquare, { backgroundColor: item.color }]} />
        
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
                <Ionicons name="heart" size={16} color="#ef4444" />
              )}
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
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
                >
                  <Ionicons name="remove" size={16} color="#2563eb" />
                </TouchableOpacity>
                
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={(e) => handleQuantityIncrease(item.id, e)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#2563eb" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const selectedFilterLabel = FILTER_OPTIONS.find(option => option.value === selectedFilter)?.label || 'All Items';

  return (
    <View style={styles.container}>
      <Nav
        totalAmount={calculateTotalAmount()}
        itemCount={getTotalItemCount()}
        selectedProducts={getSelectedProducts()}
        onSave={handleSave}
        onCharge={handleCharge}
        isProcessing={false}
        onAddUser={handleAddUser}
        onOrdersPress={handleOrdersPress}
      />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedFilterLabel}</Text>
          <Ionicons name="chevron-down" size={20} color="#64748b" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddMenuModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Save 
        totalAmount={calculateTotalAmount()}
        itemCount={getTotalItemCount()}
        selectedProducts={getSelectedProducts()}
        onSave={handleSave}
        onCharge={handleCharge}
        isProcessing={false}
      />

      <FlatList
        data={filterProducts()}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownOption,
                  selectedFilter === option.value && styles.selectedOption
                ]}
                onPress={() => {
                  setSelectedFilter(option.value);
                  setShowDropdown(false);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  selectedFilter === option.value && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                {selectedFilter === option.value && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedProductItem: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  colorSquare: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9', // Fallback background
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
  },
  productDetails: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  productSubInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegBadge: {
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  selectedBadge: {
    marginLeft: 4,
  },
  priceContainer: {
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  discountPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  originalPrice: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quantityDisplay: {
    minWidth: 40,
    height: 28,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingHorizontal: 20,
  },
  dropdownModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  selectedOptionText: {
    color: '#2563eb',
  },
});