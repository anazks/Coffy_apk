// components/CustomAlert.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type AlertType = 'success' | 'error' | 'warning';

interface CustomAlertProps {
  isVisible: boolean;
  type: AlertType; // 'success', 'error', or 'warning'
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void; // Only needed for warning type
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isVisible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  // Configuration based on alert type
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          title: title || 'Success',
          icon: '✓',
          iconBg: '#10B981',
          confirmColor: '#10B981',
          confirmText: 'OK',
          showCancel: false,
        };
      case 'error':
        return {
          title: title || 'Error',
          icon: '✕',
          iconBg: '#E53935',
          confirmColor: '#E53935',
          confirmText: 'OK',
          showCancel: false,
        };
      case 'warning':
        return {
          title: title || 'Warning',
          icon: '⚠',
          iconBg: '#F59E0B',
          confirmColor: '#F59E0B',
          confirmText: 'Yes',
          showCancel: true,
          cancelText: 'No',
        };
      default:
        return {
          title: title || 'Alert',
          icon: 'ℹ',
          iconBg: '#3B82F6',
          confirmColor: '#3B82F6',
          confirmText: 'OK',
          showCancel: false,
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={type === 'warning' ? onCancel : onConfirm}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>{config.title}</Text>

          {/* Message */}
          <Text style={styles.modalText}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {config.showCancel && onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{config.cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: config.confirmColor },
                !config.showCancel && styles.singleButton,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>{config.confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.85,
    maxWidth: 400,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    marginHorizontal: 0,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CustomAlert;