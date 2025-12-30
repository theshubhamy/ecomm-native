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
  removeFromCart,
  updateQuantity,
  fetchCart,
  removeFromCartDB,
  updateQuantityDB,
} from '@/store/slices/cartSlice';
import { validatePromoCode, calculateDiscount } from '@/store/slices/offersSlice';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { CartItemSkeleton } from '@/components/SkeletonLoader';
import { router } from 'expo-router';

const MINIMUM_ORDER_AMOUNT = 10.0; // Minimum order amount in dollars

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
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

// Generate time slots for today and tomorrow
const generateTimeSlots = () => {
  const slots = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dates = [
    { date: today, label: 'Today' },
    { date: tomorrow, label: 'Tomorrow' },
  ];

  dates.forEach(({ date, label }) => {
    const hours = [10, 12, 14, 16, 18, 20];
    hours.forEach((hour) => {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      slots.push({
        id: `${date.toDateString()}-${hour}`,
        label: `${label}, ${hour}:00 - ${hour + 2}:00`,
        date: slotDate,
        available: true,
      });
    });
  });

  return slots;
};

export default function Cart() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { items, isLoading, total, error } = useAppSelector(
    state => state.cart,
  );
  const { user } = useAppSelector(state => state.auth);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const timeSlots = generateTimeSlots();
  const { activeOffers } = useAppSelector((state) => state.offers);

  useEffect(() => {
    // Fetch cart from DB if user is authenticated
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [user, dispatch]);

  const { selectedAddress, currentLocation } = useAppSelector(
    (state) => state.location
  );

  // Calculate delivery fee based on distance
  const calculateDeliveryFee = (): number => {
    // Free delivery for orders above threshold
    if (total >= FREE_DELIVERY_THRESHOLD) {
      return 0;
    }

    // If no address selected, return base fee
    if (!selectedAddress || (!selectedAddress.latitude || !selectedAddress.longitude)) {
      return isMinimumOrderMet ? BASE_DELIVERY_FEE : 0;
    }

    // Calculate distance if we have current location
    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedAddress.latitude!,
        selectedAddress.longitude!
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
  const finalTotal = subtotalAfterDiscount + deliveryFee;

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await dispatch(validatePromoCode(promoCode.toUpperCase()));
      if (validatePromoCode.fulfilled.match(result)) {
        setAppliedOffer(result.payload);
        setShowPromoInput(false);
        Alert.alert('Success', 'Promo code applied successfully!');
      } else {
        Alert.alert('Error', result.payload as string || 'Invalid promo code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate promo code');
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedOffer(null);
    setPromoCode('');
  };

  const handleRemoveItem = (productId: string | number) => {
    if (user?.id) {
      dispatch(removeFromCartDB({ userId: user.id, productId }));
    } else {
      dispatch(removeFromCart(productId));
    }
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
          <ThemedText type="subtitle">Cart</ThemedText>
          <ThemedPressable style={styles.dotsButton}>
            <IconSymbol
              name="ellipsis.fill"
              size={20}
              color={Colors[colorScheme].icon}
            />
          </ThemedPressable>
        </ThemedView>
      </HeaderView>

      <ScrollView>
        {isLoading ? (
          <ThemedView style={styles.cartItemsContainer}>
            {[1, 2, 3].map((i) => (
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
              {items.map(item => (
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
                    <ThemedText type="defaultSemiBold" numberOfLines={2}>
                      {item.product.name}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: Colors[colorScheme].textSecondary }}
                    >
                      ${item.product.price?.toFixed(2) || '0.00'}
                    </ThemedText>
                    <ThemedView style={styles.quantityContainer}>
                      <ThemedButton
                        onPress={() =>
                          handleUpdateQuantity(
                            item.product.id,
                            item.quantity - 1,
                          )
                        }
                        style={styles.quantityButton}
                        accessible={true}
                        accessibilityLabel={`Decrease quantity of ${item.product.name}`}
                        accessibilityRole="button"
                      >
                        <IconSymbol
                          name="minus"
                          size={16}
                          color={Colors[colorScheme].textPrimary}
                        />
                      </ThemedButton>
                      <ThemedText
                        type="defaultSemiBold"
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
                        style={styles.quantityButton}
                        accessible={true}
                        accessibilityLabel={`Increase quantity of ${item.product.name}`}
                        accessibilityRole="button"
                      >
                        <IconSymbol
                          name="plus"
                          size={16}
                          color={Colors[colorScheme].textPrimary}
                        />
                      </ThemedButton>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView style={styles.cartItemActions}>
                    <ThemedText type="defaultSemiBold" style={styles.itemTotal}>
                      ${((item.product.price || 0) * item.quantity).toFixed(2)}
                    </ThemedText>
                    <ThemedButton
                      onPress={() => handleRemoveItem(item.product.id)}
                      style={styles.removeButton}
                    >
                      <IconSymbol
                        name="trash.fill"
                        size={20}
                        color={Colors.error}
                      />
                    </ThemedButton>
                  </ThemedView>
                </ThemedView>
              ))}
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
                    Add ${minimumOrderShortfall.toFixed(2)} more to place order
                    (Minimum: ${MINIMUM_ORDER_AMOUNT.toFixed(2)})
                  </ThemedText>
                </ThemedView>
              )}

              {/* Delivery Time Slot Selection */}
              <ThemedView style={styles.deliverySection}>
                <ThemedView style={styles.sectionHeader}>
                  <ThemedText type="defaultSemiBold">Delivery Time</ThemedText>
                  <ThemedPressable
                    onPress={() => setShowTimeSlots(!showTimeSlots)}
                    style={styles.toggleButton}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: Colors.primary, marginRight: 4 }}
                    >
                      {selectedTimeSlot
                        ? timeSlots.find((s) => s.id === selectedTimeSlot)?.label
                        : 'Select Time'}
                    </ThemedText>
                    <IconSymbol
                      name={showTimeSlots ? 'chevron.down' : 'chevron.down'}
                      size={16}
                      color={Colors.primary}
                    />
                  </ThemedPressable>
                </ThemedView>

                {showTimeSlots && (
                  <ThemedView
                    style={[
                      styles.timeSlotsContainer,
                      { backgroundColor: Colors[colorScheme].background },
                    ]}
                  >
                    {timeSlots.map((slot) => (
                      <ThemedPressable
                        key={slot.id}
                        onPress={() => {
                          setSelectedTimeSlot(slot.id);
                          setShowTimeSlots(false);
                        }}
                        style={[
                          styles.timeSlotItem,
                          {
                            backgroundColor:
                              selectedTimeSlot === slot.id
                                ? Colors.primary + '20'
                                : Colors[colorScheme].backgroundPaper,
                            borderColor:
                              selectedTimeSlot === slot.id
                                ? Colors.primary
                                : Colors[colorScheme].textSecondary + '30',
                          },
                        ]}
                      >
                        <ThemedText
                          type="small"
                          style={{
                            color:
                              selectedTimeSlot === slot.id
                                ? Colors.primary
                                : Colors[colorScheme].textPrimary,
                            fontWeight:
                              selectedTimeSlot === slot.id ? '600' : '400',
                          }}
                        >
                          {slot.label}
                        </ThemedText>
                        {selectedTimeSlot === slot.id && (
                          <IconSymbol
                            name="checkmark.square.fill"
                            size={20}
                            color={Colors.primary}
                          />
                        )}
                      </ThemedPressable>
                    ))}
                  </ThemedView>
                )}
              </ThemedView>

              {/* Promo Code Section */}
              <ThemedView style={styles.promoSection}>
                {!appliedOffer ? (
                  <ThemedPressable
                    onPress={() => setShowPromoInput(!showPromoInput)}
                    style={styles.promoButton}
                  >
                    <IconSymbol
                      name="paperplane.fill"
                      size={16}
                      color={Colors.primary}
                    />
                    <ThemedText
                      type="small"
                      style={{ color: Colors.primary, marginLeft: 8 }}
                    >
                      {showPromoInput ? 'Hide' : 'Apply Promo Code'}
                    </ThemedText>
                  </ThemedPressable>
                ) : (
                  <ThemedView style={styles.appliedPromo}>
                    <ThemedView style={styles.appliedPromoInfo}>
                      <IconSymbol
                        name="checkmark.square.fill"
                        size={16}
                        color={Colors.success}
                      />
                      <ThemedText
                        type="small"
                        style={{ color: Colors.success, marginLeft: 8 }}
                      >
                        {appliedOffer.promo_code} Applied
                      </ThemedText>
                    </ThemedView>
                    <ThemedPressable
                      onPress={handleRemovePromoCode}
                      style={styles.removePromoButton}
                    >
                      <ThemedText
                        type="xsmall"
                        style={{ color: Colors.error }}
                      >
                        Remove
                      </ThemedText>
                    </ThemedPressable>
                  </ThemedView>
                )}

                {showPromoInput && !appliedOffer && (
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
                )}
              </ThemedView>

              {/* Order Summary */}
              <ThemedView style={styles.summaryRow}>
                <ThemedText type="subtitle">Subtotal</ThemedText>
                <ThemedText type="subtitle">${total.toFixed(2)}</ThemedText>
              </ThemedView>
              {discountAmount > 0 && (
                <ThemedView style={styles.summaryRow}>
                  <ThemedText
                    type="small"
                    style={{ color: Colors.success }}
                  >
                    Discount ({appliedOffer?.promo_code})
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: Colors.success }}
                  >
                    -${discountAmount.toFixed(2)}
                  </ThemedText>
                </ThemedView>
              )}
              <ThemedView style={styles.summaryRow}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ThemedText
                    type="small"
                    style={{ color: Colors[colorScheme].textSecondary }}
                  >
                    Delivery Fee
                  </ThemedText>
                  {total >= FREE_DELIVERY_THRESHOLD && (
                    <ThemedView
                      style={[
                        styles.freeDeliveryBadge,
                        { backgroundColor: Colors.success + '20' },
                      ]}
                    >
                      <ThemedText
                        type="xsmall"
                        style={{ color: Colors.success, fontWeight: '600' }}
                      >
                        FREE
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
                <ThemedText
                  type="small"
                  style={{
                    color:
                      deliveryFee === 0
                        ? Colors.success
                        : Colors[colorScheme].textSecondary,
                    textDecorationLine: deliveryFee === 0 ? 'line-through' : 'none',
                  }}
                >
                  {deliveryFee === 0 ? (
                    <ThemedText
                      type="small"
                      style={{ color: Colors.success, textDecorationLine: 'none' }}
                    >
                      FREE
                    </ThemedText>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </ThemedText>
              </ThemedView>
              <ThemedView style={[styles.summaryRow, styles.totalRow]}>
                <ThemedText type="subtitle">Total</ThemedText>
                <ThemedText type="subtitle" style={{ color: Colors.primary }}>
                  ${finalTotal.toFixed(2)}
                </ThemedText>
              </ThemedView>

              {/* Checkout Button */}
              <ThemedButton
                style={[
                  styles.checkoutButton,
                  {
                    backgroundColor: Colors.primary,
                    opacity:
                      isMinimumOrderMet && selectedTimeSlot ? 1 : 0.5,
                  },
                ]}
                disabled={!isMinimumOrderMet || !selectedTimeSlot}
                onPress={() => {
                  if (!isMinimumOrderMet) {
                    Alert.alert(
                      'Minimum Order Required',
                      `Please add $${minimumOrderShortfall.toFixed(
                        2
                      )} more to place your order.`
                    );
                    return;
                  }
                  if (!selectedTimeSlot) {
                    Alert.alert(
                      'Select Delivery Time',
                      'Please select a delivery time slot to proceed.'
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
  cartItemsContainer: {
    padding: 16,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
    gap: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
  },
  cartItemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemTotal: {
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  minimumOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  deliverySection: {
    marginBottom: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  timeSlotsContainer: {
    marginTop: 8,
    gap: 8,
    maxHeight: 200,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '20',
  },
  promoSection: {
    marginBottom: 16,
    gap: 8,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    backgroundColor: Colors.primary + '10',
  },
  appliedPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  removePromoButton: {
    padding: 4,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  promoInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  applyPromoButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  freeDeliveryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
});
