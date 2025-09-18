import { CheckOutOrder } from '@/app/Api/Services/Orders';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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


// If CheckOut doesn't exist, we'll create a placeholder function
// Replace this with your actual API call
const CheckOut = async (checkoutData) => {
  console.log('Checkout API called with:', checkoutData);
    try {
      let response = await CheckOutOrder(checkoutData)
      console.log(response,"checkout reposne")
    } catch (error) {
      console.log(error)
    }
  
};

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SavedOrders() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({});
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      console.log('getOrders response:', response);
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleClose = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const updateOrder = async (orderId, updatedData) => {
    console.log('Updating order:', orderId, updatedData);
    // This is a placeholder - replace with your actual API implementation
    return { status: 200, message: 'Order updated successfully' };
  };

  const handleSaveOrder = async (order) => {
    if (!selectedPaymentMethod[order.id] || !selectedPaymentStatus[order.id]) {
      Alert.alert('Missing Information', 'Please select payment method and status');
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
              setOrders(orders.map(o => 
                o.id === order.id ? { ...o, ...updatedData } : o
              ));
              setExpandedOrderId(null);
            }
          },
          { 
            text: 'Go Home', 
            onPress: handleClose
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      Alert.alert('Error', 'Failed to save order. Please try again.');
    }
  };

  const handleCheckout = async (order) => {
    if (!selectedPaymentMethod[order.id] || !selectedPaymentStatus[order.id]) {
      Alert.alert('Missing Information', 'Please select payment method and status');
      return;
    }
    try {
      const checkoutData = {
        order: parseInt(order.id),
        payment_method: selectedPaymentMethod[order.id],
        payment_status: selectedPaymentStatus[order.id],
        // Add any other required fields based on your API documentation
      };
      
      console.log('Sending checkout data:', JSON.stringify(checkoutData, null, 2));
      const response = await CheckOut(checkoutData);
      console.log('Checkout response:', response);
      
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Order processed successfully!', [
          { 
            text: 'Great!', 
            onPress: () => {
              // Remove the order from the list after successful checkout
              setOrders(orders.filter(o => o.id !== order.id));
              handleClose();
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to process checkout');
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      Alert.alert('Error', 'Failed to process checkout. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'paid': return '#10b981';
      case 'failed': return '#ef4444';
      case 'refunded': return '#8b5cf6';
      case 'partial': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getOrderMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'takeaway': return 'bag-outline';
      case 'dine-in': return 'restaurant-outline';
      case 'delivery': return 'bicycle-outline';
      default: return 'receipt-outline';
    }
  };

  const renderOrderItem = ({ item }) => {
    const isExpanded = expandedOrderId === item.id;
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Tabby', 'Bank Transfer', 'Digital Wallet', 'Split Payment'];
    const paymentStatuses = ['Pending', 'Paid', 'Failed', 'Partial'];

    return (
      <View style={styles.orderCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.orderHeader}>
          <View style={styles.orderLeft}>
            <Ionicons 
              name={getOrderMethodIcon(item.order_method)} 
              size={20} 
              color="#2563eb" 
            />
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>Order #{item.id}</Text>
              <Text style={styles.orderSubtitle}>
                {item.order_method} • {item.user_name}
              </Text>
            </View>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderPrice}>₹{parseFloat(item.total_price || 0).toFixed(2)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.payment_status) }]}>
              <Text style={styles.statusText}>{item.payment_status || 'Unknown'}</Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9ca3af"
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.orderDetails}>
            {/* Items List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items ({item.saved_items?.length || 0})</Text>
              {(item.saved_items || []).map((savedItem, idx) => (
                <View key={savedItem.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{savedItem.menu_item_name || 'Unknown Item'}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuantity}>Qty: {savedItem.quantity || 1}</Text>
                    <Text style={styles.itemPrice}>₹{parseFloat(savedItem.price || 0).toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Payment Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedPaymentMethod[item.id] || ''}
                    onValueChange={(value) => setSelectedPaymentMethod({
                      ...selectedPaymentMethod,
                      [item.id]: value,
                    })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Method" value="" />
                    {paymentMethods.map((method) => (
                      <Picker.Item key={method} label={method} value={method} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Payment Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedPaymentStatus[item.id] || ''}
                    onValueChange={(value) => setSelectedPaymentStatus({
                      ...selectedPaymentStatus,
                      [item.id]: value,
                    })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Status" value="" />
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
                style={[styles.button, styles.saveButton]}
                onPress={() => handleSaveOrder(item)}
                disabled={!selectedPaymentMethod[item.id] || !selectedPaymentStatus[item.id]}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.checkoutButton]}
                onPress={() => handleCheckout(item)}
                disabled={!selectedPaymentMethod[item.id] || !selectedPaymentStatus[item.id]}
              >
                <Text style={styles.buttonText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Orders</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Orders</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Orders</Text>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      
      {/* Orders Count */}
      {orders.length > 0 && (
        <View style={styles.countBanner}>
          <Text style={styles.countText}>{orders.length} saved orders</Text>
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
            <Ionicons name="receipt-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Saved Orders</Text>
            <Text style={styles.emptyText}>You haven't saved any orders yet.</Text>
            <TouchableOpacity style={styles.shopButton} onPress={handleClose}>
              <Text style={styles.shopButtonText}>Start Shopping</Text>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  
  // Count Banner
  countBanner: {
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  countText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // List Container
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Order Card
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  
  // Order Header
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  orderSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  expandIcon: {
    marginTop: 4,
  },
  
  // Order Details
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    padding: 16,
  },
  
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  
  // Item Row
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginRight: 12,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  
  // Input Row
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
  },
  picker: {
    height: 44,
    color: '#374151',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6b7280',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});