import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getOrders, getRecept } from '../Api/Services/Orders';
import Loader from '../Components/Loader/Loarder'; // Corrected typo in import path
import Receipt from '../Components/Model/Recept';
import { usePrinter } from '../Contex/PrinterContex';

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Receipt {
  id: string;
  ticketNumber: string;
  date: string;
  time: string;
  total: number;
  employee: string;
  paymentType: 'Cash' | 'Card' | 'UPI' | 'Wallet' | 'Tabby' | 'Bank Transfer' | 'Digital Wallet' | 'Split Payment';
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Partial' | 'Refunded';
  orderType: 'Dine In' | 'Takeaway' | 'Delivery';
  items: ReceiptItem[];
}

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceiptData, setSelectedReceiptData] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [] as string[],
    paymentType: [] as string[],
    orderType: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { printTestText } = usePrinter();

  const sampleReceiptText = `=== TEST RECEIPT ===

Ticket: TKT-2025-10-07-001
Date: October 07, 2025
Time: 14:30

Item 1 - Burger x 2    ₹200.00
Item 2 - Fries x 1     ₹100.00
Item 3 - Drink x 1     ₹50.00

Subtotal:             ₹350.00
Tax:                  ₹35.00
Total:                ₹385.00

Payment: Cash
Order Type: Dine In
Employee: John Doe

Thank you for your order!
Visit again!

`;

  const mapOrderToReceipt = (order: any): Receipt => ({
    id: order.id.toString(),
    ticketNumber: `TKT-${order.create_date.split('T')[0]}-${order.token.toString().padStart(3, '0')}`,
    date: order.create_date.split('T')[0],
    time: new Date(order.create_date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    total: parseFloat(order.total_price) || 0,
    employee: order.user_name || 'Unknown',
    paymentType: order.payment_method as Receipt['paymentType'],
    status: order.payment_status as Receipt['status'],
    orderType: order.order_method as Receipt['orderType'],
    items: (order.items || []).map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      name: item.menu_item_name || 'Unknown Item',
      quantity: item.quantity || 1,
      price: parseFloat(item.price) || 0,
      total: parseFloat(item.price) * (item.quantity || 1),
    })),
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders();
      console.log('getOrders response:', response);
      const mappedReceipts = (response || [])
        .filter((order: any) => order.payment_status.toLowerCase() === 'paid')
        .map(mapOrderToReceipt);
      setReceipts(mappedReceipts);
    } catch (err) {
      console.log('Error fetching orders:', err);
      setError('Failed to load receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const fetchReceiptDetails = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecept(orderId);
      console.log('getRecept response:', response);
      setSelectedReceiptData(response);
      setShowDetailModal(true);
    } catch (err) {
      console.log('Error fetching receipt:', err);
      Alert.alert('Error', 'Failed to load receipt details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrint = async () => {
    try {
      await printTestText(sampleReceiptText);
    } catch (err) {
      Alert.alert('Print Error', 'Failed to print test receipt. Please check printer connection.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
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
    switch (paymentType.toLowerCase()) {
      case 'cash':
        return 'cash';
      case 'card':
        return 'card';
      case 'upi':
        return 'phone-portrait';
      case 'wallet':
      case 'digital wallet':
        return 'wallet';
      case 'tabby':
      case 'bank transfer':
      case 'split payment':
        return 'card';
      default:
        return 'card';
    }
  };

  const openReceiptDetail = (orderId: string) => {
    fetchReceiptDetails(orderId);
  };

  const closeReceiptDetail = () => {
    setShowDetailModal(false);
    setSelectedReceiptData(null);
  };

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      const index = newFilters[category].indexOf(value);
      if (index === -1) {
        newFilters[category] = [...newFilters[category], value];
      } else {
        newFilters[category] = newFilters[category].filter(item => item !== value);
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      status: [],
      paymentType: [],
      orderType: [],
    });
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const matchesSearch =
        searchQuery === '' ||
        receipt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.items.some(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(receipt.status);
      const matchesPayment =
        selectedFilters.paymentType.length === 0 ||
        selectedFilters.paymentType.includes(receipt.paymentType);
      const matchesOrderType =
        selectedFilters.orderType.length === 0 ||
        selectedFilters.orderType.includes(receipt.orderType);
      return matchesSearch && matchesStatus && matchesPayment && matchesOrderType;
    });
  }, [receipts, searchQuery, selectedFilters]);

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <View style={styles.receiptCard}>
      <View style={styles.receiptHeader}>
        <View style={styles.receiptIdSection}>
          <Text style={styles.ticketNumber}>{item.ticketNumber}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.receiptRight}>
          <Text style={styles.receiptTotal}>₹{item.total.toLocaleString('en-IN')}</Text>
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={() => openReceiptDetail(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.receiptButtonText}>Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.receiptDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={14} color="#64748b" />
          <Text style={styles.detailText}>{formatDate(item.date)} • {item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.employee}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name={getPaymentIcon(item.paymentType) as any} size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.paymentType} • {item.orderType}</Text>
        </View>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.filterModalBackdrop}>
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter Receipts</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterRow}>
              {['Paid', 'Pending', 'Cancelled', 'Partial', 'Refunded'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterPill, selectedFilters.status.includes(status) ? styles.selectedFilterPill : null].filter(Boolean)}
                  onPress={() => toggleFilter('status', status)}
                >
                  <View style={[styles.statusDotSmall, { backgroundColor: getStatusColor(status) }]} />
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedFilters.status.includes(status) ? styles.selectedFilterPillText : null,
                    ].filter(Boolean)}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Payment Type</Text>
            <View style={styles.filterRow}>
              {['Cash', 'Card', 'UPI', 'Wallet', 'Tabby', 'Bank Transfer', 'Digital Wallet', 'Split Payment'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterPill, selectedFilters.paymentType.includes(type) ? styles.selectedFilterPill : null].filter(Boolean)}
                  onPress={() => toggleFilter('paymentType', type)}
                >
                  <Ionicons
                    name={getPaymentIcon(type) as any}
                    size={16}
                    color={selectedFilters.paymentType.includes(type) ? '#fff' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedFilters.paymentType.includes(type) ? styles.selectedFilterPillText : null,
                    ].filter(Boolean)}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Order Type</Text>
            <View style={styles.filterRow}>
              {['Dine In', 'Takeaway', 'Delivery'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterPill, selectedFilters.orderType.includes(type) ? styles.selectedFilterPill : null].filter(Boolean)}
                  onPress={() => toggleFilter('orderType', type)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedFilters.orderType.includes(type) ? styles.selectedFilterPillText : null,
                    ].filter(Boolean)}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDetailModal = () => {
    if (!selectedReceiptData) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeReceiptDetail}
      >
        <Receipt receiptData={selectedReceiptData} onClose={closeReceiptDetail} />
      </Modal>
    );
  };

  const groupedReceipts = filteredReceipts.reduce((groups: { [key: string]: Receipt[] }, receipt) => {
    const date = receipt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(receipt);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedReceipts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (loading) {
    return (
      <View style={styles.container}>
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.noResultsContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.noResultsText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Receipts</Text>
        <Text style={styles.headerSubtitle}>{filteredReceipts.length} receipts</Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search receipts..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testPrintButton}
            onPress={handleTestPrint}
          >
            <Text style={styles.testPrintButtonText}>Test Print</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {groupedReceipts[date].map((receipt) => (
                <View key={receipt.id}>
                  {renderReceiptItem({ item: receipt })}
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="receipt" size={48} color="#cbd5e1" />
            <Text style={styles.noResultsText}>No receipts found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      </ScrollView>

      {renderDetailModal()}
      {renderFilterModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 4,
  },
  filterButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
  },
  testPrintButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  testPrintButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateSection: {
    marginTop: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingLeft: 4,
  },
  receiptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  receiptIdSection: {
    flex: 1,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  receiptRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  receiptTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  receiptButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  receiptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  receiptDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
  },
  filterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  filterContent: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  selectedFilterPill: {
    backgroundColor: '#2563eb',
  },
  filterPillText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedFilterPillText: {
    color: '#ffffff',
  },
  statusDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  applyFiltersButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});