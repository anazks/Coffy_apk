import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Nav from '../NavBar/Nav';
import Save from '../SaveOptions/Save';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
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

// Sample data with more variety
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    price: 299,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: true,
  },
  {
    id: '2',
    name: 'Chicken Burger',
    price: 249,
    discountPrice: 199,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: false,
  },
  {
    id: '3',
    name: 'Paneer Tikka',
    price: 189,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: true,
  },
  {
    id: '4',
    name: 'Pasta Alfredo',
    price: 229,
    discountPrice: 179,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '5',
    name: 'Fish Curry',
    price: 319,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '6',
    name: 'Chicken Biryani',
    price: 389,
    discountPrice: 329,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d321?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: true,
    isVeg: false,
  },
  {
    id: '7',
    name: 'Veg Spring Rolls',
    price: 149,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: false,
    isVeg: true,
  },
  {
    id: '8',
    name: 'Grilled Salmon',
    price: 499,
    discountPrice: 399,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: true,
    isVeg: false,
  },
  {
    id: '9',
    name: 'Aloo Gobi',
    price: 159,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: false,
    isVeg: true,
  },
  {
    id: '10',
    name: 'Caesar Salad',
    price: 189,
    discountPrice: 149,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '11',
    name: 'BBQ Chicken Wings',
    price: 279,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '12',
    name: 'Mushroom Risotto',
    price: 239,
    discountPrice: 199,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '13',
    name: 'Fish Tacos',
    price: 269,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '14',
    name: 'Veggie Wrap',
    price: 129,
    discountPrice: 99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '15',
    name: 'Butter Chicken',
    price: 329,
    image: 'https://images.unsplash.com/photo-1588166524941-6022e4746cb5?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '16',
    name: 'Dal Makhani',
    price: 179,
    discountPrice: 149,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '17',
    name: 'Prawn Curry',
    price: 369,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '18',
    name: 'Veg Hakka Noodles',
    price: 159,
    discountPrice: 129,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '19',
    name: 'Chicken Shawarma',
    price: 199,
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '20',
    name: 'Palak Paneer',
    price: 189,
    discountPrice: 159,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '21',
    name: 'Beef Steak',
    price: 599,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '22',
    name: 'Mixed Veg Curry',
    price: 149,
    discountPrice: 119,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '23',
    name: 'Lamb Korma',
    price: 429,
    image: 'https://images.unsplash.com/photo-1588166524941-6022e4746cb5?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  },
  {
    id: '24',
    name: 'Chole Bhature',
    price: 139,
    discountPrice: 109,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&h=100&fit=crop&crop=center',
    isFavorite: false,
    hasDiscount: true,
    isVeg: true,
  },
  {
    id: '25',
    name: 'Thai Green Curry',
    price: 289,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=100&h=100&fit=crop&crop=center',
    isFavorite: true,
    hasDiscount: false,
    isVeg: false,
  }
];

export default function ListItems({ products = SAMPLE_PRODUCTS }: ListItemsProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Changed to track quantities instead of just selected products
  const [productQuantities, setProductQuantities] = useState<{[key: string]: number}>({});

  const filterProducts = () => {
    let filtered = products;

    // Apply filter
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

    // Apply search
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
    event.stopPropagation(); // Prevent triggering the parent TouchableOpacity
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
    event.stopPropagation(); // Prevent triggering the parent TouchableOpacity
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
    // Implement save functionality here
  };

  const handleCharge = () => {
    console.log('Charging for products:', getSelectedProducts());
    console.log('Total amount:', calculateTotalAmount());
    // Implement charge functionality here
  };

  const handleAddUser = () => {
    console.log('Adding new user');
    // Implement add user functionality here
  };

  const handleOrdersPress = () => {
    console.log('View orders pressed');
    console.log('Current orders:', getSelectedProducts());
    // Implement orders view functionality here
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
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{item.name}</Text>
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
            
            {/* Quantity Controls */}
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
      {/* Navigation Bar */}
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

      {/* Header with Dropdown and Search */}
      <View style={styles.header}>
        {/* Dropdown */}
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedFilterLabel}</Text>
          <Ionicons name="chevron-down" size={20} color="#64748b" />
        </TouchableOpacity>

        {/* Search */}
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
      </View>

      {/* Save Component */}
      <Save 
        totalAmount={calculateTotalAmount()}
        itemCount={getTotalItemCount()}
        selectedProducts={getSelectedProducts()}
        onSave={handleSave}
        onCharge={handleCharge}
        isProcessing={false}
      />

      {/* Products List */}
      <FlatList
        data={filterProducts()}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Dropdown Modal */}
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
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Add extra padding for the Save component
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
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
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
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