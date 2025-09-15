import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, StatusBar } from 'react-native';

export default function SplashScreen({ navigation }: any) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      navigation.replace('MainTabs'); // navigate to your tab navigator
    }, 1200);

    return () => clearTimeout(t);
  }, [navigation, opacity, scale]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../assets/images/sehat-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brand}>Sehat Connect</Text>
      </Animated.View>

      {/* Optional small footer like “from …” */}
      {/* <Text style={styles.footer}>from HealthyTech</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 140, height: 140, marginBottom: 18 },
  brand: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5, color: '#0F172A' },
  footer: { position: 'absolute', bottom: 32, width: '100%', textAlign: 'center', color: '#6B7280' },
});
