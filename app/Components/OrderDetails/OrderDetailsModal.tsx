import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CheckOutOrder } from '../../Api/Services/Orders';
import { CreateOrder } from '../../Api/Services/Products';

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
  modifier?: string;
}

interface ProductWithQuantity extends Product {
  quantity: number;
}

interface OrderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProducts: ProductWithQuantity[];
  onOrderComplete: (orderData: OrderData) => void;
  onSaveOrder?: (orderData: Partial<OrderData>) => void;
}

type PaymentMethodType = 'cash' | 'card' | 'upi' | 'tabby' | 'bank-transfer' | 'digital-wallet' | 'split';

interface OrderData {
  products: ProductWithQuantity[];
  orderType: 'dine-in' | 'takeout' | 'delivery';
  ticketName: string;
  comment: string;
  paymentMethod?: PaymentMethodType;
  cashAmount?: number;
  cardAmount?: number;
  upiAmount?: number;
  tabbyAmount?: number;
  bankTransferAmount?: number;
  digitalWalletAmount?: number;
  totalAmount: number;
  customerEmail?: string;
  timestamp: Date;
  isCompleted?: boolean;
  tableId?: number;
}

export default function OrderDetailsModal({
  visible,
  onClose,
  selectedProducts,
  onOrderComplete,
  onSaveOrder = () => {},
}: OrderDetailsModalProps) {
  const navigation = useNavigation();
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');
  const [ticketName, setTicketName] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
  const [tabbyAmount, setTabbyAmount] = useState('');
  const [bankTransferAmount, setBankTransferAmount] = useState('');
  const [digitalWalletAmount, setDigitalWalletAmount] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tableId, setTableId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  // Calculate subtotal
  const totalAmount = selectedProducts.reduce((sum, product) => {
    const price = product.hasDiscount && product.discountPrice 
      ? product.discountPrice 
      : product.price;
    return sum + (price * product.quantity);
  }, 0);

  // Reset form when modal closes
  const handleClose = () => {
    setOrderType('dine-in');
    setTicketName('');
    setComment('');
    setPaymentMethod('cash');
    setCashAmount('');
    setCardAmount('');
    setUpiAmount('');
    setTabbyAmount('');
    setBankTransferAmount('');
    setDigitalWalletAmount('');
    setCustomerEmail('');
    setTableId('');
    setIsProcessing(false);
    setShowPaymentSection(false);
    onClose();
  };

  // Map orderType to API's order_method
  const mapOrderMethod = (type: 'dine-in' | 'takeout' | 'delivery') => {
    switch (type) {
      case 'dine-in':
        return 'Dine In';
      case 'takeout':
        return 'Takeaway';
      case 'delivery':
        return 'Delivery';
      default:
        return 'Dine In';
    }
  };

  // Map payment method for API
  const mapPaymentMethodForAPI = (method: PaymentMethodType) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'upi':
        return 'UPI';
      case 'tabby':
        return 'Tabby';
      case 'bank-transfer':
        return 'Bank Transfer';
      case 'digital-wallet':
        return 'Digital Wallet';
      case 'split':
        return 'Split Payment';
      default:
        return 'Cash';
    }
  };

  // Format data for CreateOrder API
  const formatOrderData = (isSavedForLater: boolean) => {
    const data: any = {
      order_method: mapOrderMethod(orderType),
      items: selectedProducts.map(product => {
        const item: any = {
          menu_item_id: parseInt(product.id) || null,
          quantity: product.quantity || 1,
        };
        
        if (comment.trim()) {
          item.special_instructions = comment.trim();
        }
        
        if (product.modifier && !isNaN(parseInt(product.modifier))) {
          item.add_ons = [parseInt(product.modifier)];
        }
        
        return item;
      }),
    };
    
    if (ticketName.trim()) {
      data.ticket_name = ticketName.trim();
    }
    
    if (orderType === 'dine-in' && tableId.trim() && !isNaN(parseInt(tableId))) {
      data.table_id = parseInt(tableId);
    }
    
    return data;
  };

  // Validate split payment amounts
  const validateSplitPayment = () => {
    if (paymentMethod !== 'split') return true;
    
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    const upi = parseFloat(upiAmount) || 0;
    const tabby = parseFloat(tabbyAmount) || 0;
    const bankTransfer = parseFloat(bankTransferAmount) || 0;
    const digitalWallet = parseFloat(digitalWalletAmount) || 0;
    
    const total = cash + card + upi + tabby + bankTransfer + digitalWallet;
    return Math.abs(total - totalAmount) < 0.01;
  };

  // Handle save order
  const handleSaveOrder = async () => {
    if (!selectedProducts.length) {
      Alert.alert('Missing Information', 'Please add at least one item to the order');
      return;
    }

    const orderData: Partial<OrderData> = {
      products: selectedProducts,
      orderType,
      ticketName: ticketName.trim() || `Order ${new Date().toLocaleTimeString()}`,
      comment: comment.trim(),
      totalAmount,
      timestamp: new Date(),
      isCompleted: false,
      tableId: orderType === 'dine-in' && tableId.trim() ? parseInt(tableId) || undefined : undefined,
    };

    try {
      setIsProcessing(true);
      const apiData = formatOrderData(true);
      console.log('Sending save order:', JSON.stringify(apiData, null, 2));
      const response = await CreateOrder(apiData);
      console.log('Save order response:', response);

      if (response.status === 200 || response.status === 201) {
        onSaveOrder(orderData);
        Alert.alert('Success', 'Order saved successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      Alert.alert('Error', 'Failed to save order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle charge button
  const handleChargePress = () => {
    if (!selectedProducts.length) {
      Alert.alert('Missing Information', 'Please add at least one item to the order');
      return;
    }
    setShowPaymentSection(true);
  };

  // Handle payment processing
  const handleProcessPayment = async () => {
    if (!validateSplitPayment()) {
      Alert.alert('Payment Error', 'The total of all payment amounts must equal the order total');
      return;
    }

    try {
      setIsProcessing(true);
      const orderData: OrderData = {
        products: selectedProducts,
        orderType,
        ticketName: ticketName.trim() || `Order ${new Date().toLocaleTimeString()}`,
        comment: comment.trim(),
        paymentMethod,
        cashAmount: paymentMethod === 'split' ? parseFloat(cashAmount) || 0 : 
                   paymentMethod === 'cash' ? totalAmount : 0,
        cardAmount: paymentMethod === 'split' ? parseFloat(cardAmount) || 0 : 
                   paymentMethod === 'card' ? totalAmount : 0,
        upiAmount: paymentMethod === 'split' ? parseFloat(upiAmount) || 0 : 
                  paymentMethod === 'upi' ? totalAmount : 0,
        tabbyAmount: paymentMethod === 'split' ? parseFloat(tabbyAmount) || 0 : 
                    paymentMethod === 'tabby' ? totalAmount : 0,
        bankTransferAmount: paymentMethod === 'split' ? parseFloat(bankTransferAmount) || 0 : 
                           paymentMethod === 'bank-transfer' ? totalAmount : 0,
        digitalWalletAmount: paymentMethod === 'split' ? parseFloat(digitalWalletAmount) || 0 : 
                            paymentMethod === 'digital-wallet' ? totalAmount : 0,
        totalAmount,
        customerEmail: customerEmail.trim() || undefined,
        timestamp: new Date(),
        isCompleted: true,
        tableId: orderType === 'dine-in' && tableId.trim() ? parseInt(tableId) || undefined : undefined,
      };

      const apiData = formatOrderData(false);
      console.log('Sending payment order:', JSON.stringify(apiData, null, 2));
      const response = await CreateOrder(apiData);
      console.log('Create order response:', response);

      if (response.status === 200 || response.status === 201) {
        // Prepare payload for CheckOutOrder API
        const checkoutPayload = {
          order: response.data?.order_id || response.data?.id,
          payment_method: mapPaymentMethodForAPI(paymentMethod),
          payment_status: 'Paid',
          total_price: totalAmount,
        };

        console.log('Sending checkout order:', JSON.stringify(checkoutPayload, null, 2));
        const checkoutResponse = await CheckOutOrder(checkoutPayload);
        console.log('Checkout order response:', checkoutResponse);

        if (checkoutResponse.status === 200 || checkoutResponse.status === 201) {
          if (customerEmail.trim()) {
            await sendOrderEmail(orderData);
          }
          onOrderComplete(orderData);
          
          // Show success alert and navigate to Home
          Alert.alert(
            'Order Checkout Done!', 
            'Your order has been successfully processed and checked out.', 
            [
              { 
                text: 'OK', 
                onPress: () => {
                  handleClose();
                  navigation.navigate('Home');
                }
              },
            ]
          );
        } else {
          Alert.alert('Error', checkoutResponse.message || 'Failed to process checkout');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock email sending function
  const sendOrderEmail = async (orderData: OrderData) => {
    console.log('Sending email to:', orderData.customerEmail);
    console.log('Order data:', orderData);
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const OrderTypeButton = ({ 
    type, 
    label, 
    icon
  }: { 
    type: 'dine-in' | 'takeout' | 'delivery'; 
    label: string; 
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.orderTypeButton,
        orderType === type && styles.orderTypeButtonActive
      ]}
      onPress={() => setOrderType(type)}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={orderType === type ? '#ffffff' : '#666666'} 
      />
      <Text style={[
        styles.orderTypeText,
        orderType === type && styles.orderTypeTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PaymentMethodButton = ({ 
    method, 
    label, 
    icon 
  }: { 
    method: PaymentMethodType; 
    label: string; 
    icon: string; 
  }) => (
    <TouchableOpacity
      style={[
        styles.paymentButton,
        paymentMethod === method && styles.paymentButtonActive
      ]}
      onPress={() => setPaymentMethod(method)}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={paymentMethod === method ? '#ffffff' : '#666666'} 
      />
      <Text style={[
        styles.paymentButtonText,
        paymentMethod === method && styles.paymentButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render split payment inputs
  const renderSplitPaymentInputs = () => {
    if (paymentMethod !== 'split') return null;

    const paymentInputs = [
      { key: 'cash', label: 'Cash', value: cashAmount, setter: setCashAmount },
      { key: 'card', label: 'Card', value: cardAmount, setter: setCardAmount },
      { key: 'upi', label: 'UPI', value: upiAmount, setter: setUpiAmount },
      { key: 'tabby', label: 'Tabby', value: tabbyAmount, setter: setTabbyAmount },
      { key: 'bank', label: 'Bank Transfer', value: bankTransferAmount, setter: setBankTransferAmount },
      { key: 'wallet', label: 'Digital Wallet', value: digitalWalletAmount, setter: setDigitalWalletAmount },
    ];

    return (
      <View style={styles.splitContainer}>
        {paymentInputs.map(({ key, label, value, setter }) => (
          <View key={key} style={styles.splitInput}>
            <Text style={styles.splitLabel}>{label}</Text>
            <TextInput
              style={styles.splitTextInput}
              placeholder="0.00"
              placeholderTextColor="#999999"
              value={value}
              onChangeText={setter}
              keyboardType="numeric"
            />
          </View>
        ))}
        <Text style={styles.splitTotal}>
          Total: {formatCurrency(
            (parseFloat(cashAmount) || 0) + 
            (parseFloat(cardAmount) || 0) + 
            (parseFloat(upiAmount) || 0) + 
            (parseFloat(tabbyAmount) || 0) + 
            (parseFloat(bankTransferAmount) || 0) + 
            (parseFloat(digitalWalletAmount) || 0)
          )}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Order Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items ({selectedProducts.length})</Text>
              {selectedProducts.map((product, index) => (
                <View key={product.id} style={[
                  styles.productItem,
                  index === selectedProducts.length - 1 && { borderBottomWidth: 0 }
                ]}>
                  <View style={styles.productInfo}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{product.name}</Text>
                      {product.isVeg && <View style={styles.vegDot} />}
                    </View>
                    <Text style={styles.productMeta}>
                      {product.diet} • {product.portion} • Qty: {product.quantity}
                    </Text>
                  </View>
                  <View style={styles.productPricing}>
                    {product.hasDiscount && product.discountPrice ? (
                      <>
                        <Text style={styles.originalPrice}>
                          {formatCurrency(product.price * product.quantity)}
                        </Text>
                        <Text style={styles.discountPrice}>
                          {formatCurrency(product.discountPrice * product.quantity)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.productPrice}>
                        {formatCurrency(product.price * product.quantity)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Service Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Type</Text>
              <View style={styles.orderTypeContainer}>
                <OrderTypeButton type="dine-in" label="Dine In" icon="restaurant" />
                <OrderTypeButton type="takeout" label="Takeout" icon="bag-handle" />
                <OrderTypeButton type="delivery" label="Delivery" icon="bicycle" />
              </View>
            </View>

            {/* Order Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ticket Name (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter ticket name"
                  placeholderTextColor="#999999"
                  value={ticketName}
                  onChangeText={setTicketName}
                  maxLength={50}
                />
              </View>
              
              {orderType === 'dine-in' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Table Number (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter table number"
                    placeholderTextColor="#999999"
                    value={tableId}
                    onChangeText={setTableId}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Instructions</Text>
                <TextInput
                  style={[styles.textInput, styles.commentInput]}
                  placeholder="Any special requests..."
                  placeholderTextColor="#999999"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>
            </View>

            {/* Order Total */}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
              </View>
            </View>

            {/* Payment Section */}
            {showPaymentSection && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  <View style={styles.paymentMethodGrid}>
                    <PaymentMethodButton method="cash" label="Cash" icon="cash" />
                    <PaymentMethodButton method="card" label="Card" icon="card" />
                    <PaymentMethodButton method="upi" label="UPI" icon="phone-portrait" />
                    <PaymentMethodButton method="tabby" label="Tabby" icon="card-outline" />
                    <PaymentMethodButton method="bank-transfer" label="Bank Transfer" icon="business" />
                    <PaymentMethodButton method="digital-wallet" label="Digital Wallet" icon="wallet" />
                    <PaymentMethodButton method="split" label="Split Payment" icon="swap-horizontal" />
                  </View>

                  {renderSplitPaymentInputs()}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Receipt Email (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="customer@example.com"
                    placeholderTextColor="#999999"
                    value={customerEmail}
                    onChangeText={setCustomerEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveOrder}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Text style={styles.saveButtonText}>Save for Later</Text>
            </TouchableOpacity>

            {!showPaymentSection ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleChargePress}
                activeOpacity={0.8}
                disabled={isProcessing}
              >
                <Text style={styles.primaryButtonText}>Proceed to Payment</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, isProcessing && styles.primaryButtonDisabled]}
                onPress={handleProcessPayment}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {isProcessing ? 'Processing...' : `Charge ${formatCurrency(totalAmount)}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    marginRight: 8,
    flex: 1,
  },
  vegDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  productMeta: {
    fontSize: 13,
    color: '#666666',
  },
  productPricing: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff4444',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  orderTypeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  orderTypeTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#ffffff',
  },
  commentInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  totalSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    gap: 4,
    minWidth: '30%',
    flex: 1,
  },
  paymentButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  paymentButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  paymentButtonTextActive: {
    color: '#ffffff',
  },
  splitContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  splitInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  splitTextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333333',
    backgroundColor: '#ffffff',
    width: 100,
    textAlign: 'right',
  },
  splitTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#ffffff',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});