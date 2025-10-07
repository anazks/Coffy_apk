import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { BleManager } from 'react-native-ble-plx';

// Storage keys
const STORAGE_KEYS = {
    CONNECTED_PRINTER: 'connected_printer',
};

// Create BleManager instance
const manager = new BleManager();

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
    const [printing, setPrinting] = useState(false);
    const [printerConnected, setPrinterConnected] = useState(false);

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

    // ==================== PRINTER FUNCTIONS ====================

    // Get saved printer from AsyncStorage
    const getSavedPrinter = async () => {
        try {
            const savedPrinter = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTED_PRINTER);
            return savedPrinter ? JSON.parse(savedPrinter) : null;
        } catch (error) {
            console.log('Error getting saved printer:', error);
            return null;
        }
    };

    // Check if printer is connected
    const checkPrinterConnection = async () => {
        try {
            const printer = await getSavedPrinter();
            if (!printer) {
                return { connected: false, printer: null };
            }

            // Try to connect to verify the printer is still available
            const device = await manager.connectToDevice(printer.deviceId, {
                timeout: 5000,
            });

            const isConnected = await device.isConnected();
            await device.cancelConnection(); // Disconnect after check

            return { connected: isConnected, printer };
        } catch (error) {
            console.log('Printer connection check failed:', error);
            return { connected: false, printer: null };
        }
    };

    // Write to printer
    const writeToPrinter = async (device: any, serviceUUID: string, characteristicUUID: string, data: number[]) => {
        try {
            const buffer = Buffer.from(data);
            const base64Data = buffer.toString('base64');

            await device.writeCharacteristicWithoutResponseForService(
                serviceUUID,
                characteristicUUID,
                base64Data
            );

            // Small delay between commands
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.log('Write failed:', error);
            throw error;
        }
    };

    // Format receipt for printing
    const formatReceiptForPrinting = () => {
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
        };

        const commands = [
            0x1B, 0x40, // Initialize printer
            
            // Center alignment + Double height for header
            0x1B, 0x61, 0x01, // Center alignment
            0x1D, 0x21, 0x01, // Double height
            ...Buffer.from(`${safeReceiptData.store_name}\n`),
            0x1D, 0x21, 0x00, // Normal height
            ...Buffer.from('========================\n'),
            
            // Store address
            0x1B, 0x61, 0x01, // Center alignment
            ...Buffer.from(`${renderStoreAddress()}\n\n`),
            
            // Order details - left aligned
            0x1B, 0x61, 0x00, // Left alignment
            ...Buffer.from(`Order #: ${safeReceiptData.order_id}\n`),
            ...Buffer.from(`Token   : ${safeReceiptData.token}\n`),
            ...Buffer.from(`Date    : ${formatDate(safeReceiptData.create_date)}\n`),
            ...Buffer.from(`Time    : ${formatTime(safeReceiptData.create_date)}\n`),
            ...Buffer.from(`Type    : ${safeReceiptData.order_method}\n`),
            ...Buffer.from(`Payment : ${safeReceiptData.payment_method}\n`),
            ...Buffer.from('------------------------\n\n'),
            
            // Items header
            0x1B, 0x45, 0x01, // Bold on
            ...Buffer.from('ITEMS ORDERED\n'),
            0x1B, 0x45, 0x00, // Bold off
            ...Buffer.from('------------------------\n'),
        ];

        // Add items
        if (safeReceiptData.checkout_items && safeReceiptData.checkout_items.length > 0) {
            safeReceiptData.checkout_items.forEach((item) => {
                const itemName = item.name || 'Unknown Item';
                const quantity = item.quantity || 0;
                const unitPrice = item.unit_price || 0;
                const itemTotal = item.item_total || 0;
                
                // Item name (truncate if too long)
                const maxNameLength = 24;
                let displayName = itemName;
                if (itemName.length > maxNameLength) {
                    displayName = itemName.substring(0, maxNameLength - 3) + '...';
                }
                
                // Item name and quantity
                commands.push(...Buffer.from(`${displayName}\n`));
                commands.push(
                    ...Buffer.from(`  Qty: ${quantity} x ₹${unitPrice.toFixed(2)}`),
                    0x1B, 0x61, 0x02, // Right alignment for total
                    ...Buffer.from(`₹${itemTotal.toFixed(2)}\n`),
                    0x1B, 0x61, 0x00, // Left alignment
                );

                // Add-ons
                if (item.add_ons && item.add_ons.length > 0) {
                    const addOnsText = renderAddOns(item.add_ons);
                    if (addOnsText) {
                        commands.push(...Buffer.from(`  Add: ${addOnsText}\n`));
                    }
                }
                
                commands.push(...Buffer.from('\n'));
            });
        } else {
            commands.push(...Buffer.from('No items found\n\n'));
        }

        commands.push(
            ...Buffer.from('------------------------\n'),
            
            // Totals - left aligned labels, right aligned values
            0x1B, 0x61, 0x00, // Left alignment
            ...Buffer.from(`Subtotal:`),
            0x1B, 0x61, 0x02, // Right alignment
            ...Buffer.from(`₹${safeReceiptData.subtotal.toFixed(2)}\n`),
            
            0x1B, 0x61, 0x00, // Left alignment
        );

        // Discount
        if (safeReceiptData.discount_amount > 0) {
            commands.push(
                ...Buffer.from(`Discount:`),
                0x1B, 0x61, 0x02, // Right alignment
                ...Buffer.from(`-₹${safeReceiptData.discount_amount.toFixed(2)}\n`),
                0x1B, 0x61, 0x00, // Left alignment
            );
        }

        // Service charge
        if (safeReceiptData.service_charge > 0) {
            commands.push(
                ...Buffer.from(`Service Charge:`),
                0x1B, 0x61, 0x02, // Right alignment
                ...Buffer.from(`₹${safeReceiptData.service_charge.toFixed(2)}\n`),
                0x1B, 0x61, 0x00, // Left alignment
            );
        }

        // Tax
        if (safeReceiptData.total_tax > 0) {
            commands.push(
                ...Buffer.from(`Tax:`),
                0x1B, 0x61, 0x02, // Right alignment
                ...Buffer.from(`₹${safeReceiptData.total_tax.toFixed(2)}\n`),
                0x1B, 0x61, 0x00, // Left alignment
            );
        }

        // Grand total
        commands.push(
            ...Buffer.from('========================\n'),
            0x1B, 0x45, 0x01, // Bold on
            ...Buffer.from(`TOTAL:`),
            0x1B, 0x61, 0x02, // Right alignment
            ...Buffer.from(`₹${safeReceiptData.final_amount.toFixed(2)}\n`),
            0x1B, 0x45, 0x00, // Bold off
            0x1B, 0x61, 0x00, // Left alignment
            
            ...Buffer.from('========================\n\n'),
            
            // Payment status and thank you message
            0x1B, 0x61, 0x01, // Center alignment
            ...Buffer.from(`Status: ${safeReceiptData.payment_status}\n\n`),
            ...Buffer.from('Thank you for your order!\n'),
            ...Buffer.from('Please visit again!\n\n\n'),
            
            // Paper handling
            0x1B, 0x64, 0x04, // Feed 4 lines
            0x1B, 0x69, // Cut paper
        );

        return commands;
    };

    // Main print function
    const printReceipt = async () => {
        setPrinting(true);
        
        try {
            // Check if printer is saved and connected
            const { connected, printer } = await checkPrinterConnection();
            
            if (!connected || !printer) {
                Alert.alert(
                    'Printer Not Connected',
                    'Please connect to a Bluetooth printer first.',
                    [
                        { 
                            text: 'Connect Printer', 
                            onPress: () => {
                                // You can navigate to BluetoothScanner here if needed
                                Alert.alert('Info', 'Please use the Bluetooth Scanner to connect a printer first.');
                            } 
                        },
                        { text: 'Cancel' }
                    ]
                );
                return;
            }

            console.log('🖨️ Printing receipt to:', printer.name);

            // Connect to printer
            const device = await manager.connectToDevice(printer.deviceId, {
                timeout: 10000,
            });

            // Verify connection
            const isConnected = await device.isConnected();
            if (!isConnected) {
                throw new Error('Failed to connect to printer');
            }

            // Format receipt data
            const printCommands = formatReceiptForPrinting();
            
            if (!printCommands) {
                throw new Error('Failed to format receipt for printing');
            }

            // Send to printer
            await writeToPrinter(
                device, 
                printer.serviceUUID, 
                printer.characteristicUUID, 
                printCommands
            );

            // Disconnect after printing
            await device.cancelConnection();

            Alert.alert('Success', 'Receipt sent to printer successfully!');
            
        } catch (error) {
            console.log('❌ Print failed:', error);
            Alert.alert(
                'Print Failed', 
                error.message || 'Could not print receipt. Please check printer connection.'
            );
        } finally {
            setPrinting(false);
        }
    };

    // ==================== HELPER FUNCTIONS ====================

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
                {/* Printer Status */}
                <View style={styles.printerStatus}>
                    <TouchableOpacity 
                        style={styles.checkPrinterButton}
                        onPress={async () => {
                            const { connected, printer } = await checkPrinterConnection();
                            if (connected && printer) {
                                Alert.alert('Printer Status', `Connected to: ${printer.name}`);
                            } else {
                                Alert.alert('Printer Status', 'No printer connected');
                            }
                        }}
                    >
                        <Ionicons name="bluetooth" size={16} color="#2563eb" />
                        <Text style={styles.checkPrinterText}>Check Printer</Text>
                    </TouchableOpacity>
                </View>

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
                <TouchableOpacity 
                    style={[styles.printButton, printing && styles.printButtonDisabled]} 
                    onPress={printReceipt}
                    disabled={printing}
                >
                    {printing ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <>
                            <Ionicons name="print-outline" size={20} color="#ffffff" style={styles.printIcon} />
                            <Text style={styles.printButtonText}>
                                Print Receipt
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Print Info */}
                <View style={styles.printInfo}>
                    <Text style={styles.printInfoText}>
                        Make sure your Bluetooth printer is turned on and connected.
                    </Text>
                </View>
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
    printerStatus: {
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    checkPrinterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    checkPrinterText: {
        fontSize: 12,
        color: '#2563eb',
        fontWeight: '500',
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
        marginBottom: 12,
    },
    printButtonDisabled: {
        backgroundColor: '#93c5fd',
    },
    printIcon: {
        marginRight: 8,
    },
    printButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    printInfo: {
        padding: 12,
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#0ea5e9',
    },
    printInfoText: {
        fontSize: 12,
        color: '#0369a1',
        textAlign: 'center',
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