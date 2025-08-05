import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderDetailsModal from '../../Components/OrderDetails/OrderDetailsModal'; // Import the modal component

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

interface OrderData {
  products: ProductWithQuantity[];
  orderType: 'dine-in' | 'takeout' | 'delivery';
  ticketName: string;
  comment: string;
  paymentMethod?: 'cash' | 'card' | 'split';
  cashAmount?: number;
  cardAmount?: number;
  totalAmount: number;
  customerEmail?: string;
  timestamp: Date;
  isCompleted?: boolean;
}

interface NavProps {
  totalAmount?: number;
  itemCount?: number;
  selectedProducts?: ProductWithQuantity[];
  onSave?: () => void;
  onCharge?: () => void;
  isProcessing?: boolean;
  onAddUser?: () => void;
  onOrdersPress?: () => void;
  onOrderComplete?: (orderData: OrderData) => void;
  onSaveOrder?: (orderData: Partial<OrderData>) => void; // New prop for handling saved orders
}

export default function Nav({ 
  totalAmount = 0,
  itemCount = 0,
  selectedProducts = [],
  onSave = () => {},
  onCharge = () => {},
  isProcessing = false,
  onAddUser = () => {}, 
  onOrdersPress = () => {},
  onOrderComplete = () => {},
  onSaveOrder = () => {}
}: NavProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Calculate total number of orders (unique products with quantity > 0)
  const orderCount = selectedProducts.length;
  
  // Calculate actual total amount from selectedProducts if not provided
  const calculatedTotal = selectedProducts.reduce((sum, product) => {
    const price = product.hasDiscount && product.discountPrice 
      ? product.discountPrice 
      : product.price;
    return sum + (price * product.quantity);
  }, 0);
  
  // Use provided totalAmount or calculate from products
  const displayTotal = totalAmount > 0 ? totalAmount : calculatedTotal;

  const handleOrdersPress = () => {
    if (orderCount > 0) {
      setShowOrderModal(true);
    } else {
      // If no orders, call the original onOrdersPress function
      onOrdersPress();
    }
  };

  const handleOrderComplete = (orderData: OrderData) => {
    // Call the parent's onOrderComplete function
    onOrderComplete(orderData);
    
    // You can also perform additional actions here like:
    // - Clear the cart
    // - Show success message
    // - Navigate to order history
    
    console.log('Order completed:', orderData);
  };

  const handleSaveOrder = (orderData: Partial<OrderData>) => {
    // Call the parent's onSaveOrder function
    onSaveOrder(orderData);
    
    console.log('Order saved:', orderData);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Left side - App title or logo space */}
        <View style={styles.leftSection}>
          <Text style={styles.appTitle}>Coffy Byte</Text>
        </View>

        {/* Right side - Actions */}
        <View style={styles.rightSection}>

          <TouchableOpacity 
            style={[
              styles.orderContainer,
              orderCount > 0 && styles.orderContainerActive
            ]}
            onPress={handleOrdersPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="receipt" 
              size={20} 
              color={orderCount > 0 ? "#ffffff" : "#2563eb"} 
            />
            {orderCount > 0 && (
              <View style={styles.orderBadge}>
                <Text style={styles.orderCount}>
                  {orderCount > 99 ? '99+' : orderCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Add User Button */}
          <TouchableOpacity 
            style={styles.addUserButton}
            onPress={onAddUser}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="person-add" 
              size={22} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Details Modal - Pass all necessary props */}
      <OrderDetailsModal
        visible={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        selectedProducts={selectedProducts}
        onOrderComplete={handleOrderComplete}
        onSaveOrder={handleSaveOrder}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  leftSection: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmountContainer: {
    marginRight: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#2563eb',
  },
  totalAmountText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  orderContainer: {
    position: 'relative',
    marginRight: 15,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
  },
  orderContainerActive: {
    backgroundColor: '#2563eb',
  },
  orderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  orderCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addUserButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    marginLeft: 10,
  },
  addUserIcon: {
    color: '#ffffff',
  },
  orderIcon: {
    color: '#2563eb',
  },
  orderCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderIconActive: {
    color: '#ffffff',
  },
  orderIconInactive: {
    color: '#2563eb',
  },
  orderCountContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  orderCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderIconContainer: {
    position: 'relative',
    marginRight: 15,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
  },
  orderIconContainerActive: {
    backgroundColor: '#2563eb',
  },
  orderIconBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});