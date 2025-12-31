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
import { calculateDiscount } from '@/store/slices/offersSlice';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
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
  const { activeOffers } = useAppSelector(state => state.offers);
  const [appliedOffer, setAppliedOffer] = useState<any>(null);

  useEffect(() => {
    // Fetch cart from DB if user is authenticated
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [user, dispatch]);

  // Check for applied offer from active offers (when returning from coupons page)
  useEffect(() => {
    if (activeOffers.length > 0) {
      // Find the most recently validated offer (usually the last one)
      const validatedOffer = activeOffers[activeOffers.length - 1];
      if (
        validatedOffer &&
        validatedOffer.promo_code &&
        validatedOffer.is_active
      ) {
        // Only update if it's different from current applied offer
        if (!appliedOffer || appliedOffer.id !== validatedOffer.id) {
          setAppliedOffer(validatedOffer);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOffers]);

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

  const handleRemovePromoCode = () => {
    setAppliedOffer(null);
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
        <ThemedView
          style={[
            styles.bodyContainer,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
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
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="subtitle">Your cart is empty</ThemedText>
              <ThemedText
                type="small"
                style={{ marginTop: 10, textAlign: 'center' }}
              >
                Start shopping now!
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              {/* Cart Items */}
              {items.length > 0 && (
                <ThemedView
                  style={[
                    styles.deliveryBanner,
                    {
                      backgroundColor: Colors[colorScheme].backgroundPaper,
                    },
                  ]}
                >
                  <ThemedView style={styles.deliveryBannerBody}>
                    <ThemedView style={styles.deliveryBannerIcon}>
                      <IconSymbol
                        name="clock.fill"
                        size={24}
                        color={Colors.primary}
                      />
                    </ThemedView>
                    <ThemedView style={styles.deliveryBannerContent}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.deliveryTitle}
                      >
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
                    style={styles.cartItemsContainer}
                  >
                    <ThemedView style={[styles.cartItem]}>
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
                        <ThemedView style={styles.cartItemInfo}>
                          <ThemedText type="small" numberOfLines={2}>
                            {item.product.name}
                          </ThemedText>
                          {(item.product as any).weight && (
                            <ThemedText
                              type="xsmall"
                              style={styles.cartItemWeight}
                            >
                              {(item.product as any).weight}
                            </ThemedText>
                          )}
                        </ThemedView>
                      </ThemedView>
                      <ThemedView style={styles.cartItemActions}>
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
                              size={14}
                              color={Colors.black}
                            />
                          </ThemedButton>
                          <ThemedText
                            type="small"
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
                              size={14}
                              color={Colors.black}
                            />
                          </ThemedButton>
                        </ThemedView>
                        {hasDiscount && (
                          <ThemedText
                            type="xsmall"
                            style={[
                              styles.originalPrice,
                              { color: Colors[colorScheme].textSecondary },
                            ]}
                          >
                            ₹{originalTotal.toFixed(0)}
                          </ThemedText>
                        )}
                        <ThemedText type="small">
                          ₹{itemTotal.toFixed(0)}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                );
              })}

              {/* Summary Section */}
              <ThemedView style={styles.summaryContainer}>
                {/* Minimum Order Validation */}
                {!isMinimumOrderMet && (
                  <ThemedView
                    style={[
                      styles.minimumOrderBanner,
                      { backgroundColor: Colors.warning + '15' },
                    ]}
                  >
                    <IconSymbol
                      name="notification.fill"
                      size={20}
                      color={Colors.warning}
                    />
                    <ThemedText type="small" style={styles.minimumOrderText}>
                      Add ₹{minimumOrderShortfall.toFixed(0)} more to place
                      order (Minimum: ₹{MINIMUM_ORDER_AMOUNT.toFixed(0)})
                    </ThemedText>
                  </ThemedView>
                )}

                {/* Use Coupons Section */}
                <ThemedView
                  style={[
                    styles.sectionCard,
                    {
                      backgroundColor: Colors[colorScheme].backgroundPaper,
                    },
                  ]}
                >
                  <ThemedPressable
                    onPress={() => router.push('/coupons')}
                    style={styles.sectionCardContent}
                  >
                    <ThemedView style={styles.sectionCardLeft}>
                      <ThemedView
                        style={[
                          styles.sectionIcon,
                          {
                            backgroundColor: appliedOffer
                              ? Colors.success + '20'
                              : Colors.primary + '15',
                          },
                        ]}
                      >
                        <IconSymbol
                          name={
                            appliedOffer ? 'checkmark.square.fill' : 'tag.fill'
                          }
                          size={18}
                          color={appliedOffer ? Colors.success : Colors.primary}
                        />
                      </ThemedView>
                      <ThemedView style={styles.sectionCardText}>
                        <ThemedText type="xsmall">
                          {appliedOffer ? 'Coupon Applied' : 'Use Coupons'}
                        </ThemedText>
                        {appliedOffer && (
                          <ThemedView style={styles.appliedCouponInfo}>
                            <ThemedText
                              type="small"
                              style={styles.appliedCouponText}
                            >
                              {appliedOffer.promo_code}
                            </ThemedText>
                          </ThemedView>
                        )}
                      </ThemedView>
                    </ThemedView>
                    <ThemedView style={styles.sectionCardRight}>
                      {appliedOffer && (
                        <ThemedPressable
                          onPress={e => {
                            e.stopPropagation();
                            handleRemovePromoCode();
                          }}
                          style={styles.removeCouponButton}
                        >
                          <ThemedText
                            type="xsmall"
                            style={{ color: Colors.error, fontWeight: '600' }}
                          >
                            Remove
                          </ThemedText>
                        </ThemedPressable>
                      )}
                      <IconSymbol
                        name="chevron.right"
                        size={18}
                        color={Colors[colorScheme].textSecondary}
                      />
                    </ThemedView>
                  </ThemedPressable>
                </ThemedView>

                {/* Bill Details Section */}
                <ThemedView style={styles.billDetailsCard}>
                  <ThemedText type="defaultSemiBold">Bill details</ThemedText>

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
                  <ThemedView style={styles.savingsRow} />
                  <ThemedView style={styles.billDetailRow}>
                    <ThemedText type="defaultSemiBold">Grand total</ThemedText>
                    <ThemedText type="defaultSemiBold">
                      ₹{finalTotal.toFixed(0)}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.savingsRow} />

                  {discountAmount > 0 && (
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
                  )}
                </ThemedView>

                {/* Add GSTIN Section */}
                <ThemedPressable style={styles.sectionCard}>
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
                        <ThemedText type="defaultSemiBold">
                          Add GSTIN
                        </ThemedText>
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
                <ThemedPressable style={styles.sectionCard}>
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
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 10,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
    padding: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 400,
  },
  deliveryBanner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '25',
  },
  deliveryBannerBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  deliveryBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  deliveryBannerContent: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  cartItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '15',
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartItemInfo: {
    flex: 1,
  },

  cartItemWeight: {
    color: Colors.light.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    gap: 4,
    justifyContent: 'center',
  },
  quantityButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 6,
    paddingTop: 2,
    minWidth: 70,
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  summaryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 20,
  },
  minimumOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  minimumOrderText: {
    color: Colors.warning,
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  sectionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionCardText: {
    flex: 1,
  },
  sectionCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appliedCouponInfo: {
    marginTop: 4,
  },
  appliedCouponText: {
    color: Colors.success,
  },
  removeCouponButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.error + '15',
  },
  promoInputCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 15,
  },
  applyPromoButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 90,
  },
  appliedPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedPromoDetails: {
    flex: 1,
  },
  removePromoButton: {
    padding: 8,
  },
  billDetailsCard: {
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },

  billDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  billDetailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
  },

  savingsRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '25',
  },

  savingsContent: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
