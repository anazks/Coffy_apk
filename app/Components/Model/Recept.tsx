import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePrinter } from '../../Contex/PrinterContex';

// Interface for receipt data based on provided structure
interface ReceiptData {
  order_id: number;
  token: number;
  create_date: string;
  user_name: string;
  store_name: string;
  store_address: any;
  order_method: 'Dine In' | 'Takeaway' | 'Delivery';
  table_number: string | null;
  payment_method: 'Cash' | 'Card' | 'UPI' | 'Wallet' | 'Tabby' | 'Bank Transfer' | 'Digital Wallet' | 'Split Payment';
  payment_status: 'Paid' | 'Pending' | 'Cancelled' | 'Partial' | 'Refunded';
  payment_details: {
    method: string;
    status: string;
    reference: string | null;
  };
  checkout_items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    item_total: number;
    add_ons: any[];
  }>;
  checkout_items_count: number;
  subtotal: number;
  total_tax: number;
  discount_amount: number;
  service_charge: number;
  final_amount: number;
  saved_items: any[];
  saved_items_count: number;
  has_saved_items: boolean;
}

interface ReceiptProps {
  receiptData?: ReceiptData;
  onClose?: () => void;
}

export default function Receipt({ receiptData, onClose }: ReceiptProps) {
  const { printTestText, printData, isConnected, connectedDevice, printing } = usePrinter();

  // Add null check at the top
  if (!receiptData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Order Receipt</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No receipt data available</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#64748b';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      case 'partial':
        return '#f97316';
      case 'refunded':
        return '#8b5cf6';
      default:
        return '#64748b';
    }
  };

  const getPaymentIcon = (paymentType: string) => {
    if (!paymentType) return 'card-outline';
    switch (paymentType.toLowerCase()) {
      case 'cash':
        return 'cash-outline';
      case 'card':
        return 'card-outline';
      case 'upi':
        return 'phone-portrait-outline';
      case 'wallet':
      case 'digital wallet':
        return 'wallet-outline';
      case 'tabby':
      case 'bank transfer':
      case 'split payment':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  // Helper function to safely render store address
  const renderStoreAddress = () => {
    if (!receiptData.store_address) {
      return 'Store address not available';
    }
    
    if (typeof receiptData.store_address === 'string') {
      return receiptData.store_address;
    }
    
    if (typeof receiptData.store_address === 'object') {
      const address = receiptData.store_address;
      const addressParts = [];
      
      if (address.street) addressParts.push(address.street);
      if (address.city) addressParts.push(address.city);
      if (address.state) addressParts.push(address.state);
      if (address.zipcode || address.zip) addressParts.push(address.zipcode || address.zip);
      
      return addressParts.length > 0 ? addressParts.join(', ') : 'Store address not available';
    }
    
    return String(receiptData.store_address);
  };

  // Helper function to safely render add-ons
  const renderAddOns = (addOns: any[]) => {
    if (!addOns || addOns.length === 0) {
      return null;
    }
    
    const addOnStrings = addOns.map(addon => {
      if (typeof addon === 'string') {
        return addon;
      } else if (typeof addon === 'object' && addon !== null) {
        if (addon.name) return addon.name;
        if (addon.title) return addon.title;
        if (addon.label) return addon.label;
        return JSON.stringify(addon);
      }
      return String(addon);
    }).filter(Boolean);
    
    return addOnStrings.join(', ');
  };

  // Format receipt data for printing (optimized for thermal printer)
  const formatReceiptForPrint = (data: ReceiptData): string => {
    const ticketNumber = `TKT-${data.create_date.split('T')[0]}-${data.token.toString().padStart(3, '0')}`;
    
    // Use very simple formatting
    let receipt = '';
    
    receipt += '================================\n';
    receipt += data.store_name + '\n';
    receipt += '================================\n\n';
    
    receipt += 'Ticket: ' + ticketNumber + '\n';
    receipt += 'Order: #' + data.order_id + '\n';
    receipt += 'Date: ' + formatDate(data.create_date) + '\n';
    receipt += 'Time: ' + formatTime(data.create_date) + '\n';
    receipt += 'Type: ' + data.order_method + '\n';
    receipt += '\n================================\n';
    receipt += 'ITEMS\n';
    receipt += '================================\n\n';
    
    // Items
    data.checkout_items.forEach((item, index) => {
      receipt += (index + 1) + '. ' + item.name + '\n';
      receipt += '   ' + item.quantity + ' x Rs' + item.unit_price.toFixed(2) + '\n';
      receipt += '   Total: Rs' + item.item_total.toFixed(2) + '\n\n';
    });
    
    receipt += '--------------------------------\n';
    receipt += 'Subtotal: Rs' + data.subtotal.toFixed(2) + '\n';
    receipt += 'Tax: Rs' + data.total_tax.toFixed(2) + '\n';
    receipt += '================================\n';
    receipt += 'TOTAL: Rs' + data.final_amount.toFixed(2) + '\n';
    receipt += '================================\n\n';
    
    receipt += 'Payment: ' + data.payment_method + '\n';
    receipt += 'Status: ' + data.payment_status + '\n\n';
    
    receipt += 'Thank you!\n';
    receipt += '\n\n\n';
    
    return receipt;
  };

  const handlePrint = async () => {
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

  // Safe defaults for required fields
  const safeReceiptData = {
    order_id: receiptData.order_id || 0,
    token: receiptData.token || 0,
    create_date: receiptData.create_date || new Date().toISOString(),
    store_name: receiptData.store_name || 'Unknown Store',
    order_method: receiptData.order_method || 'Dine In',
    payment_method: receiptData.payment_method || 'Cash',
    payment_status: receiptData.payment_status || 'Pending',
    checkout_items: receiptData.checkout_items || [],
    subtotal: receiptData.subtotal || 0,
    total_tax: receiptData.total_tax || 0,
    discount_amount: receiptData.discount_amount || 0,
    service_charge: receiptData.service_charge || 0,
    final_amount: receiptData.final_amount || 0,
    ...receiptData
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#334155" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Order Receipt</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.ticketNumber}>
                TKT-{safeReceiptData.create_date.split('T')[0]}-{safeReceiptData.token.toString().padStart(3, '0')}
              </Text>
              <Text style={styles.orderId}>Order #{safeReceiptData.order_id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(safeReceiptData.payment_status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(safeReceiptData.payment_status) }]}>
                {safeReceiptData.payment_status}
              </Text>
            </View>
          </View>

          {/* Store Info */}
          <View style={styles.storeSection}>
            <Text style={styles.storeName}>{safeReceiptData.store_name}</Text>
            <Text style={styles.storeAddress}>
              {renderStoreAddress()}
            </Text>
          </View>

          {/* Order Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>{formatDate(safeReceiptData.create_date)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>{formatTime(safeReceiptData.create_date)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="bag-handle-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>{safeReceiptData.order_method}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons 
                  name={getPaymentIcon(safeReceiptData.payment_method) as any} 
                  size={16} 
                  color="#64748b" 
                />
                <Text style={styles.detailText}>{safeReceiptData.payment_method}</Text>
              </View>
            </View>
          </View>

          {/* Items Section */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {safeReceiptData.checkout_items.length > 0 ? (
              safeReceiptData.checkout_items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name || 'Unknown Item'}</Text>
                    {item.add_ons?.length > 0 && (
                      <Text style={styles.itemAddOns}>
                        {renderAddOns(item.add_ons)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.itemQuantityPrice}>
                    <Text style={styles.itemQuantity}>× {item.quantity || 0}</Text>
                    <Text style={styles.itemTotal}>₹{(item.item_total || 0).toFixed(2)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No items found</Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Totals Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{safeReceiptData.subtotal.toLocaleString('en-IN')}</Text>
            </View>
            {safeReceiptData.discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, styles.discountValue]}>
                  -₹{safeReceiptData.discount_amount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}
            {safeReceiptData.service_charge > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Service Charge</Text>
                <Text style={styles.totalValue}>₹{safeReceiptData.service_charge.toLocaleString('en-IN')}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>₹{safeReceiptData.total_tax.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total Amount</Text>
              <Text style={styles.grandTotalValue}>₹{safeReceiptData.final_amount.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Thank You Message */}
          <View style={styles.thankYouSection}>
            <Ionicons name="heart-circle-outline" size={24} color="#f43f5e" />
            <Text style={styles.thankYouText}>Thank you for your order!</Text>
          </View>
        </View>

        {/* Print Button */}
        <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
          <Ionicons name="print-outline" size={20} color="#ffffff" style={styles.printIcon} />
          <Text style={styles.printButtonText}>Print Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  receiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  ticketNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  storeSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  detailsSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
  },
  itemsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemAddOns: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  itemQuantityPrice: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 20,
  },
  totalSection: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  discountValue: {
    color: '#22c55e',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  thankYouSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  thankYouText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  printIcon: {
    marginRight: 8,
  },
  printButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  noItemsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});