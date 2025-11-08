import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Pressable,
  Platform 
} from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react-native';

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ModernDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttons?: DialogButton[];
  onClose?: () => void;
  showCloseButton?: boolean;
}

const ModernDialog: React.FC<ModernDialogProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [],
  onClose,
  showCloseButton = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color="#10b981" strokeWidth={2} />;
      case 'warning':
        return <AlertTriangle size={48} color="#f59e0b" strokeWidth={2} />;
      case 'error':
        return <AlertCircle size={48} color="#ef4444" strokeWidth={2} />;
      default:
        return <Info size={48} color="#3b82f6" strokeWidth={2} />;
    }
  };

  const getIconBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'warning':
        return '#fffbeb';
      case 'error':
        return '#fef2f2';
      default:
        return '#eff6ff';
    }
  };

  const handleButtonPress = (button: DialogButton) => {
    button.onPress();
    if (onClose) onClose();
  };

  const defaultButtons: DialogButton[] = buttons.length > 0 
    ? buttons 
    : [{ text: 'OK', onPress: () => onClose?.(), style: 'default' }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable 
        style={styles.overlay}
        onPress={showCloseButton ? onClose : undefined}
      >
        <Pressable style={styles.dialogContainer} onPress={(e) => e.stopPropagation()}>
          {/* Close Button */}
          {showCloseButton && onClose && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color="#666" strokeWidth={2} />
            </TouchableOpacity>
          )}

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
            {getIcon()}
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {defaultButtons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              const isLastButton = index === defaultButtons.length - 1;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isDestructive && styles.destructiveButton,
                    isCancel && styles.cancelButton,
                    defaultButtons.length === 2 && styles.halfButton,
                    defaultButtons.length === 2 && index === 0 && styles.leftButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.8}
                >
                  <Text 
                    style={[
                      styles.buttonText,
                      isDestructive && styles.destructiveButtonText,
                      isCancel && styles.cancelButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ModernDialog;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#5a9e31',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  halfButton: {
    flex: 1,
  },
  leftButton: {
    marginRight: 0,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  destructiveButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  cancelButtonText: {
    color: '#666',
  },
  destructiveButtonText: {
    color: '#ffffff',
  },
});
