import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#fff" 
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  connectedButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  button: {
    padding: 12,
    backgroundColor: "#0a84ff",
    borderRadius: 8,
    marginBottom: 16,
  },
  scanningButton: {
    backgroundColor: "#ff6b35",
  },
  buttonText: { 
    color: "#fff", 
    textAlign: "center", 
    fontWeight: "bold" 
  },
  connectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  connectingText: {
    marginLeft: 8,
    color: '#0a84ff',
    fontWeight: '500',
  },
  printSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  printButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  printButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#28a745',
    borderRadius: 6,
    alignItems: 'center',
  },
  disconnectBtn: {
    backgroundColor: '#dc3545',
  },
  printButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  item: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee" 
  },
  connectedItem: {
    backgroundColor: '#f0fff0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sub: { 
    fontSize: 12, 
    color: "#666" 
  },
  connectedBadge: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
