import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderDetailsModal from '../../Components/OrderDetails/OrderDetailsModal';
import SaveCustomer from '../../Components/SaveOptions/SaveCustomer';

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
  onSaveCustomer?: (customer: Customer) => void;
  existingCustomers?: Customer[];
  onInventoryPress?: () => void;
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
  onInventoryPress = () => {},
}: NavProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const orderCount = selectedProducts.length;

  const calculatedTotal = selectedProducts.reduce((sum, product) => {
    const price = product.hasDiscount && product.discountPrice
      ? product.discountPrice
      : product.price;
    return sum + price * product.quantity;
  }, 0);

  const displayTotal = totalAmount > 0 ? totalAmount : calculatedTotal;

  const handleOrdersPress = () => {
    if (orderCount > 0) {
      setShowOrderModal(true);
    } else {
      onOrdersPress();
    }
  };

  const handleOrderComplete = (orderData: OrderData) => {
    onOrderComplete(orderData);
    console.log('Order completed:', orderData);
  };

  const handleSaveOrder = (orderData: Partial<OrderData>) => {
    onSaveOrder(orderData);
    console.log('Order saved:', orderData);
  };

  const handleAddUserPress = () => {
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = (customer: Customer) => {
    onSaveCustomer(customer);
    setShowCustomerModal(false);
    console.log('Customer saved:', customer);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.appTitle}>Coffy Byte</Text>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.inventoryButton}
            onPress={() => router.push('/Screens/Admin/InventoryManagement')}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="Go to inventory management"
          >
            <Ionicons name="storefront" size={20} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderContainer, orderCount > 0 && styles.orderContainerActive]}
            onPress={handleOrdersPress}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="View orders"
          >
            <Ionicons
              name="receipt"
              size={20}
              color={orderCount > 0 ? "#FFFFFF" : "#2563EB"}
            />
            {orderCount > 0 && (
              <View style={styles.orderBadge}>
                <Text style={styles.orderCount}>
                  {orderCount > 99 ? '99+' : orderCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addUserButton}
            onPress={handleAddUserPress}
            activeOpacity={0.7}
            accessible
            accessibilityLabel="Add new customer"
          >
            <Ionicons name="person-add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <OrderDetailsModal
        visible={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        selectedProducts={selectedProducts}
        onOrderComplete={handleOrderComplete}
        onSaveOrder={handleSaveOrder}
      />
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  orderContainerActive: {
    backgroundColor: '#2563EB',
  },
  orderBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  orderCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  inventoryButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  addUserButton: {
    backgroundColor: '#2563EB',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});