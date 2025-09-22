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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tableId, setTableId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  // Calculate subtotal (no tax)
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

  // Format data for CreateOrder API
  const formatOrderData = (isSavedForLater: boolean) => {
    const data: any = {
      order_method: mapOrderMethod(orderType),
      // total_amount: totalAmount.toFixed(2),
      items: selectedProducts.map(product => {
        const item: any = {
          menu_item_id: parseInt(product.id) || null,
          quantity: product.quantity || 1,
          // is_saved_for_later: isSavedForLater,
        };
        
        // Only include special_instructions if it has a value
        if (comment.trim()) {
          item.special_instructions = comment.trim();
        }
        
        // Only include add_ons if modifier exists and is a valid number
        if (product.modifier && !isNaN(parseInt(product.modifier))) {
          item.add_ons = [parseInt(product.modifier)];
        }
        
        return item;
      }),
    };
    
    // Only include ticket_name if it has a value
    if (ticketName.trim()) {
      data.ticket_name = ticketName.trim();
    }
    
    // Only include table_id for dine-in and if it has a valid value
    if (orderType === 'dine-in' && tableId.trim() && !isNaN(parseInt(tableId))) {
      data.table_id = parseInt(tableId);
    }
    
    return data;
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
    if (paymentMethod === 'split') {
      const cash = parseFloat(cashAmount) || 0;
      const card = parseFloat(cardAmount) || 0;
      if (Math.abs((cash + card) - totalAmount) > 0.01) {
        Alert.alert('Payment Error', 'Cash + Card amounts must equal the total amount');
        return;
      }
    }

    try {
      setIsProcessing(true);
      const orderData: OrderData = {
        products: selectedProducts,
        orderType,
        ticketName: ticketName.trim() || `Order ${new Date().toLocaleTimeString()}`,
        comment: comment.trim(),
        paymentMethod,
        cashAmount: paymentMethod === 'split' ? parseFloat(cashAmount) : 
                   paymentMethod === 'cash' ? totalAmount : 0,
        cardAmount: paymentMethod === 'split' ? parseFloat(cardAmount) : 
                   paymentMethod === 'card' ? totalAmount : 0,
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
        if (customerEmail.trim()) {
          await sendOrderEmail(orderData);
        }
        onOrderComplete(orderData);
        Alert.alert('Success', 'Payment processed successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
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

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const OrderTypeButton = ({ 
    type, 
    label, 
    icon,
    description 
  }: { 
    type: 'dine-in' | 'takeout' | 'delivery'; 
    label: string; 
    icon: string;
    description: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.orderTypeButton,
        orderType === type && styles.orderTypeButtonActive
      ]}
      onPress={() => setOrderType(type)}
      activeOpacity={0.7}
    >
      <View style={styles.orderTypeIconContainer}>
        <Ionicons 
          name={icon as any} 
          size={28} 
          color={orderType === type ? '#ffffff' : '#3b82f6'} 
        />
      </View>
      <Text style={[
        styles.orderTypeText,
        orderType === type && styles.orderTypeTextActive
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.orderTypeDescription,
        orderType === type && styles.orderTypeDescriptionActive
      ]}>
        {description}
      </Text>
    </TouchableOpacity>
  );

  const PaymentMethodButton = ({ 
    method, 
    label, 
    icon 
  }: { 
    method: 'cash' | 'card' | 'split'; 
    label: string; 
    icon: string; 
  }) => (
    <TouchableOpacity
      style={[
        styles.paymentButton,
        paymentMethod === method && styles.paymentButtonActive
      ]}
      onPress={() => setPaymentMethod(method)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={paymentMethod === method ? '#ffffff' : '#64748b'} 
      />
      <Text style={[
        styles.paymentButtonText,
        paymentMethod === method && styles.paymentButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Order Details</Text>
              <Text style={styles.headerSubtitle}>
                {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''} • {formatCurrency(totalAmount)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Order Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="receipt" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Order Items</Text>
              </View>
              <View style={styles.itemsContainer}>
                {selectedProducts.map((product) => (
                  <View key={product.id} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <View style={styles.productHeader}>
                        <Text style={styles.productName}>{product.name}</Text>
                        {product.isVeg && (
                          <View style={styles.vegIndicator}>
                            <View style={styles.vegDot} />
                          </View>
                        )}
                      </View>
                      <View style={styles.productMeta}>
                        <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
                        <View style={styles.separator} />
                        <Text style={styles.productDetails}>{product.diet}</Text>
                        <View style={styles.separator} />
                        <Text style={styles.productDetails}>{product.portion}</Text>
                      </View>
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
            </View>

            {/* Order Type */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="storefront" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Service Type</Text>
              </View>
              <View style={styles.orderTypeContainer}>
                <OrderTypeButton 
                  type="dine-in" 
                  label="Dine In" 
                  icon="restaurant" 
                  description="Eat at restaurant"
                />
                <OrderTypeButton 
                  type="takeout" 
                  label="Takeout" 
                  icon="bag-handle" 
                  description="Take with you"
                />
                <OrderTypeButton 
                  type="delivery" 
                  label="Delivery" 
                  icon="bicycle" 
                  description="Deliver to address"
                />
              </View>
            </View>

            {/* Order Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Order Information</Text>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ticket Name (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., John's Order, Table 5..."
                    placeholderTextColor="#94a3b8"
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
                      placeholder="e.g., 1, 2, 3..."
                      placeholderTextColor="#94a3b8"
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
                    placeholder="Any special requests or dietary requirements..."
                    placeholderTextColor="#94a3b8"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                </View>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calculator" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Order Summary</Text>
              </View>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal ({selectedProducts.length} items)</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                </View>
              </View>
            </View>

            {/* Payment Section */}
            {showPaymentSection && (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="card" size={20} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                  </View>
                  <View style={styles.paymentMethodContainer}>
                    <PaymentMethodButton method="cash" label="Cash" icon="cash" />
                    <PaymentMethodButton method="card" label="Card" icon="card" />
                    <PaymentMethodButton method="split" label="Split" icon="swap-horizontal" />
                  </View>

                  {paymentMethod === 'split' && (
                    <View style={styles.splitPaymentContainer}>
                      <View style={styles.splitInputContainer}>
                        <Text style={styles.splitLabel}>Cash Amount</Text>
                        <TextInput
                          style={styles.splitInput}
                          placeholder="0.00"
                          placeholderTextColor="#94a3b8"
                          value={cashAmount}
                          onChangeText={setCashAmount}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.splitInputContainer}>
                        <Text style={styles.splitLabel}>Card Amount</Text>
                        <TextInput
                          style={styles.splitInput}
                          placeholder="0.00"
                          placeholderTextColor="#94a3b8"
                          value={cardAmount}
                          onChangeText={setCardAmount}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="mail" size={20} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Receipt Email</Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Customer Email (Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="customer@example.com"
                      placeholderTextColor="#94a3b8"
                      value={customerEmail}
                      onChangeText={setCustomerEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <Text style={styles.emailNote}>
                      📧 Receipt will be automatically sent after payment
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveOrder}
              activeOpacity={0.7}
              disabled={isProcessing}
            >
              <Ionicons name="bookmark-outline" size={20} color="#6366f1" />
              <Text style={styles.saveButtonText}>Save for Later</Text>
            </TouchableOpacity>

            {!showPaymentSection ? (
              <TouchableOpacity
                style={styles.chargeButton}
                onPress={handleChargePress}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <Ionicons name="card-outline" size={20} color="#ffffff" />
                <Text style={styles.chargeButtonText}>
                  Proceed to Payment
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.chargeButton, isProcessing && styles.chargeButtonDisabled]}
                onPress={handleProcessPayment}
                disabled={isProcessing}
                activeOpacity={0.7}
              >
                {isProcessing ? (
                  <>
                    <Ionicons name="hourglass-outline" size={20} color="#ffffff" />
                    <Text style={styles.chargeButtonText}>Processing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                    <Text style={styles.chargeButtonText}>
                      Charge {formatCurrency(totalAmount)}
                    </Text>
                  </>
                )}
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
    flex: 1,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  productDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  productPricing: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  originalPrice: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  orderTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  orderTypeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  orderTypeIconContainer: {
    marginBottom: 8,
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  orderTypeTextActive: {
    color: '#ffffff',
  },
  orderTypeDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  orderTypeDescriptionActive: {
    color: '#e2e8f0',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  commentInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  paymentButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  paymentButtonTextActive: {
    color: '#ffffff',
  },
  splitPaymentContainer: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  splitInputContainer: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  splitInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  emailNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: '#ffffff',
    gap: 8,
    minWidth: 140,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  chargeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chargeButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  chargeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});