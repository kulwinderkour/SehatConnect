import { Alert, AppState } from 'react-native';

let isAppReady = false;

// Set app as ready after a short delay
setTimeout(() => {
  isAppReady = true;
}, 500);

/**
 * Safe alert function that only shows when app is ready and active
 */
export const safeAlert = (
  title: string, 
  message: string, 
  buttons?: any[]
) => {
  if (isAppReady && AppState.currentState === 'active') {
    Alert.alert(title, message, buttons);
  } else {
    // Fallback: log to console if alert can't be shown
    console.log(`Alert: ${title} - ${message}`);
  }
};

/**
 * Set app ready state manually if needed
 */
export const setAppReady = (ready: boolean) => {
  isAppReady = ready;
};

