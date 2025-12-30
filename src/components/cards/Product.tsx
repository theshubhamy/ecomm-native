import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product as ProductType } from '@/types';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from '../ui/IconSymbol';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, addToCartDB } from '@/store/slices/cartSlice';
import { router } from 'expo-router';

interface ProductProps {
  item: ProductType;
}

const Product = ({ item }: ProductProps) => {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [imageError, setImageError] = useState(false);
  const { inventoryUpdates } = useAppSelector(state => state.products);

  // Get real-time inventory status
  const inventoryStatus = inventoryUpdates[item.id];
  const currentStockStatus = inventoryStatus
    ? inventoryStatus.inStock
    : item.inStock ?? true;

  const handleProductPress = () => {
    router.push(`/product/${item.id}`);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (user?.id) {
      // Add to cart in database
      dispatch(
        addToCartDB({ userId: user.id, productId: item.id, quantity: 1 }),
      );
    } else {
      // Add to local cart
      dispatch(addToCart({ product: item, quantity: 1 }));
    }
    Alert.alert('Success', 'Product added to cart!');
  };

  return (
    <TouchableOpacity
      onPress={handleProductPress}
      activeOpacity={0.9}
      accessible={true}
      accessibilityLabel={`Product: ${item.name}. Price: ${
        item.price ? `$${item.price.toFixed(2)}` : 'Price not available'
      }`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view product details"
    >
      <ThemedView
        style={{
          ...styles.cardContainer,
          backgroundColor: Colors[colorScheme].backgroundPaper,
        }}
      >
        <Image
          source={
            item.imageUrl && !imageError
              ? { uri: item.imageUrl }
              : require('../../assets/images/icon.png')
          }
          style={styles.productImage}
          contentFit="cover"
          accessible={true}
          accessibilityLabel={`Product image for ${item.name}`}
          cachePolicy="memory-disk"
          transition={200}
          onError={() => setImageError(true)}
          placeholder={require('../../assets/images/icon.png')}
          recyclingKey={item.id.toString()}
        />
        <ThemedText
          type="small"
          numberOfLines={2}
          style={{ fontSize: 16, fontWeight: 'bold' }}
          accessible={true}
          accessibilityRole="text"
        >
          {item.name}
        </ThemedText>
        <ThemedView style={styles.flexDirectionRow}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText
              style={styles.productPrice}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`Price: ${
                item.price ? `₹${item.price.toFixed(0)}` : 'Price not available'
              }`}
            >
              {item.price ? `₹${item.price.toFixed(0)}` : 'Price N/A'}
            </ThemedText>
            {!currentStockStatus && (
              <ThemedText
                type="xsmall"
                style={{ color: Colors.error, marginTop: 2 }}
              >
                Out of Stock
              </ThemedText>
            )}
          </ThemedView>
          <ThemedButton
            style={[
              styles.productAddToCartButton,
              { opacity: currentStockStatus ? 1 : 0.5 },
            ]}
            onPress={handleAddToCart}
            disabled={!currentStockStatus}
            accessible={true}
            accessibilityLabel={
              currentStockStatus
                ? 'Add to cart'
                : 'Out of stock, cannot add to cart'
            }
            accessibilityRole="button"
            accessibilityHint="Double tap to add this product to your cart"
          >
            <IconSymbol name="cart.fill" size={20} color={Colors.secondary} />
          </ThemedButton>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
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
});
