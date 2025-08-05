import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

interface SaveProps {
  totalAmount?: number;
  itemCount?: number;
  selectedProducts?: Product[];
  onSave?: () => void;
  onCharge?: () => void;
  isProcessing?: boolean;
}

const { width } = Dimensions.get('window');

export default function Save({ 
  totalAmount = 0,
  itemCount = 0,
  selectedProducts = [],
  onSave = () => {},
  onCharge = () => {},
  isProcessing = false
}: SaveProps) {

  // You can now access all selected products data
  const handleSavePress = () => {
    console.log('Selected products in Save component:', selectedProducts);
    console.log('Total amount:', totalAmount);
    console.log('Item count:', itemCount);
    
    // Process the selected products
    selectedProducts.forEach(product => {
      console.log(`Product: ${product.name}, Price: ${product.hasDiscount ? product.discountPrice : product.price}`);
    });
    
    onSave();
  };

  const handleChargePress = () => {
    console.log('Charging for products:', selectedProducts);
    console.log('Total amount:', totalAmount);
    
    // You can access individual product details here
    const productDetails = selectedProducts.map(product => ({
      id: product.id,
      name: product.name,
      finalPrice: product.hasDiscount && product.discountPrice ? product.discountPrice : product.price,
      isVeg: product.isVeg,
      hasDiscount: product.hasDiscount
    }));
    
    console.log('Product details for billing:', productDetails);
    
    onCharge();
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={handleSavePress}
          activeOpacity={0.8}
          disabled={itemCount === 0}
        >
          <View style={styles.buttonContent}>
            <Ionicons 
              name="bookmark" 
              size={24} 
              color={itemCount === 0 ? "#94a3b8" : "#ffffff"} 
            />
            <Text style={[
              styles.buttonText, 
              styles.saveButtonText,
              itemCount === 0 && styles.disabledText
            ]}>
              Save
            </Text>
            {itemCount > 0 && (
              <View style={styles.itemBadge}>
                <Text style={styles.itemBadgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Charge Button */}
        <TouchableOpacity 
          style={[styles.button, styles.chargeButton]}
          onPress={handleChargePress}
          activeOpacity={0.8}
          disabled={totalAmount === 0 || isProcessing}
        >
          <View style={styles.buttonContent}>
            <Ionicons 
              name="card" 
              size={24} 
              color={totalAmount === 0 ? "#94a3b8" : "#ffffff"} 
            />
            <View style={styles.chargeInfo}>
              <Text style={[
                styles.buttonText, 
                styles.chargeButtonText,
                totalAmount === 0 && styles.disabledText
              ]}>
                {isProcessing ? 'Processing...' : 'Charge'}
              </Text>
              <Text style={[
                styles.amountText,
                totalAmount === 0 && styles.disabledAmountText
              ]}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            {isProcessing && (
              <View style={styles.processingIndicator}>
                <Ionicons name="hourglass" size={16} color="#ffffff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Additional Info */}
      {/* {(itemCount > 0 || totalAmount > 0) && (
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            {itemCount} item{itemCount !== 1 ? 's' : ''} selected
          </Text>
          <Text style={styles.infoText}>
            Total: ₹{totalAmount.toLocaleString('en-IN')}
          </Text>
        </View>
      )} */}

      {/* Show selected products summary */}
      {/* {selectedProducts.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Selected Items:</Text>
          {selectedProducts.slice(0, 3).map(product => (
            <Text key={product.id} style={styles.summaryItem}>
              • {product.name} - ₹{product.hasDiscount && product.discountPrice ? product.discountPrice : product.price}
            </Text>
          ))}
          {selectedProducts.length > 3 && (
            <Text style={styles.summaryItem}>
              ... and {selectedProducts.length - 3} more items
            </Text>
          )}
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButton: {
    backgroundColor: '#64748b',
  },
  chargeButton: {
    backgroundColor: '#2563eb',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#ffffff',
  },
  chargeButtonText: {
    color: '#ffffff',
  },
  disabledText: {
    color: '#94a3b8',
  },
  chargeInfo: {
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  disabledAmountText: {
    color: '#94a3b8',
  },
  itemBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  itemBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  processingIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  summaryItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
});