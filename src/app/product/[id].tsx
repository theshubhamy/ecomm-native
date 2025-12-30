import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedPressable } from '@/components/ThemedPressable';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductById, setSelectedProduct } from '@/store/slices/productsSlice';
import { addToCart, addToCartDB } from '@/store/slices/cartSlice';
import { Product } from '@/types';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { selectedProduct, isLoading, error } = useAppSelector(
    (state) => state.products
  );
  const { user } = useAppSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    if (user?.id) {
      dispatch(
        addToCartDB({
          userId: user.id,
          productId: selectedProduct.id,
          quantity,
        })
      );
    } else {
      dispatch(addToCart({ product: selectedProduct, quantity }));
    }
    Alert.alert('Success', 'Product added to cart!');
  };

  const handleAddToWishlist = () => {
    // TODO: Implement wishlist
    setIsInWishlist(!isInWishlist);
    Alert.alert(
      isInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
      isInWishlist
        ? 'Product removed from your wishlist'
        : 'Product added to your wishlist'
    );
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <ThemedText type="small" style={{ marginTop: 16 }}>
          Loading product...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !selectedProduct) {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <ThemedText type="subtitle" style={{ color: Colors.error }}>
          {error || 'Product not found'}
        </ThemedText>
        <ThemedButton
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: Colors.primary }]}
        >
          <ThemedText type="defaultSemiBold" style={{ color: Colors.black }}>
            Go Back
          </ThemedText>
        </ThemedButton>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <HeaderView>
        <ThemedView style={styles.header}>
          <ThemedPressable onPress={() => router.back()}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={Colors[colorScheme].textPrimary}
            />
          </ThemedPressable>
          <ThemedText type="subtitle">Product Details</ThemedText>
          <ThemedPressable onPress={handleAddToWishlist}>
            <IconSymbol
              name={isInWishlist ? 'favorite.fill' : 'favorite.fill'}
              size={24}
              color={isInWishlist ? Colors.error : Colors[colorScheme].textSecondary}
            />
          </ThemedPressable>
        </ThemedView>
      </HeaderView>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <ThemedView
          style={[
            styles.imageContainer,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <Image
            source={
              selectedProduct.imageUrl
                ? { uri: selectedProduct.imageUrl }
                : require('../../assets/images/icon.png')
            }
            style={styles.productImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={300}
            placeholder={require('../../assets/images/icon.png')}
            recyclingKey={selectedProduct.id.toString()}
            priority="high"
          />
        </ThemedView>

        {/* Product Info */}
        <ThemedView
          style={[
            styles.infoContainer,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedView style={styles.productHeader}>
            <ThemedView style={styles.productTitleContainer}>
              <ThemedText type="subtitle" style={styles.productName}>
                {selectedProduct.name}
              </ThemedText>
              {selectedProduct.rating && (
                <ThemedView style={styles.ratingContainer}>
                  <IconSymbol
                    name="favorite.fill"
                    size={16}
                    color={Colors.warning}
                  />
                  <ThemedText type="xsmall" style={{ marginLeft: 4 }}>
                    {selectedProduct.rating.toFixed(1)}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
            <ThemedText type="subtitle" style={{ color: Colors.primary }}>
              {selectedProduct.price
                ? `$${selectedProduct.price.toFixed(2)}`
                : 'Price N/A'}
            </ThemedText>
          </ThemedView>

          {selectedProduct.description && (
            <ThemedView style={styles.descriptionContainer}>
              <ThemedText
                type="small"
                style={{ color: Colors[colorScheme].textSecondary }}
              >
                {selectedProduct.description}
              </ThemedText>
            </ThemedView>
          )}

          {/* Stock Status */}
          <ThemedView style={styles.stockContainer}>
            <ThemedView
              style={[
                styles.stockBadge,
                {
                  backgroundColor: selectedProduct.inStock
                    ? Colors.success + '20'
                    : Colors.error + '20',
                },
              ]}
            >
              <ThemedText
                type="xsmall"
                style={{
                  color: selectedProduct.inStock ? Colors.success : Colors.error,
                  fontWeight: '600',
                }}
              >
                {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Quantity Selector */}
          <ThemedView style={styles.quantityContainer}>
            <ThemedText
              type="defaultSemiBold"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Quantity
            </ThemedText>
            <ThemedView style={styles.quantityControls}>
              <ThemedButton
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                style={[
                  styles.quantityButton,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    opacity: quantity <= 1 ? 0.5 : 1,
                  },
                ]}
              >
                <IconSymbol
                  name="minus"
                  size={20}
                  color={Colors[colorScheme].textPrimary}
                />
              </ThemedButton>
              <ThemedText type="defaultSemiBold" style={styles.quantityText}>
                {quantity}
              </ThemedText>
              <ThemedButton
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
                style={[
                  styles.quantityButton,
                  {
                    backgroundColor: Colors[colorScheme].background,
                    opacity: quantity >= 10 ? 0.5 : 1,
                  },
                ]}
              >
                <IconSymbol
                  name="plus"
                  size={20}
                  color={Colors[colorScheme].textPrimary}
                />
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionsContainer}>
          <ThemedButton
            onPress={handleAddToCart}
            disabled={!selectedProduct.inStock}
            style={[
              styles.addToCartButton,
              {
                backgroundColor: Colors.primary,
                opacity: selectedProduct.inStock ? 1 : 0.5,
              },
            ]}
          >
            <IconSymbol name="cart.fill" size={20} color={Colors.black} />
            <ThemedText
              type="defaultSemiBold"
              style={{ color: Colors.black, marginLeft: 8 }}
            >
              Add to Cart
            </ThemedText>
          </ThemedButton>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  imageContainer: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  infoContainer: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productHeader: {
    gap: 8,
  },
  productTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  stockContainer: {
    marginTop: 8,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '20',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
    fontSize: 18,
  },
  actionsContainer: {
    gap: 12,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 56,
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
});

