import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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
  paymentType: 'Cash' | 'Card' | 'UPI' | 'Wallet';
  status: 'Completed' | 'Pending' | 'Cancelled';
  orderType: 'Dine In' | 'Takeaway' | 'Delivery';
  items: ReceiptItem[];
}

// Expanded sample receipt data
const SAMPLE_RECEIPTS: Receipt[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    date: '2024-08-05',
    time: '14:30',
    total: 895,
    employee: 'Rahul Sharma',
    paymentType: 'UPI',
    status: 'Completed',
    orderType: 'Dine In',
    items: [
      { id: '1', name: 'Margherita Pizza', quantity: 2, price: 299, total: 598 },
      { id: '2', name: 'Chicken Burger', quantity: 1, price: 249, total: 249 },
      { id: '3', name: 'Cold Coffee', quantity: 1, price: 89, total: 89 },
    ],
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    date: '2024-08-05',
    time: '13:15',
    total: 567,
    employee: 'Priya Patel',
    paymentType: 'Card',
    status: 'Completed',
    orderType: 'Takeaway',
    items: [
      { id: '1', name: 'Paneer Tikka', quantity: 2, price: 189, total: 378 },
      { id: '2', name: 'Naan Bread', quantity: 3, price: 45, total: 135 },
      { id: '3', name: 'Lassi', quantity: 1, price: 79, total: 79 },
    ],
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    date: '2024-08-04',
    time: '19:45',
    total: 1245,
    employee: 'Amit Kumar',
    paymentType: 'Cash',
    status: 'Completed',
    orderType: 'Dine In',
    items: [
      { id: '1', name: 'Fish Curry', quantity: 2, price: 319, total: 638 },
      { id: '2', name: 'Biryani', quantity: 1, price: 399, total: 399 },
      { id: '3', name: 'Raita', quantity: 2, price: 59, total: 118 },
      { id: '4', name: 'Gulab Jamun', quantity: 1, price: 129, total: 129 },
    ],
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-004',
    date: '2024-08-04',
    time: '12:20',
    total: 456,
    employee: 'Sneha Singh',
    paymentType: 'Wallet',
    status: 'Pending',
    orderType: 'Delivery',
    items: [
      { id: '1', name: 'Pasta Alfredo', quantity: 2, price: 229, total: 458 },
    ],
  },
  {
    id: '5',
    ticketNumber: 'TKT-2024-005',
    date: '2024-08-03',
    time: '18:20',
    total: 765,
    employee: 'Vikram Mehta',
    paymentType: 'UPI',
    status: 'Completed',
    orderType: 'Delivery',
    items: [
      { id: '1', name: 'Butter Chicken', quantity: 1, price: 325, total: 325 },
      { id: '2', name: 'Garlic Naan', quantity: 2, price: 55, total: 110 },
      { id: '3', name: 'Mango Lassi', quantity: 2, price: 89, total: 178 },
      { id: '4', name: 'Chocolate Brownie', quantity: 1, price: 152, total: 152 },
    ],
  },
  {
    id: '6',
    ticketNumber: 'TKT-2024-006',
    date: '2024-08-03',
    time: '12:45',
    total: 320,
    employee: 'Neha Gupta',
    paymentType: 'Cash',
    status: 'Cancelled',
    orderType: 'Takeaway',
    items: [
      { id: '1', name: 'Veg Sandwich', quantity: 2, price: 99, total: 198 },
      { id: '2', name: 'French Fries', quantity: 1, price: 89, total: 89 },
      { id: '3', name: 'Coca Cola', quantity: 1, price: 33, total: 33 },
    ],
  },
  {
    id: '7',
    ticketNumber: 'TKT-2024-007',
    date: '2024-08-02',
    time: '20:15',
    total: 1120,
    employee: 'Rajiv Malhotra',
    paymentType: 'Card',
    status: 'Completed',
    orderType: 'Dine In',
    items: [
      { id: '1', name: 'Tandoori Platter', quantity: 1, price: 599, total: 599 },
      { id: '2', name: 'Dal Makhani', quantity: 1, price: 199, total: 199 },
      { id: '3', name: 'Jeera Rice', quantity: 2, price: 99, total: 198 },
      { id: '4', name: 'Masala Papad', quantity: 3, price: 49, total: 147 },
    ],
  },
  {
    id: '8',
    ticketNumber: 'TKT-2024-008',
    date: '2024-08-02',
    time: '14:00',
    total: 420,
    employee: 'Ananya Reddy',
    paymentType: 'UPI',
    status: 'Pending',
    orderType: 'Takeaway',
    items: [
      { id: '1', name: 'Chicken Wrap', quantity: 2, price: 159, total: 318 },
      { id: '2', name: 'Sweet Corn Soup', quantity: 1, price: 102, total: 102 },
    ],
  },
  {
    id: '9',
    ticketNumber: 'TKT-2024-009',
    date: '2024-08-01',
    time: '19:30',
    total: 845,
    employee: 'Karthik Nair',
    paymentType: 'Wallet',
    status: 'Completed',
    orderType: 'Delivery',
    items: [
      { id: '1', name: 'Paneer Butter Masala', quantity: 1, price: 289, total: 289 },
      { id: '2', name: 'Veg Biryani', quantity: 1, price: 249, total: 249 },
      { id: '3', name: 'Butter Naan', quantity: 3, price: 45, total: 135 },
      { id: '4', name: 'Onion Raita', quantity: 1, price: 69, total: 69 },
      { id: '5', name: 'Gajar Halwa', quantity: 1, price: 103, total: 103 },
    ],
  },
  {
    id: '10',
    ticketNumber: 'TKT-2024-010',
    date: '2024-08-01',
    time: '13:45',
    total: 625,
    employee: 'Priyanka Joshi',
    paymentType: 'Card',
    status: 'Cancelled',
    orderType: 'Dine In',
    items: [
      { id: '1', name: 'Chicken Pizza', quantity: 1, price: 349, total: 349 },
      { id: '2', name: 'Garlic Bread', quantity: 1, price: 129, total: 129 },
      { id: '3', name: 'Blueberry Shake', quantity: 2, price: 149, total: 298 },
    ],
  },
];

