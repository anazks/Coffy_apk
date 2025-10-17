import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

// --- (Product interfaces and constant definitions remain the same) ---
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

const DIET_COLORS = {
  Veg: '#10B981',
  'Non-Veg': '#F87171',
  Egg: '#FBBF24',
};

const getFilterOptions = (products: Product[]) => {
  const uniqueCategories = Array.from(new Set(products.map((product) => product.diet))).map((category) => ({
    label: category,
    value: category.toLowerCase(),
    icon: category === 'Veg' ? 'leaf-outline' : category === 'Non-Veg' ? 'fish-outline' : 'egg-outline',
  }));

  return [
    { label: 'All Items', value: 'all', icon: 'grid-outline' },
    { label: 'Favorites', value: 'favorites', icon: 'heart-outline' },
    { label: 'Discounts', value: 'discounts', icon: 'pricetag-outline' },
    ...uniqueCategories,
  ];
};


const ProductItem = React.memo(({
  item,
  quantity,
  onPress,
  onQuantityDecrease,
  onQuantityIncrease,
  isLandscape
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
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, isLandscape && { flex: 1 }]}>
      <TouchableOpacity
        style={[
          styles.productItem,
          isSelected && styles.selectedProductItem,
          isLandscape && styles.productItemLandscape
        ]}
        activeOpacity={0.8}
        onPress={handlePress}
        accessible
        accessibilityLabel={`Select ${item.name}, ${item.diet}, ${item.portion}`}
      >
        {isSelected && <View style={styles.selectedOverlay} />}
        <View style={[styles.colorStrip, { backgroundColor: item.color }, isLandscape && styles.colorStripLandscape]}>
          {isSelected && <View style={[styles.colorGlow, { backgroundColor: item.color }]} />}
        </View>

        <View style={[
          styles.productInfo,
          isLandscape && styles.productInfoLandscape
        ]}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text style={[
                styles.productName,
                isLandscape && styles.productNameLandscape
              ]} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.subInfoContainer}>
                <Text style={[
                  styles.productSubInfo,
                  isLandscape && styles.productSubInfoLandscape
                ]}>
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

          <View style={[
            styles.priceRow,
            isLandscape && styles.priceRowLandscape
          ]}>
            <View style={styles.priceContainer}>
              {item.hasDiscount && item.discountPrice ? (
                <View style={styles.discountPriceContainer}>
                  <Text style={[
                    styles.discountPrice,
                    isLandscape && styles.discountPriceLandscape
                  ]}>₹{item.discountPrice}</Text>
                  <Text style={[
                    styles.originalPrice,
                    isLandscape && styles.originalPriceLandscape
                  ]}>₹{item.price}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[
                  styles.price,
                  isLandscape && styles.priceLandscape
                ]}>₹{item.price}</Text>
              )}
            </View>

            {isSelected && (
              <View style={[
                styles.quantityContainer,
                isLandscape && styles.quantityContainerLandscape
              ]}>
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

export default function ListItems({ products: initialProducts = [], searchQuery = '' }) {
    const [products, setProducts] = useState(initialProducts);
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showDropdown, setShowDropdown] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [productQuantities, setProductQuantities] = useState({});
    const [showAddMenuModal, setShowAddMenuModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [navHeight, setNavHeight] = useState(0); // State to hold Nav bar's height
    const searchInputRef = useRef(null);

    const isLandscape = useMemo(() => screenDimensions.width > screenDimensions.height, [screenDimensions]);
    const FILTER_OPTIONS = useMemo(() => getFilterOptions(products), [products]);
    const numColumns = useMemo(() => (isLandscape ? 2 : 1), [isLandscape]);
    const itemHeight = 152;

    useEffect(() => {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setScreenDimensions(window);
      });
      return () => subscription?.remove();
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
          setRefreshing(true);
          const response = await getMenuItems();
          const mappedProducts = response.map((item) => ({
            id: item.id?.toString() || `item-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name || 'Unnamed Item',
            price: parseFloat(item.price) || 0,
            color: item.color || DIET_COLORS[item.diet] || '#6366F1',
            diet: item.category_name || 'Veg',
            portion: item.portion || 'Small',
            isFavorite: item.is_favorite || false,
            hasDiscount: !!item.discountPrice,
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
        if (selectedFilter === 'favorites') {
            filtered = filtered.filter((product) => product.isFavorite);
        } else if (selectedFilter === 'discounts') {
            filtered = filtered.filter((product) => product.hasDiscount);
        } else if (selectedFilter !== 'all') {
            filtered = filtered.filter((product) => product.diet.toLowerCase() === selectedFilter.toLowerCase());
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
        return { ...prev, [productId]: currentQuantity - 1 };
        });
    }, []);

    const handleQuantityIncrease = useCallback((productId, event) => {
        event.stopPropagation();
        setProductQuantities((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
        }));
    }, []);

    const handleClearOrder = useCallback(() => setProductQuantities({}), []);
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
        return getSelectedProducts().reduce((total, product) => {
        const price = product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;
        return total + price * product.quantity;
        }, 0);
    }, [getSelectedProducts]);
    const getTotalItemCount = useCallback(() => {
        return Object.values(productQuantities).reduce((total, quantity) => total + (quantity || 0), 0);
    }, [productQuantities]);
    const handleSave = useCallback(() => console.log('Saving'), []);
    const handleCharge = useCallback(() => console.log('Charging'), []);
    const handleAddUser = useCallback(() => console.log('Adding user'), []);
    const handleOrdersPress = useCallback(() => console.log('Viewing orders'), []);
    const handleSearchContainerPress = useCallback(() => {
        setIsSearchExpanded(true);
        searchInputRef.current?.focus();
    }, []);
    const handleCancelSearch = useCallback(() => {
        setIsSearchExpanded(false);
        searchInputRef.current?.blur();
    }, []);
    const handleClearSearch = useCallback(() => {
        setLocalSearchQuery('');
    }, []);

    const getItemLayout = useCallback(
      (data, index) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
      [itemHeight]
    );

    const renderProduct = useCallback(({ item }) => (
      <ProductItem
        item={item}
        quantity={productQuantities[item.id] || 0}
        onPress={handleProductPress}
        onQuantityDecrease={handleQuantityDecrease}
        onQuantityIncrease={handleQuantityIncrease}
        isLandscape={isLandscape}
      />
    ), [productQuantities, handleProductPress, handleQuantityDecrease, handleQuantityIncrease, isLandscape]);

    const renderEmptyState = useCallback(() => (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No items found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your search or filter criteria.</Text>
      </View>
    ), []);

    const selectedFilterOption = FILTER_OPTIONS.find((option) => option.value === selectedFilter);

    return (
      <SafeAreaView style={styles.container}>
        {/* This absolute container measures itself */}
        <View
          style={styles.navContainer}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0 && height !== navHeight) { // Prevent setting 0 or unnecessary re-renders
                setNavHeight(height);
            }
          }}
        >
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

        {/* The FlatList now handles the header and its own padding */}
        <FlatList
            // This key style pushes the entire scrollable content down
            contentContainerStyle={{ paddingTop: navHeight, paddingHorizontal: 16, paddingBottom: 20 }}
            ListHeaderComponent={
                <View style={styles.header}>
                    {!isSearchExpanded && (
                        <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowDropdown(true)}
                        activeOpacity={0.8}>
                        <Ionicons name={selectedFilterOption?.icon || 'grid-outline'} size={20} color="#6366F1" />
                        <Text style={styles.filterText}>{selectedFilterOption?.label || 'All Items'}</Text>
                        <Ionicons name="chevron-down" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.searchContainer, isSearchExpanded && styles.searchContainerExpanded]}
                        onPress={handleSearchContainerPress}
                        activeOpacity={1}>
                        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                        ref={searchInputRef}
                        style={[styles.searchInput, isSearchExpanded && styles.searchInputExpanded]}
                        placeholder="Search delicious items..."
                        value={localSearchQuery}
                        onChangeText={setLocalSearchQuery}
                        placeholderTextColor="#9CA3AF"
                        />
                        {localSearchQuery.length > 0 && (
                        <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    {isSearchExpanded && (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSearch} activeOpacity={0.8}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}

                    {!isSearchExpanded && (
                        <>
                            {getTotalItemCount() > 0 && (
                                <TouchableOpacity
                                    style={styles.clearOrderButton}
                                    onPress={handleClearOrder}
                                    activeOpacity={0.8}>
                                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMenuModal(true)} activeOpacity={0.8}>
                                <Ionicons name="add" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            }
            key={isLandscape ? 'landscape-grid' : 'portrait-list'}
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchProducts} colors={['#6366F1']} tintColor="#6366F1" />
            }
            initialNumToRender={8}
            windowSize={10}
            maxToRenderPerBatch={5}
            removeClippedSubviews={true}
            getItemLayout={!isLandscape ? getItemLayout : undefined}
            ListEmptyComponent={renderEmptyState}
        />

        <Modal
            visible={showDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDropdown(false)}>
            <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
                <View style={styles.dropdownModal}>
                    {/* Modal content */}
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
        position: 'absolute', // It's crucial this stays absolute
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10, // Ensure it floats on top
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
    header: {
      flexDirection: 'row',
      paddingVertical: 12, // The container provides horizontal padding
      gap: 12,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
      alignItems: 'center',
      marginBottom: 8, // Space between header and first item
    },
    columnWrapper: {
      gap: 12,
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
    productItemLandscape: {
        flexDirection: 'column',
        padding: 12,
        minHeight: 180,
        marginBottom: 0,
    },
    selectedProductItem: {
        borderColor: '#10B981',
        borderWidth: 2,
    },
    selectedOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#ECFDF5', opacity: 0.5,
    },
    colorStrip: { width: 6, borderRadius: 3 },
    colorStripLandscape: { width: '100%', height: 4 },
    colorGlow: { position: 'absolute', top: -2, bottom: -2, left: -1, right: -1, borderRadius: 4, opacity: 0.3 },
    productInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
    productInfoLandscape: { marginLeft: 0, marginTop: 8, flex: 1, justifyContent: 'space-between' },
    productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    productDetails: { flex: 1, marginRight: 12 },
    productName: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
    productNameLandscape: { fontSize: 14 },
    subInfoContainer: { flexDirection: 'row', alignItems: 'center' },
    productSubInfo: { fontSize: 13, color: '#64748B' },
    productSubInfoLandscape: { fontSize: 11 },
    badges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    vegBadge: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4' },
    vegDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
    heartContainer: {},
    selectedBadge: {},
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceRowLandscape: { flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginTop: 'auto' },
    priceContainer: {},
    price: { fontSize: 18, fontWeight: '700', color: '#6366F1' },
    priceLandscape: { fontSize: 15 },
    discountPriceContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    discountPrice: { fontSize: 18, fontWeight: '700', color: '#6366F1' },
    discountPriceLandscape: { fontSize: 15 },
    originalPrice: { fontSize: 14, color: '#94A3B8', textDecorationLine: 'line-through' },
    originalPriceLandscape: { fontSize: 12 },
    discountBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    discountText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#E2E8F0' },
    quantityContainerLandscape: {},
    quantityButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    quantityDisplay: { minWidth: 40, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
    quantityText: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    filterText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginLeft: 8, marginRight: 6 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    searchContainerExpanded: { flex: 1 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 14, color: '#1E293B', paddingVertical: 10 },
    searchInputExpanded: { flex: 1 },
    clearButton: { padding: 4 },
    cancelButton: { paddingHorizontal: 12, paddingVertical: 8 },
    cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' },
    addButton: { backgroundColor: '#6366F1', padding: 12, borderRadius: 12 },
    clearOrderButton: {
        backgroundColor: '#EF4444',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 50 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptySubtitle: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
    modalOverlay: {},
    dropdownModal: {}
  });