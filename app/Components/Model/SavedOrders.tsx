import { CheckOutOrder, getRecept } from '@/app/Api/Services/Orders';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getOrders } from '../../Api/Services/Products';
import Loader from '../../Components/Loader/Loarder';
import { usePrinter } from '../../Contex/PrinterContex';

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

interface ReceiptData {
  order_id: string;
  customer_name: string;
  order_date: string;
  items: OrderItem[];
  total_amount: string;
  payment_method: string;
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
    console.log('Checkout response:', response);
    return response;
  } catch (error: any) {
    console.error('Checkout error:', error);
  }
};

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SavedOrders() {
  const navigation = useNavigation();
  const { printTestText, isConnected, connectedDevice, printing } = usePrinter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{ [key: string]: string }>({});
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<{ [key: string]: string }>({});
  const [processingOrders, setProcessingOrders] = useState<{ [key: string]: boolean }>({});
  // Receipt Modal States
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  // Log modal state changes for debugging
  useEffect(() => {
    console.log('showReceiptModal state:', showReceiptModal, 'currentOrderId:', currentOrderId);
  }, [showReceiptModal, currentOrderId]);

  // Initial load
  useEffect(() => {
    fetchOrders(true);
  }, []);

  // Focus-based reload
  useFocusEffect(
    useCallback(() => {
      if (!initialLoading) {
        fetchOrders(false);
      }
    }, [initialLoading])
  );

  useEffect(() => {
    const methods = orders.reduce((acc, order) => {
      acc[order.id] = order.payment_method || '';
      return acc;
    }, {} as { [key: string]: string });
    setSelectedPaymentMethod(methods);

    const statuses = orders.reduce((acc, order) => {
      acc[order.id] = order.payment_status || 'Paid';
      return acc;
    }, {} as { [key: string]: string });
    setSelectedPaymentStatus(statuses);
  }, [orders]);

  const fetchOrders = async (isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await getOrders();
      console.log('getOrders response:', response);
      const validOrders = (response.data || []).filter(
        (order: Order) => order.id && order.payment_status?.toLowerCase() !== 'paid'
      );
      setOrders(validOrders);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    fetchOrders(false);
  }, []);

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

  const isButtonDisabled = (orderId: string) => {
    const paymentMethod = selectedPaymentMethod[orderId];
    const paymentStatus = selectedPaymentStatus[orderId];
    const isProcessing = processingOrders[orderId];
    return !paymentMethod || paymentMethod.trim() === '' || !paymentStatus || paymentStatus.trim() === '' || isProcessing;
  };

  const setOrderProcessing = (orderId: string, processing: boolean) => {
    setProcessingOrders(prev => ({
      ...prev,
      [orderId]: processing
    }));
  };

  const showReceiptPrompt = (orderId: string) => {
    console.log('Showing receipt prompt for order:', orderId);
    setCurrentOrderId(orderId);
    setShowReceiptModal(true);
  };

  const fetchReceiptData = async (orderId: string) => {
    try {
      setLoadingReceipt(true);
      const response = await getRecept(orderId);
      console.log('Receipt data:', JSON.stringify(response, null, 2));
      if (response) {
        setReceiptData(response.data);
      } else {
        Alert.alert('Error', 'Failed to load receipt data');
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      Alert.alert('Error', 'Failed to load receipt data');
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleReceiptResponse = async (wantReceipt: boolean) => {
    console.log('handleReceiptResponse called, wantReceipt:', wantReceipt, 'currentOrderId:', currentOrderId);
    if (wantReceipt && currentOrderId) {
      await fetchReceiptData(currentOrderId);
    } else {
      setShowReceiptModal(false);
      setCurrentOrderId(null);
      setReceiptData(null);
      handleClose();
    }
  };

  const closeReceiptAndGoHome = () => {
    console.log('Closing receipt modal and navigating home');
    setShowReceiptModal(false);
    setCurrentOrderId(null);
    setReceiptData(null);
    handleClose();
  };

  // Format receipt data for printing (optimized for thermal printer)
  const formatReceiptForPrint = (data: ReceiptData): string => {
    const ticketNumber = `TKT-${data.order_date.split('T')[0] || new Date().toISOString().split('T')[0]}-001`;
    
    // Use very simple formatting
    let receipt = '';
    
    receipt += '================================\n';
    receipt += 'RESTAURANT NAME\n'; // Placeholder for store name
    receipt += '================================\n\n';
    
    receipt += 'Ticket: ' + ticketNumber + '\n';
    receipt += 'Order: #' + data.order_id + '\n';
    receipt += 'Date: ' + new Date(data.order_date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + '\n';
    receipt += 'Customer: ' + data.customer_name + '\n';
    receipt += '\n================================\n';
    receipt += 'ITEMS\n';
    receipt += '================================\n\n';
    
    // Items
    data.items.forEach((item, index) => {
      receipt += (index + 1) + '. ' + item.menu_item_name + '\n';
      receipt += '   ' + item.quantity + ' x Rs' + parseFloat(item.price || item.menu_item_price || '0').toFixed(2) + '\n\n';
    });
    
    receipt += '--------------------------------\n';
    receipt += 'TOTAL: Rs' + parseFloat(data.total_amount || '0').toFixed(2) + '\n';
    receipt += '================================\n\n';
    
    receipt += 'Payment: ' + data.payment_method + '\n';
    
    receipt += 'Thank you!\n';
    receipt += '\n\n\n';
    
    return receipt;
  };

  const handlePrint = async (receiptData: ReceiptData) => {
    console.log('📄 Starting print process...');
    
    // Check if printer is connected
    if (!isConnected || !connectedDevice) {
      Alert.alert('Printer Not Connected', 'Please connect to a printer first.');
      return;
    }
    
    // Check if already printing
    if (printing) {
      Alert.alert('Please Wait', 'Printer is busy. Please wait for current job to complete.');
      return;
    }
    
    try {
      console.log('📝 Formatting receipt...');
      const formattedReceipt = formatReceiptForPrint(receiptData);
      
      console.log('📏 Receipt length:', formattedReceipt.length);
      console.log('🖨️ Sending receipt to printer...');
      
      // The printTestText function will show its own Alert when done
      await printTestText(formattedReceipt);
      
      console.log('✅ Print function completed');
      
    } catch (error: any) {
      console.log('❌ Print error:', error);
      // Only show error alert if printTestText didn't already show one
      if (!error?.message?.includes('Not connected')) {
        Alert.alert('Print Error', 'Failed to print receipt: ' + (error?.message || 'Unknown error'));
      }
    }
  };

  const handleSaveOrder = async (order: Order) => {
    if (isButtonDisabled(order.id)) {
      Alert.alert('Missing Information', 'Please select payment method and status');
      return;
    }

    try {
      setOrderProcessing(order.id, true);

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
      Alert.alert('Error', 'Failed to save order. Please try again.');
    } finally {
      setOrderProcessing(order.id, false);
    }
  };

 
const handleCheckout = async (order: Order) => {
  if (isButtonDisabled(order.id)) {
    Alert.alert('Missing Information', 'Please select payment method and status');
    return;
  }

  try {
    setOrderProcessing(order.id, true);
    const checkoutData = {
      order: parseInt(order.id),
      payment_method: selectedPaymentMethod[order.id],
      payment_status: selectedPaymentStatus[order.id],
      total_price: parseFloat(order.total_price || '0'),
    };

    console.log('Sending checkout data:', JSON.stringify(checkoutData, null, 2));
    const response = await CheckOut(checkoutData);
    console.log('Checkout response:', JSON.stringify(response, null, 2));

    if (response && (response.status === 200 || response.status === 201)) {
      console.log('Checkout successful, triggering receipt prompt for order:', order.id);
      // Remove the order from the list immediately
      setOrders(orders.filter((o) => o.id !== order.id));
      // Show receipt prompt modal directly - no alert
      showReceiptPrompt(order.id);
    } else {
      Alert.alert('Error', response?.message || 'Failed to process checkout');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    Alert.alert('Error', 'Failed to process checkout. Please try again.');
  } finally {
    setOrderProcessing(order.id, false);
  }
};
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#6b7280'; // Changed from yellow to gray
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

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'cash-outline';
      case 'Card':
        return 'card-outline';
      case 'UPI':
        return 'phone-portrait-outline';
      case 'Tabby':
        return 'card-outline';
      case 'Bank Transfer':
        return 'business-outline';
      case 'Digital Wallet':
        return 'wallet-outline';
      case 'Split Payment':
        return 'swap-horizontal-outline';
      default:
        return 'help-outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'checkmark-circle-outline';
      default:
        return 'help-outline';
    }
  };

  const renderReceiptModal = () => {
    console.log('Rendering receipt modal, showReceiptModal:', showReceiptModal);
    return (
      <Modal
        visible={showReceiptModal}
        transparent={true}
        animationType="fade" // Changed to fade for better compatibility
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {!receiptData ? (
              <>
                <View style={styles.modalHeader}>
                  <Ionicons name="checkmark-circle" size={60} color="#10b981" />
                  <Text style={styles.modalTitle}>Order Processed Successfully!</Text>
                  <Text style={styles.modalSubtitle}>Would you like to print a receipt?</Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={() => handleReceiptResponse(false)}
                    disabled={loadingReceipt}
                  >
                    <Text style={styles.modalButtonTextSecondary}>No, Thanks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={async () => {
                      // Check printer status before proceeding
                      if (!isConnected || !connectedDevice) {
                        Alert.alert('Printer Not Connected', 'Please connect to a printer first.');
                        return;
                      }
                      if (printing) {
                        Alert.alert('Please Wait', 'Printer is busy. Please wait for current job to complete.');
                        return;
                      }
                      handleReceiptResponse(true);
                    }}
                    disabled={loadingReceipt}
                  >
                    {loadingReceipt ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="print-outline" size={20} color="#ffffff" />
                        <Text style={styles.modalButtonTextPrimary}>Yes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.receiptHeader}>
                  <Text style={styles.receiptTitle}>Receipt</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeReceiptAndGoHome}
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.receiptContent}>
                  <View style={styles.receiptSection}>
                    <Text style={styles.receiptLabel}>Order ID:</Text>
                    <Text style={styles.receiptValue}>#{receiptData.order_id}</Text>
                  </View>

                  <View style={styles.receiptSection}>
                    <Text style={styles.receiptLabel}>Customer:</Text>
                    <Text style={styles.receiptValue}>{receiptData.customer_name}</Text>
                  </View>

                  <View style={styles.receiptSection}>
                    <Text style={styles.receiptLabel}>Date:</Text>
                    <Text style={styles.receiptValue}>{receiptData.order_date}</Text>
                  </View>

                  <View style={styles.receiptSection}>
                    <Text style={styles.receiptLabel}>Payment Method:</Text>
                    <Text style={styles.receiptValue}>{receiptData.payment_method}</Text>
                  </View>

                  <View style={styles.receiptDivider} />

                  <Text style={styles.receiptSectionTitle}>Items:</Text>
                  {receiptData.items?.map((item, index) => (
                    <View key={index} style={styles.receiptItem}>
                      <View style={styles.receiptItemLeft}>
                        <Text style={styles.receiptItemName}>{item.menu_item_name}</Text>
                        <Text style={styles.receiptItemQuantity}>x{item.quantity}</Text>
                      </View>
                      <Text style={styles.receiptItemPrice}>
                        ₹{parseFloat(item.price || item.menu_item_price || '0').toFixed(2)}
                      </Text>
                    </View>
                  ))}

                  <View style={styles.receiptDivider} />

                  <View style={styles.receiptTotal}>
                    <Text style={styles.receiptTotalLabel}>Total Amount:</Text>
                    <Text style={styles.receiptTotalValue}>
                      ₹{parseFloat(receiptData.total_amount || '0').toFixed(2)}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.receiptActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={async () => {
                      if (receiptData) {
                        await handlePrint(receiptData);
                        Alert.alert('Success', `Receipt sent to printer: ${connectedDevice}!`, [
                          { text: 'OK', onPress: closeReceiptAndGoHome }
                        ]);
                      }
                    }}
                  >
                    <Ionicons name="print-outline" size={20} color="#ffffff" />
                    <Text style={styles.modalButtonTextPrimary}>Print Receipt</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={closeReceiptAndGoHome}
                  >
                    <Text style={styles.modalButtonTextSecondary}>Done</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrderId === item.id;
    const paymentMethods = ['Cash', 'Card', 'UPI', 'Tabby', 'Bank Transfer', 'Digital Wallet', 'Split Payment'];
    const paymentStatuses = ['Paid'];
    const buttonsDisabled = isButtonDisabled(item.id);
    const isProcessing = processingOrders[item.id];

    const orderItems = item.checkout_items || item.saved_items || item.items || [];

    const PaymentMethodButton = ({ method, label, icon, selectedMethod, onSelect }: { method: string; label: string; icon: string; selectedMethod: string; onSelect: (value: string) => void }) => (
      <TouchableOpacity
        style={[
          styles.paymentButton,
          selectedMethod === method && styles.paymentButtonActive
        ]}
        onPress={() => onSelect(method)}
        disabled={isProcessing}
      >
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={selectedMethod === method ? '#ffffff' : '#666666'} 
        />
        <Text style={[
          styles.paymentButtonText,
          selectedMethod === method && styles.paymentButtonTextActive
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );

    const PaymentStatusButton = ({ status, selectedStatus, onSelect }: { status: string; selectedStatus: string; onSelect: (value: string) => void }) => (
      <TouchableOpacity
        style={[
          styles.paymentButton,
          selectedStatus === status && styles.paymentButtonActive
        ]}
        onPress={() => onSelect(status)}
        disabled={isProcessing}
      >
        <Ionicons 
          name={getStatusIcon(status) as any} 
          size={16} 
          color={selectedStatus === status ? '#ffffff' : '#666666'} 
        />
        <Text style={[
          styles.paymentButtonText,
          selectedStatus === status && styles.paymentButtonTextActive
        ]}>
          {status}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.orderCard}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.orderHeader}>
          <View style={styles.orderLeft}>
            <View style={styles.orderMethodIconContainer}>
              <Ionicons name={getOrderMethodIcon(item.order_method)} size={24} color="#ffffff" />
            </View>
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
            {isProcessing ? (
              <ActivityIndicator size="small" color="#2563eb" style={styles.expandIcon} />
            ) : (
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#6b7280"
                style={styles.expandIcon}
              />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.orderDetails}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items ({orderItems.length})</Text>
              {orderItems.map((orderItem, idx) => (
                <View key={orderItem.id || idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{orderItem.menu_item_name || 'Unknown Item'}</Text>
                    <Text style={styles.itemQuantity}>x{orderItem.quantity || 1}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ₹{parseFloat(orderItem.price || orderItem.menu_item_price || '0').toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>

              <View style={styles.paymentSection}>
                <Text style={styles.inputLabel}>
                  Payment Method
                  <Text style={styles.requiredAsterisk}> *</Text>
                </Text>
                <View style={styles.paymentGrid}>
                  {paymentMethods.map((method) => (
                    <PaymentMethodButton
                      key={method}
                      method={method}
                      label={method}
                      icon={getPaymentIcon(method)}
                      selectedMethod={selectedPaymentMethod[item.id] || ''}
                      onSelect={(value) =>
                        setSelectedPaymentMethod({
                          ...selectedPaymentMethod,
                          [item.id]: value,
                        })
                      }
                    />
                  ))}
                </View>
              </View>

              <View style={styles.paymentSection}>
                <Text style={styles.inputLabel}>
                  Payment Status
                  <Text style={styles.requiredAsterisk}> *</Text>
                </Text>
                <View style={styles.paymentGrid}>
                  {paymentStatuses.map((status) => (
                    <PaymentStatusButton
                      key={status}
                      status={status}
                      selectedStatus={selectedPaymentStatus[item.id] || ''}
                      onSelect={(value) =>
                        setSelectedPaymentStatus({
                          ...selectedPaymentStatus,
                          [item.id]: value,
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            </View>

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
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={[
                    styles.buttonText,
                    buttonsDisabled && styles.buttonTextDisabled
                  ]}>
                    Save
                  </Text>
                )}
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
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={[
                    styles.buttonText,
                    buttonsDisabled && styles.buttonTextDisabled
                  ]}>
                    Checkout
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {buttonsDisabled && !isProcessing && (
              <Text style={styles.helperText}>
                Please select payment method and status to proceed
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Loader />
      </SafeAreaView>
    );
  }

  if (error && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrders(false)}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {orders.length > 0 && (
        <View style={styles.countBanner}>
          <Text style={styles.countText}>
            {orders.length} saved order{orders.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
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
      {renderReceiptModal()}
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
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  orderMethodIconContainer: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 8,
    marginRight: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  orderSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  orderPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  expandIcon: {
    marginLeft: 8,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    padding: 20,
    paddingTop: 0,
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
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#64748b',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
    minWidth: 80,
    textAlign: 'right',
  },
  paymentSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  requiredAsterisk: {
    color: '#ef4444',
    fontWeight: '700',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 6,
    minWidth: '48%',
    flex: 1,
  },
  paymentButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  paymentButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  paymentButtonTextActive: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 50,
  },
  modalButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  modalButtonSecondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  receiptContent: {
    maxHeight: 400,
  },
  receiptSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  receiptSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  receiptItemLeft: {
    flex: 1,
    marginRight: 16,
  },
  receiptItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  receiptItemQuantity: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  receiptItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  receiptTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  receiptTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});