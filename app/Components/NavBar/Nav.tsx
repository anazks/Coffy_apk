import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderDetailsModal from '../../Components/OrderDetails/OrderDetailsModal'; // Import the modal component
import SaveCustomer from '../../Components/SaveOptions/SaveCustomer'; // Import SaveCustomer component

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

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  customerCode: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
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
  onSaveOrder?: (orderData: Partial<OrderData>) => void;
  onSaveCustomer?: (customer: Customer) => void; // New prop for handling customer save
  existingCustomers?: Customer[]; // Existing customers for search
  onInventoryPress?: () => void; // New prop for inventory management
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
  onSaveOrder = () => {},
  onSaveCustomer = () => {},
  existingCustomers = [],
  onInventoryPress = () => {}
}: NavProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
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

  const handleAddUserPress = () => {
    // Show the SaveCustomer modal instead of calling onAddUser
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = (customer: Customer) => {
    // Call the parent's onSaveCustomer function
    onSaveCustomer(customer);
    
    // Close the modal
    setShowCustomerModal(false);
    
    console.log('Customer saved:', customer);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
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
          {/* Total Amount Display - Show when there are items */}
          {/* {displayTotal > 0 && (
            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountText}>
                ${displayTotal.toFixed(2)}
              </Text>
            </View>
          )} */}

          {/* Inventory Management Button */}
          <TouchableOpacity 
            style={styles.inventoryButton}
            onPress={()=>router.push('/Screens/Admin/InventoryManagement')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="storefront" 
              size={20} 
              color="#2563eb" 
            />
          </TouchableOpacity>

          {/* Order Count Display */}
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
            onPress={handleAddUserPress}
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

      {/* Save Customer Modal */}
      <Modal
        visible={showCustomerModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={handleCloseCustomerModal}
      >
        <SaveCustomer
          onSave={handleSaveCustomer}
          onCancel={handleCloseCustomerModal}
          existingCustomers={existingCustomers}
        />
      </Modal>
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
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  orderContainerActive: {
    backgroundColor: '#2563eb',
  },
  orderBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  orderCount: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  totalAmountContainer: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  totalAmountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  inventoryButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  addUserButton: {
    backgroundColor: '#2563eb',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});