export default function Receipts() {
  const [receipts] = useState<Receipt[]>(SAMPLE_RECEIPTS);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [] as string[],
    paymentType: [] as string[],
    orderType: [] as string[],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#22c55e';
      case 'Pending':
        return '#f59e0b';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case 'Cash':
        return 'cash';
      case 'Card':
        return 'card';
      case 'UPI':
        return 'phone-portrait';
      case 'Wallet':
        return 'wallet';
      default:
        return 'card';
    }
  };

  const openReceiptDetail = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  const closeReceiptDetail = () => {
    setShowDetailModal(false);
    setSelectedReceipt(null);
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
      // Search filter
      const matchesSearch = 
        searchQuery === '' ||
        receipt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      // Status filter
      const matchesStatus = selectedFilters.status.length === 0 || 
        selectedFilters.status.includes(receipt.status);
      
      // Payment type filter
      const matchesPayment = selectedFilters.paymentType.length === 0 || 
        selectedFilters.paymentType.includes(receipt.paymentType);
      
      // Order type filter
      const matchesOrderType = selectedFilters.orderType.length === 0 || 
        selectedFilters.orderType.includes(receipt.orderType);
      
      return matchesSearch && matchesStatus && matchesPayment && matchesOrderType;
    });
  }, [receipts, searchQuery, selectedFilters]);

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      style={styles.receiptCard}
      onPress={() => openReceiptDetail(item)}
      activeOpacity={0.7}
    >
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
        <Text style={styles.receiptTotal}>₹{item.total.toLocaleString('en-IN')}</Text>
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
    </TouchableOpacity>
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
            {/* Status Filter */}
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterRow}>
              {['Completed', 'Pending', 'Cancelled'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterPill,
                    selectedFilters.status.includes(status) && styles.selectedFilterPill
                  ]}
                  onPress={() => toggleFilter('status', status)}
                >
                  <View style={[
                    styles.statusDotSmall, 
                    { backgroundColor: getStatusColor(status) }
                  ]} />
                  <Text style={[
                    styles.filterPillText,
                    selectedFilters.status.includes(status) && styles.selectedFilterPillText
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Payment Type Filter */}
            <Text style={styles.filterSectionTitle}>Payment Type</Text>
            <View style={styles.filterRow}>
              {['Cash', 'Card', 'UPI', 'Wallet'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterPill,
                    selectedFilters.paymentType.includes(type) && styles.selectedFilterPill
                  ]}
                  onPress={() => toggleFilter('paymentType', type)}
                >
                  <Ionicons 
                    name={getPaymentIcon(type) as any} 
                    size={16} 
                    color={selectedFilters.paymentType.includes(type) ? "#fff" : "#64748b"} 
                  />
                  <Text style={[
                    styles.filterPillText,
                    selectedFilters.paymentType.includes(type) && styles.selectedFilterPillText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Order Type Filter */}
            <Text style={styles.filterSectionTitle}>Order Type</Text>
            <View style={styles.filterRow}>
              {['Dine In', 'Takeaway', 'Delivery'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterPill,
                    selectedFilters.orderType.includes(type) && styles.selectedFilterPill
                  ]}
                  onPress={() => toggleFilter('orderType', type)}
                >
                  <Text style={[
                    styles.filterPillText,
                    selectedFilters.orderType.includes(type) && styles.selectedFilterPillText
                  ]}>
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
    if (!selectedReceipt) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeReceiptDetail}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeReceiptDetail} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Receipt Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Receipt Header */}
            <View style={styles.receiptDetailHeader}>
              <Text style={styles.detailTicketNumber}>{selectedReceipt.ticketNumber}</Text>
              <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedReceipt.status) }]}>
                <Text style={styles.detailStatusText}>{selectedReceipt.status}</Text>
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time:</Text>
                <Text style={styles.infoValue}>{formatDate(selectedReceipt.date)} at {selectedReceipt.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employee:</Text>
                <Text style={styles.infoValue}>{selectedReceipt.employee}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Type:</Text>
                <Text style={styles.infoValue}>{selectedReceipt.orderType}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment:</Text>
                <Text style={styles.infoValue}>{selectedReceipt.paymentType}</Text>
              </View>
            </View>

            {/* Items Section */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Items Ordered</Text>
              {selectedReceipt.items.map((item, index) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemTotal}>₹{item.total}</Text>
                </View>
              ))}
            </View>

            {/* Total Section */}
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₹{selectedReceipt.total.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax (0%):</Text>
                <Text style={styles.totalValue}>₹0</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                <Text style={styles.grandTotalValue}>₹{selectedReceipt.total.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Group filtered receipts by date
  const groupedReceipts = filteredReceipts.reduce((groups: { [key: string]: Receipt[] }, receipt) => {
    const date = receipt.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(receipt);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedReceipts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

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
  receiptTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  receiptDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailTicketNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  itemsSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#64748b',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  totalSection: {
    paddingVertical: 20,
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
    color: '#1e293b',
    fontWeight: '500',
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
    color: '#1e293b',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },

  /* Filter Modal Styles */
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
});