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

  // Render stars based on rating with partial fill support
  const renderStars = () => {
    if (!item.rating) {
      return (
        <ThemedText
          type="xsmall"
          style={{ color: Colors[colorScheme].textSecondary }}
        >
          No rating
        </ThemedText>
      );
    }

    const rating = item.rating;
    const maxStars = 5;
    const fullStars = Math.floor(rating); // Integer part (full stars)
    const decimalPart = rating - fullStars; // Decimal part (0.0 to 0.9)
    const hasPartialStar = decimalPart > 0 && fullStars < maxStars;
    const emptyStars = maxStars - fullStars - (hasPartialStar ? 1 : 0);

    return (
      <ThemedView style={styles.starsContainer}>
        {/* Full filled stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <IconSymbol
            key={`filled-${index}`}
            name="star.fill"
            size={12}
            color={Colors.warning}
          />
        ))}

        {/* Partial star */}
        {hasPartialStar && (
          <ThemedView style={styles.partialStarContainer}>
            {/* Empty star as background */}
            <IconSymbol
              name="star"
              size={12}
              color={Colors[colorScheme].textSecondary}
            />
            {/* Filled star clipped to percentage */}
            <ThemedView
              style={[
                styles.partialStarFill,
                { width: `${decimalPart * 100}%` },
              ]}
            >
              <IconSymbol name="star.fill" size={12} color={Colors.warning} />
            </ThemedView>
          </ThemedView>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <IconSymbol
            key={`empty-${index}`}
            name="star"
            size={12}
            color={Colors[colorScheme].textSecondary}
          />
        ))}
      </ThemedView>
    );
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
          accessible={true}
          accessibilityRole="text"
        >
          {item.name}
        </ThemedText>
        {/* review */}
        <ThemedView style={styles.reviewContainer}>
          {renderStars()}
          {item.rating && (
            <ThemedText
              type="xsmall"
              style={{
                color: Colors[colorScheme].textPrimary,
                marginLeft: 4,
              }}
            >
              {item.rating.toFixed(1)}
            </ThemedText>
          )}
          {item.reviewCount !== undefined && item.reviewCount > 0 && (
            <ThemedText
              type="xsmall"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginLeft: 4,
              }}
            >
              ({item.reviewCount})
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView style={styles.flexDirectionRow}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText
              type="default"
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
            <ThemedText type="xsmall">Add</ThemedText>
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
    margin: 5,
    padding: 2,
    borderRadius: 10,
    gap: 5,
  },

  flexDirectionRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
  },

  productAddToCartButton: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  partialStarContainer: {
    position: 'relative',
    width: 12,
    height: 12,
  },
  partialStarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    height: 12,
  },
});
