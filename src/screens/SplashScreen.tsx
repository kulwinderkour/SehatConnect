import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, StatusBar } from 'react-native';

export default function SplashScreen({ navigation }: any) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(logoOpacity, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true, 
        easing: Easing.out(Easing.quad) 
      }),
      Animated.spring(logoScale, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }),
    ]).start();

    // Brand text animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(brandOpacity, { 
          toValue: 1, 
          duration: 600, 
          useNativeDriver: true 
        }),
        Animated.timing(brandTranslateY, { 
          toValue: 0, 
          duration: 600, 
          useNativeDriver: true,
          easing: Easing.out(Easing.quad)
        }),
      ]).start();
    }, 400);

    // Footer animation (delayed further)
    setTimeout(() => {
      Animated.timing(footerOpacity, { 
        toValue: 1, 
        duration: 500, 
        useNativeDriver: true 
      }).start();
    }, 800);

    // Navigate to main app
    const t = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2500);

    return () => clearTimeout(t);
  }, [navigation, logoOpacity, logoScale, brandOpacity, brandTranslateY, footerOpacity]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.center, { 
        opacity: logoOpacity, 
        transform: [{ scale: logoScale }] 
      }]}>
        <Image
          source={require('../assets/images/sehat-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Animated.View style={{
          opacity: brandOpacity,
          transform: [{ translateY: brandTranslateY }]
        }}>
          <Text style={styles.brand}>SehatConnect</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.footerContainer, { opacity: footerOpacity }]}>
        <Text style={styles.footerText}>from</Text>
        <Text style={styles.footerBrand}>SehatConnect</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 160, height: 160, marginBottom: 24 },
  brand: { 
    fontSize: 28, 
    fontWeight: '800', 
    letterSpacing: 0.5, 
    color: '#0F172A',
    marginTop: 8
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
