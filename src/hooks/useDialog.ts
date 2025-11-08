import { useState, useCallback } from 'react';

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface DialogOptions {
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttons?: DialogButton[];
  showCloseButton?: boolean;
}

export const useDialog = () => {
  const [visible, setVisible] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions>({
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    showCloseButton: false,
  });

  const showDialog = useCallback((options: DialogOptions) => {
    setDialogOptions(options);
    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, onOk?: () => void) => {
    showDialog({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', onPress: onOk || (() => {}), style: 'default' }],
    });
  }, [showDialog]);

  const showError = useCallback((title: string, message?: string, onOk?: () => void) => {
    showDialog({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress: onOk || (() => {}), style: 'default' }],
    });
  }, [showDialog]);

  const showWarning = useCallback((title: string, message?: string, onOk?: () => void) => {
    showDialog({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'OK', onPress: onOk || (() => {}), style: 'default' }],
    });
  }, [showDialog]);

  const showConfirm = useCallback((
    title: string, 
    message?: string, 
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showDialog({
      title,
      message,
      type: 'warning',
      buttons: [
        { text: cancelText, onPress: onCancel || (() => {}), style: 'cancel' },
        { text: confirmText, onPress: onConfirm || (() => {}), style: 'destructive' },
      ],
    });
  }, [showDialog]);

  return {
    visible,
    dialogOptions,
    showDialog,
    hideDialog,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
  };
};
