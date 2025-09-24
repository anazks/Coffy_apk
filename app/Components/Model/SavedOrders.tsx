import { CheckOutOrder } from '@/app/Api/Services/Orders';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getOrders } from '../../Api/Services/Products';
import Loader from '../../Components/Loader/Loarder';

// Define interfaces for type safety
interface OrderItem {
  id: string;
  menu_item_name: string;
  quantity: number;
  price: string;
  menu_item_price?: string;
}

interface Order {
  id: string;
  order_method: string;
  user_name: string;
  total_price: string;
  payment_method?: string;
  payment_status?: string;
  saved_items?: OrderItem[];
  checkout_items?: OrderItem[];
  items?: OrderItem[];
}

// Placeholder CheckOut function
const CheckOut = async (checkoutData: {
  order: number;
  payment_method: string;
  payment_status: string;
  total_price: number;
}) => {
  console.log('Checkout API called with:', checkoutData);
  try {
    const response = await CheckOutOrder(checkoutData);
    console.log(response, 'checkout response');
    return response;
  } catch (error) {
    // console.error('Checkout error:', error);
    throw error;
  }
};

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SavedOrders() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{ [key: string]: string }>({});
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const methods = orders.reduce((acc, order) => {
      acc[order.id] = order.payment_method || '';
      return acc;
    }, {} as { [key: string]: string });
    setSelectedPaymentMethod(methods);

    const statuses = orders.reduce((acc, order) => {
      acc[order.id] = order.payment_status || '';
      return acc;
    }, {} as { [key: string]: string });
    setSelectedPaymentStatus(statuses);
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders();
      console.log('getOrders response:', response);
      const validOrders = (response.data || []).filter(
        (order: Order) => order.id && order.payment_status?.toLowerCase() !== 'paid'
      );
      setOrders(validOrders);
    } catch (err) {
      // console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleClose = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const updateOrder = async (orderId: string, updatedData: { payment_method: string; payment_status: string }) => {
    console.log('Updating order:', orderId, updatedData);
    return { status: 200, message: 'Order updated successfully' };
  };

  // Enhanced function to check if buttons should be disabled
  const isButtonDisabled = (orderId: string) => {
    const paymentMethod = selectedPaymentMethod[orderId];
    const paymentStatus = selectedPaymentStatus[orderId];
    
    // Check if either field is empty, null, undefined, or just whitespace
    return !paymentMethod || 
           !paymentStatus || 
           paymentMethod.trim() === '' || 
           paymentStatus.trim() === '';
  };

  const handleSaveOrder = async (order: Order) => {
    if (isButtonDisabled(order.id)) {
      Alert.alert('Missing Information', 'Please select both payment method and payment status');
      return;
    }
    
    try {
      const updatedData = {
        payment_method: selectedPaymentMethod[order.id],
        payment_status: selectedPaymentStatus[order.id],
      };
      const response = await updateOrder(order.id, updatedData);
      if (response.status === 200) {
        Alert.alert('Success', 'Order saved successfully!', [
          {
            text: 'Continue',
            onPress: () => {
              setOrders(
                orders
                  .map((o) => (o.id === order.id ? { ...o, ...updatedData } : o))
                  .filter((o) => o.payment_status?.toLowerCase() !== 'paid')
              );
              setExpandedOrderId(null);
            },
          },
          {
            text: 'Go Home',
            onPress: handleClose,
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to save order');
      }
    } catch (error) {
      // console.error('Error saving order:', error);
      Alert.alert('Error', 'Failed to save order. Please try again.');
    }
  };

  const handleCheckout = async (order: Order) => {
    if (isButtonDisabled(order.id)) {
      Alert.alert('Missing Information', 'Please select both payment method and payment status');
      return;
    }
    
    try {
      const checkoutData = {
        order: parseInt(order.id),
        payment_method: selectedPaymentMethod[order.id],
        payment_status: selectedPaymentStatus[order.id],
        total_price: parseFloat(order.total_price || '0'),
      };

      console.log('Sending checkout data:', JSON.stringify(checkoutData, null, 2));
      const response = await CheckOut(checkoutData);
      console.log('Checkout response:', response);

      if (response && (response.status === 200 || response.status === 201)) {
        Alert.alert('Success', 'Order processed successfully!', [
          {
            text: 'Great!',
            onPress: () => {
              setOrders(orders.filter((o) => o.id !== order.id));
              handleClose();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response?.message || 'Failed to process checkout');
      }
    } catch (error) {
      // console.error('Error processing checkout:', error);
      Alert.alert('Error', 'Please select payment method and status to proceed');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'paid':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'refunded':
        return '#8b5cf6';
      case 'partial':
        return '#f97316';
      default:
        return '#6b7280';
    }
  };

  const getOrderMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'takeaway':
        return 'bag-outline';
      case 'dine-in':
        return 'restaurant-outline';
      case 'delivery':
        return 'bicycle-outline';
      default:
        return 'receipt-outline';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrderId === item.id;
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Tabby', 'Bank Transfer', 'Digital Wallet', 'Split Payment'];
    const paymentStatuses = ['Pending', 'Failed', 'Partial', 'Refunded','Paid'];
    const buttonsDisabled = isButtonDisabled(item.id);

    // Get items from checkout_items, fallback to saved_items or items
    const orderItems = item.checkout_items || item.saved_items || item.items || [];

    return (
      <View style={styles.orderCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.orderHeader}>
          <View style={styles.orderLeft}>
            <Ionicons name={getOrderMethodIcon(item.order_method)} size={24} color="#2563eb" />
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>Order #{item.id}</Text>
              <Text style={styles.orderSubtitle}>
                {item.order_method || 'Unknown'} • {item.user_name || 'Guest'}
              </Text>
            </View>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderPrice}>₹{parseFloat(item.total_price || '0').toFixed(2)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.payment_status) }]}>
              <Text style={styles.statusText}>{item.payment_status || 'Pending'}</Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#6b7280"
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.orderDetails}>
            {/* Items List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items ({orderItems.length})</Text>
              {orderItems.map((orderItem, idx) => (
                <View key={orderItem.id || idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{orderItem.menu_item_name || 'Unknown Item'}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuantity}>x{orderItem.quantity || 1}</Text>
                    <Text style={styles.itemPrice}>₹{parseFloat(orderItem.price || orderItem.menu_item_price || '0').toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Payment Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>
                  Payment Method 
                  <Text style={styles.requiredAsterisk}> *</Text>
                </Text>
                <View style={[
                  styles.pickerContainer, 
                  !selectedPaymentMethod[item.id] && styles.pickerError
                ]}>
                  <Picker
                    selectedValue={selectedPaymentMethod[item.id] || ''}
                    onValueChange={(value) =>
                      setSelectedPaymentMethod({
                        ...selectedPaymentMethod,
                        [item.id]: value,
                      })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Payment Method" value="" />
                    {paymentMethods.map((method) => (
                      <Picker.Item key={method} label={method} value={method} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>
                  Payment Status 
                  <Text style={styles.requiredAsterisk}> *</Text>
                </Text>
                <View style={[
                  styles.pickerContainer,
                  !selectedPaymentStatus[item.id] && styles.pickerError
                ]}>
                  <Picker
                    selectedValue={selectedPaymentStatus[item.id] || ''}
                    onValueChange={(value) =>
                      setSelectedPaymentStatus({
                        ...selectedPaymentStatus,
                        [item.id]: value,
                      })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Payment Status" value="" />
                    {paymentStatuses.map((status) => (
                      <Picker.Item key={status} label={status} value={status} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.saveButton, 
                  buttonsDisabled && styles.buttonDisabled
                ]}
                onPress={() => handleSaveOrder(item)}
                disabled={buttonsDisabled}
              >
                <Text style={[
                  styles.buttonText,
                  buttonsDisabled && styles.buttonTextDisabled
                ]}>
                  Save
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.checkoutButton, 
                  buttonsDisabled && styles.buttonDisabled
                ]}
                onPress={() => handleCheckout(item)}
                disabled={buttonsDisabled}
              >
                <Text style={[
                  styles.buttonText,
                  buttonsDisabled && styles.buttonTextDisabled
                ]}>
                  Checkout
                </Text>
              </TouchableOpacity>
            </View>

            {/* Helper text when buttons are disabled */}
            {buttonsDisabled && (
              <Text style={styles.helperText}>
                Please select both payment method and status to proceed
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Loader />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Orders Count */}
      {orders.length > 0 && (
        <View style={styles.countBanner}>
          <Text style={styles.countText}>
            {orders.length} saved order{orders.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={100} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Saved Orders</Text>
            <Text style={styles.emptyText}>You haven't saved any orders yet. Start creating one!</Text>
            <TouchableOpacity style={styles.shopButton} onPress={handleClose}>
              <Text style={styles.shopButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  countBanner: {
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  countText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginBottom: 8,
    borderWidth: 0,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  expandIcon: {
    marginTop: 8,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginRight: 16,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#64748b',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  inputRow: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#ef4444',
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pickerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  picker: {
    height: 48,
    color: '#1e293b',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6b7280',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
  helperText: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});