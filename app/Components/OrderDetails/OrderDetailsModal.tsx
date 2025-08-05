import { Ionicons } from '@expo/vector-icons';
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

interface OrderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProducts: ProductWithQuantity[];
  onOrderComplete: (orderData: OrderData) => void;
  onSaveOrder?: (orderData: Partial<OrderData>) => void; // New prop for saving
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
  isCompleted?: boolean; // To distinguish between saved and completed orders
}

export default function OrderDetailsModal({
  visible,
  onClose,
  selectedProducts,
  onOrderComplete,
  onSaveOrder = () => {},
}: OrderDetailsModalProps) {
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');
  const [ticketName, setTicketName] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  // Calculate totals
  const subtotal = selectedProducts.reduce((sum, product) => {
    const price = product.hasDiscount && product.discountPrice 
      ? product.discountPrice 
      : product.price;
    return sum + (price * product.quantity);
  }, 0);

  const tax = subtotal * 0.08; // 8% tax
  const totalAmount = subtotal + tax;

  // Reset form when modal closes
  const handleClose = () => {
    setOrderType('dine-in');
    setTicketName('');
    setComment('');
    setPaymentMethod('cash');
    setCashAmount('');
    setCardAmount('');
    setCustomerEmail('');
    setIsProcessing(false);
    setShowPaymentSection(false);
    onClose();
  };

  // Handle save order (without payment processing)
  const handleSaveOrder = () => {
    if (!ticketName.trim()) {
      Alert.alert('Missing Information', 'Please enter a ticket name to save the order');
      return;
    }

    const orderData: Partial<OrderData> = {
      products: selectedProducts,
      orderType,
      ticketName: ticketName.trim(),
      comment: comment.trim(),
      totalAmount,
      timestamp: new Date(),
      isCompleted: false,
    };

    onSaveOrder(orderData);
    Alert.alert('Success', 'Order saved successfully!', [
      { text: 'OK', onPress: handleClose }
    ]);
  };

  // Handle charge button - show payment section
  const handleChargePress = () => {
    if (!ticketName.trim()) {
      Alert.alert('Missing Information', 'Please enter a ticket name before proceeding to payment');
      return;
    }
    setShowPaymentSection(true);
  };

  // Validate and process payment
  const handleProcessPayment = async () => {
    if (paymentMethod === 'split') {
      const cash = parseFloat(cashAmount) || 0;
      const card = parseFloat(cardAmount) || 0;
      
      if (Math.abs((cash + card) - totalAmount) > 0.01) {
        Alert.alert('Payment Error', 'Cash + Card amounts must equal the total amount');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderData: OrderData = {
        products: selectedProducts,
        orderType,
        ticketName: ticketName.trim(),
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
      };

      // Send email if provided
      if (customerEmail.trim()) {
        await sendOrderEmail(orderData);
      }

      onOrderComplete(orderData);
      handleClose();
      
      Alert.alert('Success', 'Payment processed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock email sending function
  const sendOrderEmail = async (orderData: OrderData) => {
    // In a real app, this would call your backend API
    console.log('Sending email to:', orderData.customerEmail);
    console.log('Order data:', orderData);
    
    // Simulate API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

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
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={orderType === type ? '#ffffff' : '#64748b'} 
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
            <Text style={styles.headerTitle}>Order Details</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Order Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items ({selectedProducts.length})</Text>
              {selectedProducts.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{product.name}</Text>
                      {product.isVeg && (
                        <View style={styles.vegIndicator}>
                          <Text style={styles.vegText}>VEG</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
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

            {/* Order Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Type</Text>
              <View style={styles.orderTypeContainer}>
                <OrderTypeButton type="dine-in" label="Dine In" icon="restaurant" />
                <OrderTypeButton type="takeout" label="Takeout" icon="bag" />
                <OrderTypeButton type="delivery" label="Delivery" icon="bicycle" />
              </View>
            </View>

            {/* Ticket Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ticket Information</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ticket Name *"
                placeholderTextColor="#94a3b8"
                value={ticketName}
                onChangeText={setTicketName}
                maxLength={50}
              />
              <TextInput
                style={[styles.textInput, styles.commentInput]}
                placeholder="Special instructions or comments"
                placeholderTextColor="#94a3b8"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* Order Summary - Always visible */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (8%)</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                </View>
              </View>
            </View>

            {/* Payment Section - Only shown when charge is pressed */}
            {showPaymentSection && (
              <>
                {/* Payment Method */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
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

                {/* Customer Email */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Customer Email (Optional)</Text>
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
                    Receipt will be automatically sent to this email after payment
                  </Text>
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
            >
              <Ionicons name="bookmark" size={20} color="#64748b" />
              <Text style={styles.saveButtonText}>Save Order</Text>
            </TouchableOpacity>

            {!showPaymentSection ? (
              <TouchableOpacity
                style={styles.chargeButton}
                onPress={handleChargePress}
                activeOpacity={0.7}
              >
                <Ionicons name="card" size={20} color="#ffffff" />
                <Text style={styles.chargeButtonText}>
                  Charge {formatCurrency(totalAmount)}
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
                  <Text style={styles.chargeButtonText}>Processing...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    <Text style={styles.chargeButtonText}>
                      Process Payment
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
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
    color: '#1e293b',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginRight: 8,
  },
  vegIndicator: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  productQuantity: {
    fontSize: 12,
    color: '#64748b',
  },
  productPricing: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  orderTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  orderTypeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  orderTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 6,
  },
  orderTypeTextActive: {
    color: '#ffffff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  commentInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  paymentButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
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
  },
  splitInputContainer: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 6,
  },
  splitInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  emailNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: -8,
    marginBottom: 12,
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  chargeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    gap: 8,
  },
  chargeButtonDisabled: {
    opacity: 0.6,
  },
  chargeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});