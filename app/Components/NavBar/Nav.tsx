import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderDetailsModal from '../../Components/OrderDetails/OrderDetailsModal';

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
  onOrdersPress?: () => void;
  onOrderComplete?: (orderData: OrderData) => void;
  onSaveOrder?: (orderData: Partial<OrderData>) => void;
  onInventoryPress?: () => void;
}

export default function Nav({
  totalAmount = 0,
  itemCount = 0,
  selectedProducts = [],
  onSave = () => {},
  onCharge = () => {},
  isProcessing = false,
  onOrdersPress = () => {},
  onOrderComplete = () => {},
  onSaveOrder = () => {},
  onInventoryPress = () => {},
}: NavProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const orderCount = selectedProducts.length;

  const calculatedTotal = selectedProducts.reduce((sum, product) => {
    const price = product.hasDiscount && product.discountPrice
      ? product.discountPrice
      : product.price;
    return sum + price * product.quantity;
  }, 0);

  const displayTotal = totalAmount > 0 ? totalAmount : calculatedTotal;

  // Pulse animation for order badge
  React.useEffect(() => {
    if (orderCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [orderCount]);

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

  return (
    <>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          {/* Left Section - Brand */}
          <View style={styles.leftSection}>
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <Ionicons name="cafe" size={24} color="#8B5CF6" />
              </View>
            </View>
          </View>

          {/* Center Section - Quick Stats */}
          {(displayTotal > 0 || orderCount > 0) && (
            <View style={styles.centerSection}>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹{displayTotal.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{orderCount}</Text>
                  <Text style={styles.statLabel}>Items</Text>
                </View>
              </View>
            </View>
          )}

          {/* Right Section - Actions */}
          <View style={styles.rightSection}>
            {/* Inventory Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/Screens/Admin/InventoryManagement')}
              activeOpacity={0.7}
              accessible
              accessibilityLabel="Go to inventory management"
            >
              <View style={styles.buttonContent}>
                <Ionicons name="storefront-outline" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>

            {/* Orders Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.orderButton,
                orderCount > 0 && styles.orderButtonActive
              ]}
              onPress={handleOrdersPress}
              activeOpacity={0.7}
              accessible
              accessibilityLabel={orderCount > 0 ? `View ${orderCount} orders` : "View orders"}
            >
              <View style={styles.buttonContent}>
                <Ionicons
                  name={orderCount > 0 ? "receipt" : "receipt-outline"}
                  size={20}
                  color={orderCount > 0 ? "#FFFFFF" : "#6B7280"}
                />
                {orderCount > 0 && (
                  <Animated.View
                    style={[
                      styles.orderBadge,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <Text style={styles.orderCount}>
                      {orderCount > 99 ? '99+' : orderCount}
                    </Text>
                  </Animated.View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom border gradient */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomBorder}
        />
      </LinearGradient>

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontFamily: 'Rajdhani-Bold',
    color: '#1F2937',
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  appSubtitle: {
    fontSize: 12,
    fontFamily: 'Rajdhani-Medium',
    color: '#6B7280',
    letterSpacing: 0.3,
    marginTop: -2,
  },
  centerSection: {
    flex: 0,
    marginHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
   marginLeft: 35,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Rajdhani-Bold',
    color: '#8B5CF6',
    lineHeight: 16,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Rajdhani-Medium',
    color: '#6B7280',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    marginHorizontal: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderButton: {
    position: 'relative',
  },
  orderButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    elevation: 4,
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orderBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1,
  },
  orderCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Rajdhani-Bold',
    textAlign: 'center',
    lineHeight: 10,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});