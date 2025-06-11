import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';
const Product = ({ item }: any) => {
  const colorScheme = useColorScheme();
  return (
    <ThemedView
      style={{
        ...styles.cardContainer,
        backgroundColor: Colors[colorScheme].backgroundPaper,
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <ThemedText type="small">Product Name{item.id}</ThemedText>
      <ThemedView style={styles.flexDirectionRow}>
        <ThemedText style={styles.productPrice}>$99.99</ThemedText>
        <ThemedButton style={styles.productAddToCartButton}>
          <IconSymbol name="cart.fill" size={28} color={Colors.secondary} />
        </ThemedButton>
      </ThemedView>

      <ThemedView style={styles.heartButton}>
        <IconSymbol name="favorite.fill" size={28} color={Colors.error} />
      </ThemedView>
    </ThemedView>
  );
};

export default Product;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 10,
    padding: 2,
    borderRadius: 10,
    gap: 10,
  },

  flexDirectionRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productAddToCartButton: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },

  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    borderRadius: 50,
  },
});
