import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors[colorScheme].textSecondary + '30',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  const colorScheme = useColorScheme();
  return (
    <ThemedView
      style={[
        styles.productCard,
        { backgroundColor: Colors[colorScheme].backgroundPaper },
      ]}
    >
      <SkeletonLoader width="100%" height={150} borderRadius={8} />
      <SkeletonLoader width="80%" height={16} style={{ marginTop: 12 }} />
      <SkeletonLoader width="60%" height={14} style={{ marginTop: 8 }} />
      <ThemedView style={styles.productFooter}>
        <SkeletonLoader width={60} height={16} />
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </ThemedView>
    </ThemedView>
  );
}

export function OrderCardSkeleton() {
  const colorScheme = useColorScheme();
  return (
    <ThemedView
      style={[
        styles.orderCard,
        { backgroundColor: Colors[colorScheme].backgroundPaper },
      ]}
    >
      <ThemedView style={styles.orderHeader}>
        <SkeletonLoader width={120} height={16} />
        <SkeletonLoader width={80} height={20} borderRadius={12} />
      </ThemedView>
      <ThemedView style={styles.orderItems}>
        {[1, 2].map((i) => (
          <ThemedView key={i} style={styles.orderItem}>
            <SkeletonLoader width={50} height={50} borderRadius={8} />
            <ThemedView style={styles.itemInfo}>
              <SkeletonLoader width="80%" height={14} />
              <SkeletonLoader width="60%" height={12} style={{ marginTop: 4 }} />
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
      <ThemedView style={styles.orderFooter}>
        <SkeletonLoader width={80} height={16} />
        <SkeletonLoader width={60} height={32} borderRadius={8} />
      </ThemedView>
    </ThemedView>
  );
}

export function CartItemSkeleton() {
  const colorScheme = useColorScheme();
  return (
    <ThemedView
      style={[
        styles.cartItem,
        { backgroundColor: Colors[colorScheme].backgroundPaper },
      ]}
    >
      <SkeletonLoader width={80} height={80} borderRadius={8} />
      <ThemedView style={styles.cartItemInfo}>
        <SkeletonLoader width="70%" height={16} />
        <SkeletonLoader width="50%" height={14} style={{ marginTop: 8 }} />
        <ThemedView style={styles.quantityControls}>
          <SkeletonLoader width={32} height={32} borderRadius={8} />
          <SkeletonLoader width={30} height={16} />
          <SkeletonLoader width={32} height={32} borderRadius={8} />
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.cartItemActions}>
        <SkeletonLoader width={60} height={16} />
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  productCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    gap: 8,
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  cartItemInfo: {
    flex: 1,
    gap: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  cartItemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});

