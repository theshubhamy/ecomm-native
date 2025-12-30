import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product as ProductType } from '@/types';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { ThemedPressable } from '../ThemedPressable';
import { IconSymbol } from '../ui/IconSymbol';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, addToCartDB } from '@/store/slices/cartSlice';

interface ProductProps {
  item: ProductType;
}

const Product = ({ item }: ProductProps) => {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleAddToCart = () => {
    if (user?.id) {
      // Add to cart in database
      dispatch(addToCartDB({ userId: user.id, productId: item.id, quantity: 1 }));
    } else {
      // Add to local cart
      dispatch(addToCart({ product: item, quantity: 1 }));
    }
    Alert.alert('Success', 'Product added to cart!');
  };

  const handleAddToWishlist = () => {
    // TODO: Implement wishlist functionality
    Alert.alert('Coming Soon', 'Wishlist feature coming soon!');
  };
  return (
    <ThemedView
      style={{
        ...styles.cardContainer,
        backgroundColor: Colors[colorScheme].backgroundPaper,
      }}
    >
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require('../../assets/images/icon.png')
        }
        style={styles.productImage}
        contentFit="cover"
      />
      <ThemedText type="small" numberOfLines={2}>
        {item.name}
      </ThemedText>
      <ThemedView style={styles.flexDirectionRow}>
        <ThemedText style={styles.productPrice}>
          {item.price ? `$${item.price.toFixed(2)}` : 'Price N/A'}
        </ThemedText>
        <ThemedButton
          style={styles.productAddToCartButton}
          onPress={handleAddToCart}
        >
          <IconSymbol name="cart.fill" size={28} color={Colors.secondary} />
        </ThemedButton>
      </ThemedView>

      <ThemedPressable style={styles.heartButton} onPress={handleAddToWishlist}>
        <IconSymbol name="favorite.fill" size={28} color={Colors.error} />
      </ThemedPressable>
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
