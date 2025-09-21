/**
 * Performance optimization utilities for smooth UI experience
 */

import { InteractionManager } from 'react-native';

/**
 * Defer heavy operations until after interactions are complete
 */
export const runAfterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(callback);
};

/**
 * Debounce function to limit the rate of function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit the rate of function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Optimized scroll view props for better performance
 */
export const optimizedScrollViewProps = {
  showsVerticalScrollIndicator: false,
  bounces: true,
  scrollEventThrottle: 16,
  removeClippedSubviews: true,
  keyboardShouldPersistTaps: 'handled' as const,
  nestedScrollEnabled: true,
};

/**
 * Optimized FlatList props for better performance
 */
export const optimizedFlatListProps = {
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  windowSize: 10,
  initialNumToRender: 5,
  updateCellsBatchingPeriod: 50,
  getItemLayout: undefined, // Will be set per component
};

/**
 * Image optimization props
 */
export const optimizedImageProps = {
  fadeDuration: 200,
  resizeMode: 'contain' as const,
};

/**
 * Check if device has low memory
 */
export const isLowMemoryDevice = (): boolean => {
  // This is a simple heuristic - in a real app you might want to use
  // react-native-device-info to get actual device specs
  const { Dimensions } = require('react-native');
  const { width, height } = Dimensions.get('window');
  const screenSize = width * height;
  
  // Consider devices with screen resolution < 1M pixels as low memory
  return screenSize < 1000000;
};

/**
 * Get optimized render batch size based on device capabilities
 */
export const getOptimizedBatchSize = (): number => {
  return isLowMemoryDevice() ? 5 : 10;
};

/**
 * Get optimized window size based on device capabilities
 */
export const getOptimizedWindowSize = (): number => {
  return isLowMemoryDevice() ? 5 : 10;
};


