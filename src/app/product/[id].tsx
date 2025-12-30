import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shareProduct, createProductShareMessage } from '@/utils/share';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedPressable } from '@/components/ThemedPressable';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ProductCard from '@/components/cards/Product';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProductById,
  fetchProductsByCategory,
} from '@/store/slices/productsSlice';
import { addToCart, addToCartDB } from '@/store/slices/cartSlice';
import { Product } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { selectedProduct, isLoading, error } = useAppSelector(
    state => state.products,
  );
  const { user } = useAppSelector(state => state.auth);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch]);

  // Fetch similar products when product is loaded
  useEffect(() => {
    if (selectedProduct?.categoryId) {
      setLoadingSimilar(true);
      dispatch(fetchProductsByCategory(selectedProduct.categoryId))
        .then(result => {
          if (fetchProductsByCategory.fulfilled.match(result)) {
            // Filter out current product and limit to 10
            const similar = result.payload
              .filter(p => p.id !== selectedProduct.id)
              .slice(0, 10);
            setSimilarProducts(similar);
          }
        })
        .finally(() => setLoadingSimilar(false));
    }
  }, [selectedProduct?.categoryId, selectedProduct?.id, dispatch]);

  // Calculate original price (if discount exists, add 20% to current price)
  useEffect(() => {
    if (selectedProduct?.price) {
      // Simulate discount - if price is below 1000, show original price
      if (selectedProduct.price < 1000) {
        setOriginalPrice(selectedProduct.price * 1.2);
      } else {
        setOriginalPrice(null);
      }
    }
  }, [selectedProduct?.price]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    if (user?.id) {
      dispatch(
        addToCartDB({
          userId: user.id,
          productId: selectedProduct.id,
          quantity: 1,
        }),
      );
    } else {
      dispatch(addToCart({ product: selectedProduct, quantity: 1 }));
    }
    Alert.alert('Success', 'Product added to cart!');
  };

  // Render stars based on rating with partial fill support
  const renderStars = () => {
    if (!selectedProduct || !selectedProduct.rating) {
      return null;
    }

    const rating = selectedProduct.rating;
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    const hasPartialStar = decimalPart > 0 && fullStars < maxStars;
    const emptyStars = maxStars - fullStars - (hasPartialStar ? 1 : 0);

    return (
      <ThemedView style={styles.starsContainer}>
        {Array.from({ length: fullStars }).map((_, index) => (
          <IconSymbol
            key={`filled-${index}`}
            name="star.fill"
            size={16}
            color={Colors.warning}
          />
        ))}
        {hasPartialStar && (
          <ThemedView style={styles.partialStarContainer}>
            <IconSymbol
              name="star"
              size={16}
              color={Colors[colorScheme].textSecondary + '40'}
            />
            <ThemedView
              style={[
                styles.partialStarFill,
                { width: `${decimalPart * 100}%` },
              ]}
            >
              <IconSymbol name="star.fill" size={16} color={Colors.warning} />
            </ThemedView>
          </ThemedView>
        )}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <IconSymbol
            key={`empty-${index}`}
            name="star"
            size={16}
            color={Colors[colorScheme].textSecondary + '40'}
          />
        ))}
      </ThemedView>
    );
  };
  const handleShare = async () => {
    if (!selectedProduct) return;

    const message = createProductShareMessage(selectedProduct);
    await shareProduct({ product: selectedProduct, message });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Removed from Wishlist' : 'Added to Wishlist',
      isFavorite
        ? 'Product removed from your wishlist'
        : 'Product added to your wishlist',
    );
  };

  const calculateDiscount = () => {
    if (originalPrice && selectedProduct?.price) {
      const discount =
        ((originalPrice - selectedProduct.price) / originalPrice) * 100;
      return Math.round(discount);
    }
    return null;
  };

  const getDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3); // 3 days delivery
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const renderSimilarProduct = ({ item }: { item: Product }) => (
    <ThemedView style={styles.similarProductCard}>
      <ProductCard item={item} />
    </ThemedView>
  );

  const renderFeatureItem = (feature: string) => (
    <ThemedView style={styles.featureItem}>
      <IconSymbol
        name="checkmark.square.fill"
        size={18}
        color={Colors.success}
      />
      <ThemedText
        type="small"
        style={[styles.featureText, { color: Colors[colorScheme].textPrimary }]}
      >
        {feature}
      </ThemedText>
    </ThemedView>
  );

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
      {/* Sticky Header - Fixed at top */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            paddingBottom: 8,
            backgroundColor: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', Colors[colorScheme].backgroundPaper],
            }),
          },
        ]}
      >
        <ThemedPressable
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Animated.View
            style={[
              styles.headerButtonInner,
              {
                backgroundColor: headerOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    Colors.light.background + '80',
                    Colors[colorScheme].background,
                  ],
                }),
              },
            ]}
          >
            <IconSymbol
              name="chevron.left"
              size={24}
              color={
                headerScrolled ? Colors[colorScheme].textPrimary : Colors.black
              }
            />
          </Animated.View>
        </ThemedPressable>
        <ThemedView style={styles.headerActions}>
          <ThemedPressable
            onPress={handleToggleFavorite}
            style={styles.headerButton}
          >
            <Animated.View
              style={[
                styles.headerButtonInner,
                {
                  backgroundColor: headerOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      Colors.light.background + '80',
                      Colors[colorScheme].background,
                    ],
                  }),
                },
              ]}
            >
              <IconSymbol
                name={isFavorite ? 'favorite.fill' : 'favorite.fill'}
                size={20}
                color={
                  headerScrolled
                    ? isFavorite
                      ? Colors.error
                      : Colors[colorScheme].textSecondary
                    : Colors.black
                }
              />
            </Animated.View>
          </ThemedPressable>
          <ThemedPressable
            onPress={() => handleShare()}
            style={styles.headerButton}
          >
            <Animated.View
              style={[
                styles.headerButtonInner,
                {
                  backgroundColor: headerOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      Colors.light.background + '80',
                      Colors[colorScheme].background,
                    ],
                  }),
                },
              ]}
            >
              <IconSymbol
                name="share.fill"
                size={20}
                color={
                  headerScrolled
                    ? Colors[colorScheme].textPrimary
                    : Colors.black
                }
              />
            </Animated.View>
          </ThemedPressable>
        </ThemedView>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const threshold = 50;
              const opacity = Math.min(offsetY / threshold, 1);

              setHeaderScrolled(offsetY > threshold);

              Animated.timing(headerOpacity, {
                toValue: opacity,
                duration: 150,
                useNativeDriver: false,
              }).start();
            },
          },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <ThemedView style={styles.imageContainer}>
          <Image
            source={
              selectedProduct.imageUrl
                ? { uri: selectedProduct.imageUrl }
                : require('../../assets/images/icon.png')
            }
            style={styles.productImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
            placeholder={require('../../assets/images/icon.png')}
            recyclingKey={selectedProduct.id.toString()}
            priority="high"
          />
        </ThemedView>

        {/* Product Info Card */}
        <ThemedView
          style={[
            styles.infoCard,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          {/* Product Name & Price */}
          <ThemedView style={styles.titleSection}>
            <ThemedText style={styles.productName}>
              {selectedProduct.name}{' '}
            </ThemedText>
            <ThemedView style={styles.titleRow}>
              {selectedProduct.rating && selectedProduct.rating >= 4.5 && (
                <ThemedView
                  style={[
                    styles.badge,
                    { backgroundColor: Colors.warning + '20' },
                  ]}
                >
                  <ThemedText type="xsmall" style={{ color: Colors.warning }}>
                    ⭐ Best Seller
                  </ThemedText>
                </ThemedView>
              )}
              {/* Stock Status */}
              <ThemedView style={styles.stockSection}>
                <ThemedView
                  style={[
                    styles.stockBadge,
                    {
                      backgroundColor: selectedProduct.inStock
                        ? Colors.success + '15'
                        : Colors.error + '15',
                    },
                  ]}
                >
                  <ThemedView
                    style={[
                      styles.stockDot,
                      {
                        backgroundColor: selectedProduct.inStock
                          ? Colors.success
                          : Colors.error,
                      },
                    ]}
                  />
                  <ThemedText
                    type="xsmall"
                    style={{
                      color: selectedProduct.inStock
                        ? Colors.success
                        : Colors.error,
                      fontWeight: '600',
                      marginLeft: 6,
                    }}
                  >
                    {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              {(selectedProduct.rating || selectedProduct.reviewCount) && (
                <ThemedView style={styles.ratingSection}>
                  {renderStars()}
                  {selectedProduct.rating && (
                    <ThemedText
                      type="small"
                      style={[
                        styles.ratingText,
                        { color: Colors[colorScheme].textPrimary },
                      ]}
                    >
                      {selectedProduct.rating.toFixed(1)}
                    </ThemedText>
                  )}
                  {selectedProduct.reviewCount !== undefined &&
                    selectedProduct.reviewCount > 0 && (
                      <ThemedText
                        type="xsmall"
                        style={{ color: Colors[colorScheme].textSecondary }}
                      >
                        {' '}
                        ({selectedProduct.reviewCount} reviews)
                      </ThemedText>
                    )}
                </ThemedView>
              )}
            </ThemedView>
            {/* Rating & Reviews */}

            <ThemedView style={styles.priceSection}>
              <ThemedView style={styles.priceRow}>
                {originalPrice && (
                  <ThemedText
                    type="small"
                    style={[
                      styles.originalPrice,
                      { color: Colors[colorScheme].textSecondary },
                    ]}
                  >
                    ₹{originalPrice.toFixed(0)}
                  </ThemedText>
                )}
                <ThemedText type="subtitle">
                  {selectedProduct.price
                    ? `₹${selectedProduct.price.toFixed(0)}`
                    : 'Price N/A'}
                </ThemedText>
              </ThemedView>
              {originalPrice && (
                <ThemedText
                  type="xsmall"
                  style={[styles.discountText, { color: Colors.success }]}
                >
                  You save ₹
                  {(originalPrice - (selectedProduct.price || 0)).toFixed(0)}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>

          {/* Delivery Info */}
          <ThemedView
            style={[
              styles.deliveryInfoCard,
              { backgroundColor: Colors[colorScheme].background },
            ]}
          >
            <IconSymbol name="location.fill" size={24} color={Colors.primary} />
            <ThemedView
              style={[
                styles.deliveryInfoContent,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.deliveryTitle,
                  { color: Colors[colorScheme].textPrimary },
                ]}
              >
                Delivery by {getDeliveryDate()}
              </ThemedText>
              <ThemedText
                type="xsmall"
                style={[
                  styles.deliverySubtitle,
                  { color: Colors[colorScheme].textSecondary },
                ]}
              >
                Free delivery on orders above ₹500
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Description */}
          {selectedProduct.description && (
            <ThemedView style={styles.descriptionSection}>
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.sectionTitle,
                  { color: Colors[colorScheme].textPrimary },
                ]}
              >
                Description
              </ThemedText>
              <ThemedText
                type="small"
                style={[
                  styles.descriptionText,
                  { color: Colors[colorScheme].textSecondary },
                ]}
              >
                {selectedProduct.description}
              </ThemedText>
            </ThemedView>
          )}
          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <ThemedView
              style={[
                styles.similarProductsSection,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                },
              ]}
            >
              <ThemedView style={styles.similarProductsHeader}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.sectionTitle,
                    { color: Colors[colorScheme].textPrimary },
                  ]}
                >
                  Similar Products
                </ThemedText>
                <ThemedPressable
                  onPress={() => {
                    if (selectedProduct?.categoryId) {
                      router.push(
                        `/(tabs)/catalog?category=${selectedProduct.categoryId}`,
                      );
                    }
                  }}
                  style={styles.viewAllButton}
                >
                  <ThemedText
                    type="small"
                    style={[
                      styles.viewAllText,
                      { color: Colors.primary, fontWeight: '600' },
                    ]}
                  >
                    View All
                  </ThemedText>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={Colors.primary}
                  />
                </ThemedPressable>
              </ThemedView>
              {loadingSimilar ? (
                <ThemedView style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </ThemedView>
              ) : (
                <FlatList
                  data={similarProducts}
                  renderItem={renderSimilarProduct}
                  keyExtractor={item => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.similarProductsList}
                  ItemSeparatorComponent={() => (
                    <ThemedView style={{ width: 16 }} />
                  )}
                />
              )}
            </ThemedView>
          )}
          {/* Key Features */}
          <ThemedView style={styles.featuresSection}>
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.sectionTitle,
                { color: Colors[colorScheme].textPrimary },
              ]}
            >
              Key Features
            </ThemedText>
            <ThemedView style={styles.featuresList}>
              {selectedProduct.description && (
                <>
                  {renderFeatureItem('Premium Quality Product')}
                  {renderFeatureItem('Fast & Secure Delivery')}
                  {renderFeatureItem('Easy Returns & Exchange')}
                  {renderFeatureItem('Warranty Included')}
                  {selectedProduct.inStock &&
                    renderFeatureItem('Available in Stock')}
                </>
              )}
            </ThemedView>
          </ThemedView>

          {/* Shipping & Returns Info */}
          <ThemedView style={styles.infoSection}>
            <ThemedView
              style={[
                styles.shippingInfoCard,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <IconSymbol
                name="location.fill"
                size={24}
                color={Colors.primary}
              />
              <ThemedView
                style={[
                  styles.infoContent,
                  { backgroundColor: Colors[colorScheme].background },
                ]}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.infoTitle,
                    { color: Colors[colorScheme].textPrimary },
                  ]}
                >
                  Free Shipping
                </ThemedText>
                <ThemedText
                  type="xsmall"
                  style={[
                    styles.infoText,
                    { color: Colors[colorScheme].textSecondary },
                  ]}
                >
                  Free delivery on orders above ₹500
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView
              style={[
                styles.shippingInfoCard,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <IconSymbol
                name="chevron.left.forwardslash.chevron.right"
                size={24}
                color={Colors.primary}
              />
              <ThemedView
                style={[
                  styles.infoContent,
                  { backgroundColor: Colors[colorScheme].background },
                ]}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.infoTitle,
                    { color: Colors[colorScheme].textPrimary },
                  ]}
                >
                  Easy Returns
                </ThemedText>
                <ThemedText
                  type="xsmall"
                  style={[
                    styles.infoText,
                    { color: Colors[colorScheme].textSecondary },
                  ]}
                >
                  7-day return policy
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView
              style={[
                styles.shippingInfoCard,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <IconSymbol
                name="checkmark.square.fill"
                size={24}
                color={Colors.primary}
              />
              <ThemedView
                style={[
                  styles.infoContent,
                  { backgroundColor: Colors[colorScheme].background },
                ]}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.infoTitle,
                    { color: Colors[colorScheme].textPrimary },
                  ]}
                >
                  Authentic Products
                </ThemedText>
                <ThemedText
                  type="xsmall"
                  style={[
                    styles.infoText,
                    { color: Colors[colorScheme].textSecondary },
                  ]}
                >
                  100% genuine products guaranteed
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Animated.ScrollView>

      {/* Fixed Bottom Action Bar */}
      <ThemedView
        style={[
          styles.bottomBar,
          {
            backgroundColor: Colors[colorScheme].backgroundPaper,
            paddingBottom: insets.bottom + 16,
            borderTopColor: Colors[colorScheme].textSecondary + '10',
          },
        ]}
      >
        <ThemedView style={styles.quantitySection}>
          <ThemedView style={styles.priceSection}>
            <ThemedText type="small">
              {selectedProduct.price
                ? `₹${selectedProduct.price.toFixed(0)}`
                : 'Price N/A'}{' '}
              MRP{' '}
            </ThemedText>
            {calculateDiscount() && (
              <ThemedView style={styles.badge}>
                <ThemedText type="small">{calculateDiscount()}% OFF</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          <ThemedText type="xsmall"> Inclusive of all taxes</ThemedText>
        </ThemedView>
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
          <ThemedText type="small" style={{ color: Colors.black }}>
            Add to Cart
          </ThemedText>
        </ThemedButton>
      </ThemedView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  headerButton: {
    padding: 0,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerButtonInner: {
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
    backgroundColor: Colors.light.background,
  },
  badgesContainer: {
    position: 'absolute',
    top: 24,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.secondary + '40',
  },

  productImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    padding: 16,
    gap: 20,
  },
  titleSection: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deliveryInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  deliveryInfoContent: {
    flex: 1,
    gap: 2,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliverySubtitle: {
    fontSize: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partialStarContainer: {
    position: 'relative',
    width: 16,
    height: 16,
  },
  partialStarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    height: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  stockSection: {
    marginTop: 4,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  descriptionSection: {
    gap: 8,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  quantitySection: {
    gap: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.textSecondary + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  backButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  featuresSection: {
    gap: 12,
    paddingTop: 8,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  specificationsSection: {
    gap: 12,
    paddingTop: 8,
  },
  specContainer: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '10',
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  infoSection: {
    gap: 12,
    paddingTop: 8,
  },
  shippingInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  similarProductsSection: {
    marginTop: 24,
    marginBottom: 20,
    borderRadius: 0,
  },
  similarProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
  },
  similarProductsList: {
    paddingRight: 20,
    paddingLeft: 4,
  },
  similarProductCard: {
    width: SCREEN_WIDTH * 0.45,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  reviewsSection: {
    marginTop: 16,
    padding: 24,
    borderRadius: 24,
    gap: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewsSummary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  reviewsRating: {
    fontSize: 24,
    fontWeight: '700',
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewUserDetails: {
    flex: 1,
    gap: 4,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewStarsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
