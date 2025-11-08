import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Animated, 
  Easing, 
  StatusBar 
} from 'react-native';

// Simple and reliable splash screen component
export default function SplashScreen({ navigation }: any) {
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations immediately
    const startAnimations = () => {
      // Logo animation
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();

      // Brand text animation (delayed)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(brandOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(brandTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
        ]).start();
      }, 400);


      // Navigation is now handled by AppNavigator
      // No need to navigate from here
    };

    startAnimations();
  }, [logoOpacity, logoScale, brandOpacity, brandTranslateY]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Logo with animation */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }]
          }
        ]}
      >
        <Image
          source={require('../assets/images/sehat-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Brand text with animation */}
      <Animated.View 
        style={[
          styles.brandContainer,
          {
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslateY }]
          }
        ]}
      >
        <Text style={styles.brandText}>SehatConnect</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 160,
    height: 160,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#0F172A',
    textAlign: 'center',
  },
});