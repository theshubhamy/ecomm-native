import ScrollView from '@/components/ScrollView';
import { ThemedPressable } from '@/components/ThemedPressable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateQuantity,
  fetchCart,
  updateQuantityDB,
} from '@/store/slices/cartSlice';
import {
  validatePromoCode,
  calculateDiscount,
} from '@/store/slices/offersSlice';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Alert, TextInput } from 'react-native';
import { CartItemSkeleton } from '@/components/SkeletonLoader';
import { router } from 'expo-router';

const MINIMUM_ORDER_AMOUNT = 500; // Minimum order amount in INR
const FREE_DELIVERY_THRESHOLD = 1000; // Free delivery for orders above ₹1000
const BASE_DELIVERY_FEE = 50; // Base delivery fee in INR
const BASE_DELIVERY_DISTANCE_KM = 5; // Base delivery distance in km
const DELIVERY_FEE_PER_KM = 10; // Additional fee per km beyond base distance

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export default function Cart() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { items, isLoading, total, error } = useAppSelector(
    state => state.cart,
  );
  const { user } = useAppSelector(state => state.auth);
  const [promoCode, setPromoCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  useEffect(() => {
    // Fetch cart from DB if user is authenticated
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [user, dispatch]);

  const { selectedAddress, currentLocation } = useAppSelector(
    state => state.location,
  );

  // Calculate delivery fee based on distance
  const calculateDeliveryFee = (): number => {
    // Free delivery for orders above threshold
    if (total >= FREE_DELIVERY_THRESHOLD) {
      return 0;
    }

    // If no address selected, return base fee
    if (
      !selectedAddress ||
      !selectedAddress.latitude ||
      !selectedAddress.longitude
    ) {
      return isMinimumOrderMet ? BASE_DELIVERY_FEE : 0;
    }

    // Calculate distance if we have current location
    if (
      currentLocation &&
      currentLocation.latitude &&
      currentLocation.longitude
    ) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedAddress.latitude!,
        selectedAddress.longitude!,
      );

      if (distance <= BASE_DELIVERY_DISTANCE_KM) {
        return BASE_DELIVERY_FEE;
      }

      // Additional fee for distance beyond base
      const extraDistance = distance - BASE_DELIVERY_DISTANCE_KM;
      const additionalFee = extraDistance * DELIVERY_FEE_PER_KM;
      return BASE_DELIVERY_FEE + additionalFee;
    }

    // Fallback to base fee
    return isMinimumOrderMet ? BASE_DELIVERY_FEE : 0;
  };

  const isMinimumOrderMet = total >= MINIMUM_ORDER_AMOUNT;
  const minimumOrderShortfall = MINIMUM_ORDER_AMOUNT - total;
  const discountAmount = appliedOffer
    ? calculateDiscount(appliedOffer, total)
    : 0;
  const subtotalAfterDiscount = total - discountAmount;
  const deliveryFee = calculateDeliveryFee();
  const handlingCharge = 2; // Fixed handling charge
  const finalTotal = subtotalAfterDiscount + deliveryFee + handlingCharge;

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await dispatch(validatePromoCode(promoCode.toUpperCase()));
      if (validatePromoCode.fulfilled.match(result)) {
        setAppliedOffer(result.payload);
        setShowPromoInput(false);
        Alert.alert('Success', 'Promo code applied successfully!');
      } else {
        Alert.alert(
          'Error',
          (result.payload as string) || 'Invalid promo code',
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to validate promo code');
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedOffer(null);
    setPromoCode('');
  };

  const handleUpdateQuantity = (
    productId: string | number,
    quantity: number,
  ) => {
    if (user?.id) {
      dispatch(updateQuantityDB({ userId: user.id, productId, quantity }));
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };
  return (
    <ThemedView
      style={{
        ...styles.container,
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <HeaderView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Checkout</ThemedText>
        </ThemedView>
      </HeaderView>

      <ScrollView>
        {/* Delivery Info Banner */}

        {isLoading ? (
          <ThemedView style={styles.cartItemsContainer}>
            {[1, 2, 3].map(i => (
              <CartItemSkeleton key={i} />
            ))}
          </ThemedView>
        ) : error ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText type="subtitle" style={{ color: Colors.error }}>
              Error loading cart
            </ThemedText>
            <ThemedText type="small" style={{ marginTop: 8 }}>
              {error}
            </ThemedText>
          </ThemedView>
        ) : items.length === 0 ? (
          <>
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="subtitle">Your cart is empty</ThemedText>
              <ThemedText
                type="small"
                style={{ marginTop: 10, textAlign: 'center' }}
              >
                Start shopping now!
              </ThemedText>
            </ThemedView>
          </>
        ) : (
          <>
            <ThemedView style={styles.cartItemsContainer}>
              {items.length > 0 && (
                <ThemedView style={[styles.deliveryBanner]}>
                  <ThemedView>
                    <IconSymbol
                      name="clock.fill"
                      size={28}
                      color={Colors.primary}
                    />
                  </ThemedView>
                  <ThemedView>
                    <ThemedText type="defaultSemiBold">
                      Delivery in 15 minutes 🚀
                    </ThemedText>
                    <ThemedText
                      type="xsmall"
                      style={{ color: Colors[colorScheme].textSecondary }}
                    >
                      Shipment of {items.length}
                      {items.length === 1 ? ' item' : ' items'}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}
              {items.map(item => {
                const itemPrice = item.product.price || 0;
                const originalPrice =
                  (item.product as any).originalPrice || itemPrice;
                const hasDiscount = originalPrice > itemPrice;
                const itemTotal = itemPrice * item.quantity;
                const originalTotal = originalPrice * item.quantity;

                return (
                  <ThemedView
                    key={item.product.id}
                    style={[
                      styles.cartItem,
                      { backgroundColor: Colors[colorScheme].backgroundPaper },
                    ]}
                  >
                    <Image
                      source={
                        item.product.imageUrl
                          ? { uri: item.product.imageUrl }
                          : require('../../assets/images/icon.png')
                      }
                      style={styles.cartItemImage}
                      contentFit="cover"
                    />
                    <ThemedView style={styles.cartItemDetails}>
                      <ThemedText
                        type="small"
                        numberOfLines={2}
                        style={styles.cartItemName}
                      >
                        {item.product.name}
                      </ThemedText>
                      {(item.product as any).weight && (
                        <ThemedText
                          type="xsmall"
                          style={{
                            color: Colors[colorScheme].textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {(item.product as any).weight}
                        </ThemedText>
                      )}
                      <ThemedView style={styles.quantityContainer}>
                        <ThemedButton
                          onPress={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity - 1,
                            )
                          }
                          style={[
                            styles.quantityButton,
                            { backgroundColor: Colors.primary },
                          ]}
                          accessible={true}
                          accessibilityLabel={`Decrease quantity of ${item.product.name}`}
                          accessibilityRole="button"
                        >
                          <IconSymbol
                            name="minus"
                            size={12}
                            color={Colors.black}
                          />
                        </ThemedButton>
                        <ThemedText
                          type="small"
                          style={styles.quantityText}
                          accessible={true}
                          accessibilityRole="text"
                          accessibilityLabel={`Quantity: ${item.quantity}`}
                        >
                          {item.quantity}
                        </ThemedText>
                        <ThemedButton
                          onPress={() =>
                            handleUpdateQuantity(
                              item.product.id,
                              item.quantity + 1,
                            )
                          }
                          style={[
                            styles.quantityButton,
                            { backgroundColor: Colors.primary },
                          ]}
                          accessible={true}
                          accessibilityLabel={`Increase quantity of ${item.product.name}`}
                          accessibilityRole="button"
                        >
                          <IconSymbol
                            name="plus"
                            size={12}
                            color={Colors.black}
                          />
                        </ThemedButton>
                      </ThemedView>
                    </ThemedView>
                    <ThemedView style={styles.cartItemActions}>
                      {hasDiscount && (
                        <ThemedText
                          type="xsmall"
                          style={[
                            styles.originalPrice,
                            { color: Colors[colorScheme].textPrimary },
                            { textDecorationLine: 'line-through' },
                          ]}
                        >
                          ₹{originalTotal.toFixed(0)}
                        </ThemedText>
                      )}
                      <ThemedText>₹{itemTotal.toFixed(0)}</ThemedText>
                    </ThemedView>
                  </ThemedView>
                );
              })}
            </ThemedView>
            <ThemedView
              style={[
                styles.summaryContainer,
                { borderTopColor: Colors[colorScheme].textSecondary + '20' },
              ]}
            >
              {/* Minimum Order Validation */}
              {!isMinimumOrderMet && (
                <ThemedView
                  style={[
                    styles.minimumOrderBanner,
                    { backgroundColor: Colors.warning + '20' },
                  ]}
                >
                  <IconSymbol
                    name="notification.fill"
                    size={20}
                    color={Colors.warning}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: Colors.warning, marginLeft: 8, flex: 1 }}
                  >
                    Add ₹{minimumOrderShortfall.toFixed(0)} more to place order
                    (Minimum: ₹{MINIMUM_ORDER_AMOUNT.toFixed(0)})
                  </ThemedText>
                </ThemedView>
              )}

              {/* Use Coupons Section */}
              <ThemedPressable
                style={[
                  styles.sectionCard,
                  { backgroundColor: Colors[colorScheme].backgroundPaper },
                ]}
                onPress={() => setShowPromoInput(!showPromoInput)}
              >
                <ThemedView style={styles.sectionCardContent}>
                  <ThemedView style={styles.sectionCardLeft}>
                    <ThemedView
                      style={[
                        styles.sectionIcon,
                        { backgroundColor: Colors.primary + '15' },
                      ]}
                    >
                      <IconSymbol
                        name="tag.fill"
                        size={18}
                        color={Colors.primary}
                      />
                    </ThemedView>
                    <ThemedText type="defaultSemiBold">Use Coupons</ThemedText>
                  </ThemedView>
                  <IconSymbol
                    name="chevron.right"
                    size={18}
                    color={Colors[colorScheme].textSecondary}
                  />
                </ThemedView>
              </ThemedPressable>

              {showPromoInput && !appliedOffer && (
                <ThemedView
                  style={[
                    styles.promoInputCard,
                    { backgroundColor: Colors[colorScheme].backgroundPaper },
                  ]}
                >
                  <ThemedView style={styles.promoInputContainer}>
                    <TextInput
                      style={[
                        styles.promoInput,
                        {
                          backgroundColor: Colors[colorScheme].background,
                          borderColor: Colors.primary,
                          color: Colors[colorScheme].textPrimary,
                        },
                      ]}
                      value={promoCode}
                      onChangeText={setPromoCode}
                      placeholder="Enter promo code"
                      placeholderTextColor={Colors[colorScheme].textSecondary}
                      autoCapitalize="characters"
                    />
                    <ThemedButton
                      onPress={handleApplyPromoCode}
                      style={[
                        styles.applyPromoButton,
                        { backgroundColor: Colors.primary },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{ color: Colors.black, fontWeight: '600' }}
                      >
                        Apply
                      </ThemedText>
                    </ThemedButton>
                  </ThemedView>
                </ThemedView>
              )}

              {appliedOffer && (
                <ThemedView
                  style={[
                    styles.appliedPromoCard,
                    { backgroundColor: Colors.success + '15' },
                  ]}
                >
                  <ThemedView style={styles.appliedPromoInfo}>
                    <IconSymbol
                      name="checkmark.square.fill"
                      size={18}
                      color={Colors.success}
                    />
                    <ThemedText
                      type="small"
                      style={{
                        color: Colors.success,
                        marginLeft: 8,
                        fontWeight: '600',
                      }}
                    >
                      {appliedOffer.promo_code} Applied
                    </ThemedText>
                  </ThemedView>
                  <ThemedPressable
                    onPress={handleRemovePromoCode}
                    style={styles.removePromoButton}
                  >
                    <ThemedText type="xsmall" style={{ color: Colors.error }}>
                      Remove
                    </ThemedText>
                  </ThemedPressable>
                </ThemedView>
              )}

              {/* Bill Details Section */}
              <ThemedView
                style={[
                  styles.billDetailsCard,
                  { backgroundColor: Colors[colorScheme].backgroundPaper },
                ]}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.billDetailsTitle}
                >
                  Bill details
                </ThemedText>

                <ThemedView style={styles.billDetailRow}>
                  <ThemedView style={styles.billDetailLeft}>
                    <ThemedText
                      type="small"
                      style={{ color: Colors[colorScheme].textSecondary }}
                    >
                      Items total
                    </ThemedText>
                    {discountAmount > 0 && (
                      <ThemedText
                        type="xsmall"
                        style={{ color: Colors.success, marginLeft: 8 }}
                      >
                        Saved ₹{discountAmount.toFixed(0)}
                      </ThemedText>
                    )}
                  </ThemedView>
                  <ThemedView style={styles.billDetailRight}>
                    {discountAmount > 0 && (
                      <ThemedText
                        type="xsmall"
                        style={[
                          styles.strikethroughPrice,
                          { color: Colors[colorScheme].textSecondary },
                        ]}
                      >
                        ₹{total.toFixed(0)}
                      </ThemedText>
                    )}
                    <ThemedText
                      type="small"
                      style={{ color: Colors[colorScheme].textPrimary }}
                    >
                      ₹{subtotalAfterDiscount.toFixed(0)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.billDetailRow}>
                  <ThemedText
                    type="small"
                    style={{ color: Colors[colorScheme].textSecondary }}
                  >
                    Delivery charge
                  </ThemedText>
                  <ThemedView style={styles.billDetailRight}>
                    {deliveryFee === 0 ? (
                      <>
                        <ThemedText
                          type="xsmall"
                          style={[
                            styles.strikethroughPrice,
                            { color: Colors[colorScheme].textSecondary },
                          ]}
                        >
                          ₹{BASE_DELIVERY_FEE}
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={{ color: Colors.success, fontWeight: '600' }}
                        >
                          FREE
                        </ThemedText>
                      </>
                    ) : (
                      <ThemedText
                        type="small"
                        style={{ color: Colors[colorScheme].textPrimary }}
                      >
                        ₹{deliveryFee.toFixed(0)}
                      </ThemedText>
                    )}
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.billDetailRow}>
                  <ThemedText
                    type="small"
                    style={{ color: Colors[colorScheme].textSecondary }}
                  >
                    Handling charge
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: Colors[colorScheme].textPrimary }}
                  >
                    ₹2
                  </ThemedText>
                </ThemedView>

                <ThemedView
                  style={[styles.billDetailRow, styles.grandTotalRow]}
                >
                  <ThemedText type="defaultSemiBold">Grand total</ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: Colors.primary }}
                  >
                    ₹{(finalTotal + 2).toFixed(0)}
                  </ThemedText>
                </ThemedView>

                {discountAmount > 0 && (
                  <ThemedView style={styles.savingsRow}>
                    <ThemedView style={styles.savingsDivider} />
                    <ThemedView style={styles.savingsContent}>
                      <ThemedText
                        type="small"
                        style={{ color: Colors.success, fontWeight: '600' }}
                      >
                        Your total savings
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={{ color: Colors.success, fontWeight: '600' }}
                      >
                        ₹{discountAmount.toFixed(0)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Add GSTIN Section */}
              <ThemedPressable
                style={[
                  styles.sectionCard,
                  { backgroundColor: Colors[colorScheme].backgroundPaper },
                ]}
              >
                <ThemedView style={styles.sectionCardContent}>
                  <ThemedView style={styles.sectionCardLeft}>
                    <ThemedView
                      style={[
                        styles.sectionIcon,
                        { backgroundColor: Colors.primary + '15' },
                      ]}
                    >
                      <IconSymbol
                        name="tag.fill"
                        size={18}
                        color={Colors.primary}
                      />
                    </ThemedView>
                    <ThemedView style={styles.sectionCardText}>
                      <ThemedText type="defaultSemiBold">Add GSTIN</ThemedText>
                      <ThemedText
                        type="xsmall"
                        style={{
                          color: Colors[colorScheme].textSecondary,
                          marginTop: 2,
                        }}
                      >
                        Claim GST input credit up to 18% on your order
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  <IconSymbol
                    name="chevron.right"
                    size={18}
                    color={Colors[colorScheme].textSecondary}
                  />
                </ThemedView>
              </ThemedPressable>

              {/* Cancellation Policy Section */}
              <ThemedPressable
                style={[
                  styles.sectionCard,
                  { backgroundColor: Colors[colorScheme].backgroundPaper },
                ]}
              >
                <ThemedView style={styles.sectionCardContent}>
                  <ThemedText type="defaultSemiBold">
                    Cancellation Policy
                  </ThemedText>
                  <IconSymbol
                    name="chevron.right"
                    size={18}
                    color={Colors[colorScheme].textSecondary}
                  />
                </ThemedView>
              </ThemedPressable>

              {/* Checkout Button */}
              <ThemedButton
                style={[
                  styles.checkoutButton,
                  {
                    backgroundColor: Colors.primary,
                    opacity: isMinimumOrderMet ? 1 : 0.5,
                  },
                ]}
                disabled={!isMinimumOrderMet}
                onPress={() => {
                  if (!isMinimumOrderMet) {
                    Alert.alert(
                      'Minimum Order Required',
                      `Please add ₹${minimumOrderShortfall.toFixed(
                        0,
                      )} more to place your order.`,
                    );
                    return;
                  }
                  router.push({
                    pathname: '/checkout',
                    params: {
                      discountAmount: discountAmount.toString(),
                      appliedOfferId: appliedOffer?.id || '',
                    },
                  });
                }}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: Colors.black }}
                >
                  Proceed to Checkout
                </ThemedText>
              </ThemedButton>
            </ThemedView>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dotsButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    borderBottomWidth: 0.5,
    paddingBottom: 14,
    borderBottomColor: Colors.light.textSecondary + '20',
  },
  shipmentInfo: {
    paddingVertical: 10,
    marginBottom: 4,
    flex: 1,
    backgroundColor: 'transparent',
  },
  cartItemsContainer: {
    paddingHorizontal: 16,
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cartItemDetails: {
    flex: 1,
    gap: 6,
    paddingRight: 8,
  },
  cartItemName: {
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 6,
    paddingTop: 2,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    fontSize: 13,
    marginBottom: 2,
  },

  summaryContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    borderTopWidth: 1,
    gap: 20,
  },
  minimumOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sectionCardText: {
    flex: 1,
  },
  promoInputCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  applyPromoButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  appliedPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  removePromoButton: {
    padding: 4,
  },
  billDetailsCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  billDetailsTitle: {
    marginBottom: 20,
    fontSize: 17,
  },
  billDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  billDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billDetailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    fontSize: 13,
  },
  grandTotalRow: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '20',
    marginBottom: 0,
  },
  savingsRow: {
    marginTop: 16,
    paddingTop: 16,
  },
  savingsDivider: {
    height: 1,
    backgroundColor: Colors.light.textSecondary + '20',
    marginBottom: 12,
  },
  savingsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
