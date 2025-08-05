import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 0 : 20, // Adjust for status bar on Android
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  buttonPressed: {
    backgroundColor: '#f8fafc',
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cashIcon: {
    backgroundColor: '#dcfce7',
  },
  closeIcon: {
    backgroundColor: '#fef3c7',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  shiftInfo: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  shiftInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1e293b',
  },
  textInputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  payInButton: {
    backgroundColor: '#10b981',
  },
  payOutButton: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  summarySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
    borderTopColor: '#f1f5f9',
    marginTop: 8,
    paddingTop: 8,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
});

export default function Shift() {
  const [cashModalVisible, setCashModalVisible] = useState(false);
  const [closeShiftModalVisible, setCloseShiftModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [expectedCash, setExpectedCash] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [inputFocused, setInputFocused] = useState<string | null>(null);

  // Sample shift data
  const shiftData = {
    shiftNumber: 'SH-2025-001',
    openedBy: 'John Doe',
    openTime: '09:00 AM',
    cashInDrawer: 250.00,
    cashPayments: 1245.50,
    cashRefunds: 45.20,
    paidIn: 100.00,
    paidOut: 75.30,
    grossSales: 1890.75,
    refunds: 125.40,
    discounts: 89.25,
  };

  const netSales = shiftData.grossSales - shiftData.refunds - shiftData.discounts;
  const expectedAmount = shiftData.cashInDrawer + shiftData.cashPayments - shiftData.cashRefunds + shiftData.paidIn - shiftData.paidOut;

  const handleCashManagement = (type: 'in' | 'out') => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    
    Alert.alert(
      'Success',
      `Cash ${type === 'in' ? 'Pay In' : 'Pay Out'} of $${amount} recorded successfully`,
      [{ text: 'OK', onPress: () => setCashModalVisible(false) }]
    );
    
    setAmount('');
    setComment('');
  };

  const handleCloseShift = () => {
    if (!expectedCash.trim() || !actualCash.trim()) {
      Alert.alert('Error', 'Please enter both expected and actual cash amounts');
      return;
    }
    
    const difference = parseFloat(actualCash) - parseFloat(expectedCash);
    const message = difference === 0 
      ? 'Cash count matches perfectly!' 
      : `Cash difference: $${Math.abs(difference).toFixed(2)} ${difference > 0 ? 'over' : 'short'}`;
    
    Alert.alert(
      'Shift Closed',
      `${message}\n\nShift has been closed successfully.`,
      [{ text: 'OK', onPress: () => setCloseShiftModalVisible(false) }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>Shift Management</Text>
        <Text style={styles.subtitle}>Manage cash operations and close your shift</Text>
      </View> */}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCashModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <View style={[styles.buttonIcon, styles.cashIcon]}>
              <Ionicons name="cash" size={24} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.buttonText}>Cash Management</Text>
              <Text style={styles.buttonSubtext}>Pay in or pay out cash</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCloseShiftModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <View style={[styles.buttonIcon, styles.closeIcon]}>
              <Ionicons name="close-circle" size={24} color="#d97706" />
            </View>
            <View>
              <Text style={styles.buttonText}>Close Shift</Text>
              <Text style={styles.buttonSubtext}>End shift and count cash</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Shift Information */}
      <View style={styles.shiftInfo}>
        <Text style={styles.shiftInfoTitle}>Current Shift Details</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Shift Number</Text>
          <Text style={styles.infoValue}>{shiftData.shiftNumber}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Opened By</Text>
          <Text style={styles.infoValue}>{shiftData.openedBy}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Open Time</Text>
          <Text style={styles.infoValue}>{shiftData.openTime}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cash in Drawer</Text>
          <Text style={styles.infoValue}>${shiftData.cashInDrawer.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cash Payments</Text>
          <Text style={styles.infoValue}>${shiftData.cashPayments.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cash Refunds</Text>
          <Text style={styles.infoValue}>-${shiftData.cashRefunds.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Paid In</Text>
          <Text style={styles.infoValue}>${shiftData.paidIn.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Paid Out</Text>
          <Text style={styles.infoValue}>-${shiftData.paidOut.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expected Amount</Text>
          <Text style={styles.infoValue}>${expectedAmount.toFixed(2)}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Sales Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gross Sales</Text>
            <Text style={styles.summaryValue}>${shiftData.grossSales.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Refunds</Text>
            <Text style={styles.summaryValue}>-${shiftData.refunds.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discounts</Text>
            <Text style={styles.summaryValue}>-${shiftData.discounts.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.summaryLabel}>Net Sales</Text>
            <Text style={styles.totalValue}>${netSales.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Cash Management Modal */}
      <Modal
        visible={cashModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCashModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cash Management</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={[
                  styles.textInput,
                  inputFocused === 'amount' && styles.textInputFocused,
                ]}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                onFocus={() => setInputFocused('amount')}
                onBlur={() => setInputFocused(null)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Comment (Optional)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  inputFocused === 'comment' && styles.textInputFocused,
                ]}
                value={comment}
                onChangeText={setComment}
                placeholder="Enter comment"
                onFocus={() => setInputFocused('comment')}
                onBlur={() => setInputFocused(null)}
              />
            </View>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.payInButton]}
                onPress={() => handleCashManagement('in')}
              >
                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                  Pay In
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.payOutButton]}
                onPress={() => handleCashManagement('out')}
              >
                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                  Pay Out
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.secondaryButton, { marginTop: 12 }]}
              onPress={() => setCashModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.secondaryButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Close Shift Modal */}
      <Modal
        visible={closeShiftModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCloseShiftModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Close Shift</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Expected Cash Amount: ${expectedAmount.toFixed(2)}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  inputFocused === 'expected' && styles.textInputFocused,
                ]}
                value={expectedCash}
                onChangeText={setExpectedCash}
                placeholder={expectedAmount.toFixed(2)}
                keyboardType="numeric"
                onFocus={() => setInputFocused('expected')}
                onBlur={() => setInputFocused(null)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Actual Cash Count</Text>
              <TextInput
                style={[
                  styles.textInput,
                  inputFocused === 'actual' && styles.textInputFocused,
                ]}
                value={actualCash}
                onChangeText={setActualCash}
                placeholder="Enter actual cash count"
                keyboardType="numeric"
                onFocus={() => setInputFocused('actual')}
                onBlur={() => setInputFocused(null)}
              />
            </View>
            
            {expectedCash && actualCash && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Difference</Text>
                <Text style={[
                  styles.infoValue,
                  { color: parseFloat(actualCash) - parseFloat(expectedCash) === 0 ? '#10b981' : '#ef4444' }
                ]}>
                  ${Math.abs(parseFloat(actualCash) - parseFloat(expectedCash)).toFixed(2)}
                  {parseFloat(actualCash) - parseFloat(expectedCash) > 0 ? ' Over' : 
                   parseFloat(actualCash) - parseFloat(expectedCash) < 0 ? ' Short' : ' Perfect'}
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setCloseShiftModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.secondaryButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleCloseShift}
              >
                <Text style={[styles.modalButtonText, styles.primaryButtonText]}>
                  Close Shift
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}