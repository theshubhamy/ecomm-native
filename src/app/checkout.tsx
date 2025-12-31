import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
import { fetchSavedAddresses } from '@/store/slices/locationSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { fetchOrderById } from '@/store/slices/ordersSlice';
import {
  createPaymentIntent,
  processPayment,
  PaymentMethod,
} from '@/store/slices/paymentSlice';
import { supabase } from '@/utils/supabase';

const FREE_DELIVERY_THRESHOLD = 1000; // Free delivery for orders above ₹1000
const BASE_DELIVERY_FEE = 50; // Base delivery fee in INR
const HANDLING_CHARGE = 2; // Fixed handling charge

export default function Checkout() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    discountAmount?: string;
    appliedOfferId?: string;
  }>();
  const { items, total } = useAppSelector(state => state.cart);
  const { user } = useAppSelector(state => state.auth);
  const { selectedAddress } = useAppSelector(state => state.location);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSavedAddresses(user.id));
    }
  }, [user, dispatch]);

  // Calculate discount from params
  const discountAmount = params.discountAmount
    ? parseFloat(params.discountAmount)
    : 0;
  const subtotalAfterDiscount = total - discountAmount;

  // Calculate delivery fee (same logic as cart)
  const deliveryFee =
    subtotalAfterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_FEE;
  const finalTotal = subtotalAfterDiscount + deliveryFee + HANDLING_CHARGE;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    setIsPlacingOrder(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      // Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'confirmed',
          total_amount: finalTotal,
          subtotal: total,
          discount_amount: discountAmount,
          delivery_fee: deliveryFee,
          handling_charge: HANDLING_CHARGE,
          payment_method: selectedPaymentMethod,
          payment_status: 'pending',
          delivery_address: selectedAddress,
          applied_offer_id: params.appliedOfferId || null,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.imageUrl,
        quantity: item.quantity,
        price: item.product.price || 0,
        total: (item.product.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Process payment
      if (selectedPaymentMethod === 'cash') {
        // Cash on delivery - mark payment as succeeded
        await dispatch(
          createPaymentIntent({
            orderId: orderData.id,
            amount: finalTotal,
            paymentMethod: selectedPaymentMethod,
            userEmail: user?.email,
            userName:
              (user as any)?.user_metadata?.display_name ||
              user?.email?.split('@')[0] ||
              'Customer',
          }),
        );
      } else {
        // Online payment - create payment intent and process with Razorpay
        const paymentResult = await dispatch(
          createPaymentIntent({
            orderId: orderData.id,
            amount: finalTotal,
            paymentMethod: selectedPaymentMethod,
            userEmail: user?.email,
            userName:
              (user as any)?.user_metadata?.display_name ||
              user?.email?.split('@')[0] ||
              'Customer',
            userPhone: selectedAddress.contactPhone,
          }),
        );

        if (createPaymentIntent.fulfilled.match(paymentResult)) {
          const paymentIntent = paymentResult.payload as any;

          // Process payment with Razorpay
          const processResult = await dispatch(
            processPayment({
              paymentIntentId: paymentIntent.id,
              razorpayOrderId: paymentIntent.razorpay_order_id,
              razorpayKeyId: paymentIntent.razorpay_key_id,
              userEmail: paymentIntent.user_email,
              userName: paymentIntent.user_name,
              userPhone: paymentIntent.user_phone,
              orderDescription: `Order #${orderNumber}`,
            }),
          );

          if (processPayment.rejected.match(processResult)) {
            throw new Error(
              (processResult.payload as string) || 'Payment failed',
            );
          }
        } else {
          throw new Error(
            (paymentResult.payload as string) || 'Payment failed',
          );
        }
      }

      // Clear cart after successful order
      dispatch(clearCart());

      // Fetch the complete order details and set it in Redux
      if (user?.id) {
        await dispatch(
          fetchOrderById({ userId: user.id, orderId: orderData.id }),
        );
      }

      // Navigate to order details page
      router.replace(`/order/${orderData.id}`);
    } catch (error) {
      Alert.alert(
        'Order Failed',
        error instanceof Error ? error.message : 'Failed to place order',
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
          <ThemedText type="subtitle">Checkout</ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>
      </HeaderView>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold">Delivery Address</ThemedText>
            {selectedAddress && (
              <ThemedPressable
                onPress={() => router.push('/address-selection')}
                style={styles.changeButton}
              >
                <ThemedText
                  type="small"
                  style={{ color: Colors.primary, fontWeight: '600' }}
                >
                  Change
                </ThemedText>
              </ThemedPressable>
            )}
          </ThemedView>

          {selectedAddress ? (
            <ThemedView style={styles.addressCard}>
              <ThemedView style={styles.addressHeader}>
                <ThemedView style={styles.addressLabelRow}>
                  <IconSymbol
                    name={
                      selectedAddress.type === 'home'
                        ? 'house.fill'
                        : selectedAddress.type === 'work'
                        ? 'tag.fill'
                        : 'location.fill'
                    }
                    size={18}
                    color={Colors.primary}
                  />
                  <ThemedText type="defaultSemiBold">
                    {selectedAddress.label ||
                      selectedAddress.type.charAt(0).toUpperCase() +
                        selectedAddress.type.slice(1)}
                  </ThemedText>
                  {selectedAddress.isDefault && (
                    <ThemedView
                      style={[
                        styles.defaultBadge,
                        { backgroundColor: Colors.primary + '20' },
                      ]}
                    >
                      <ThemedText
                        type="xsmall"
                        style={{ color: Colors.primary, fontWeight: '600' }}
                      >
                        Default
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>
              <ThemedText
                type="small"
                style={{
                  color: Colors[colorScheme].textPrimary,
                  marginTop: 6,
                  lineHeight: 18,
                }}
              >
                {selectedAddress.addressLine1}
                {selectedAddress.addressLine2 &&
                  `, ${selectedAddress.addressLine2}`}
              </ThemedText>
              <ThemedText
                type="xsmall"
                style={{
                  color: Colors[colorScheme].textSecondary,
                  marginTop: 3,
                }}
              >
                {selectedAddress.city}, {selectedAddress.state}{' '}
                {selectedAddress.pincode}
              </ThemedText>
              {selectedAddress.contactPhone && (
                <ThemedText
                  type="xsmall"
                  style={{
                    color: Colors[colorScheme].textSecondary,
                    marginTop: 4,
                  }}
                >
                  📞 {selectedAddress.contactPhone}
                </ThemedText>
              )}
            </ThemedView>
          ) : (
            <ThemedView
              style={[
                styles.emptyAddress,
                {
                  backgroundColor: Colors[colorScheme].background,
                  borderColor: Colors[colorScheme].textSecondary + '20',
                },
              ]}
            >
              <IconSymbol
                name="location.fill"
                size={36}
                color={Colors[colorScheme].textSecondary + '60'}
              />
              <ThemedText
                type="small"
                style={{
                  color: Colors[colorScheme].textPrimary,
                  marginTop: 12,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                No address selected
              </ThemedText>
              <ThemedText
                type="xsmall"
                style={{
                  color: Colors[colorScheme].textSecondary,
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                Please add a delivery address
              </ThemedText>
              <ThemedPressable
                onPress={() => router.push('/address-selection')}
                style={[
                  styles.addAddressButton,
                  { backgroundColor: Colors.primary },
                ]}
              >
                <IconSymbol name="plus" size={14} color={Colors.black} />
                <ThemedText
                  type="small"
                  style={{
                    color: Colors.black,
                    marginLeft: 6,
                    fontWeight: '600',
                  }}
                >
                  Add Address
                </ThemedText>
              </ThemedPressable>
            </ThemedView>
          )}
        </ThemedView>

        {/* Payment Method Section */}
        <ThemedView
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Payment Method
          </ThemedText>

          <ThemedView style={styles.paymentMethods}>
            {[
              {
                method: 'card' as PaymentMethod,
                label: 'Credit/Debit Card',
                icon: 'creditcard.fill' as const,
              },
              {
                method: 'upi' as PaymentMethod,
                label: 'UPI',
                icon: 'paperplane.fill' as const,
              },
              {
                method: 'wallet' as PaymentMethod,
                label: 'Wallet',
                icon: 'cash.fill' as const,
              },
              {
                method: 'cash' as PaymentMethod,
                label: 'Cash on Delivery',
                icon: 'cash.fill' as const,
              },
            ].map(({ method, label, icon }) => (
              <ThemedPressable
                key={method}
                onPress={() => setSelectedPaymentMethod(method)}
                style={[
                  styles.paymentMethodItem,
                  {
                    borderWidth: 1,
                    borderColor: Colors[colorScheme].textSecondary + '30',
                    borderRadius: 10,
                  },
                  selectedPaymentMethod === method && {
                    borderWidth: 1,
                    borderColor: Colors.primary,
                  },
                ]}
              >
                <ThemedView style={styles.paymentMethodLeft}>
                  <ThemedView
                    style={[
                      styles.paymentIconContainer,
                      selectedPaymentMethod === method && {
                        backgroundColor: Colors.primary + '25',
                      },
                    ]}
                  >
                    <IconSymbol
                      name={icon}
                      size={18}
                      color={
                        selectedPaymentMethod === method
                          ? Colors.primary
                          : Colors[colorScheme].textSecondary
                      }
                    />
                  </ThemedView>
                  <ThemedView style={styles.paymentMethodText}>
                    <ThemedText
                      type="small"
                      style={{
                        color:
                          selectedPaymentMethod === method
                            ? Colors.primary
                            : Colors[colorScheme].textPrimary,
                        fontWeight: '600',
                      }}
                    >
                      {label}
                    </ThemedText>
                    {method === 'cash' && (
                      <ThemedText
                        type="xsmall"
                        style={{
                          color: Colors[colorScheme].textSecondary,
                          marginTop: 1,
                        }}
                      >
                        Pay when you receive
                      </ThemedText>
                    )}
                  </ThemedView>
                </ThemedView>
                {selectedPaymentMethod === method && (
                  <ThemedView
                    style={[
                      styles.checkmarkContainer,
                      { backgroundColor: Colors.primary },
                    ]}
                  >
                    <IconSymbol
                      name="checkmark.square.fill"
                      size={16}
                      color={Colors.white}
                    />
                  </ThemedView>
                )}
              </ThemedPressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Order Summary Section */}
        <ThemedView
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Order Summary
          </ThemedText>

          <ThemedView style={styles.summaryRow}>
            <ThemedView style={styles.summaryRowLeft}>
              <ThemedText
                type="small"
                style={{ color: Colors[colorScheme].textSecondary }}
              >
                Subtotal ({items.length} items)
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
            <ThemedView style={styles.summaryRowRight}>
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

          {discountAmount > 0 && (
            <ThemedView style={styles.summaryRow}>
              <ThemedText
                type="small"
                style={{ color: Colors.success, fontWeight: '600' }}
              >
                Discount Applied
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: Colors.success, fontWeight: '600' }}
              >
                -₹{discountAmount.toFixed(0)}
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.summaryRow}>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Delivery Fee
            </ThemedText>
            <ThemedView style={styles.summaryRowRight}>
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

          <ThemedView style={styles.summaryRow}>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Handling Charge
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textPrimary }}
            >
              ₹{HANDLING_CHARGE.toFixed(0)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText type="subtitle">Total</ThemedText>
            <ThemedText type="subtitle" style={{ color: Colors.primary }}>
              ₹{finalTotal.toFixed(0)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Place Order Button */}
        <ThemedButton
          onPress={handlePlaceOrder}
          disabled={
            isPlacingOrder || !selectedAddress || !selectedPaymentMethod
          }
          style={[
            styles.placeOrderButton,
            {
              backgroundColor: Colors.primary,
              opacity:
                isPlacingOrder || !selectedAddress || !selectedPaymentMethod
                  ? 0.5
                  : 1,
            },
          ]}
        >
          {isPlacingOrder ? (
            <>
              <ActivityIndicator size="small" color={Colors.black} />
              <ThemedText
                type="defaultSemiBold"
                style={{ color: Colors.black, marginLeft: 8 }}
              >
                Placing Order...
              </ThemedText>
            </>
          ) : (
            <ThemedText type="defaultSemiBold" style={{ color: Colors.black }}>
              Place Order
            </ThemedText>
          )}
        </ThemedButton>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addressCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.textSecondary + '20',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  emptyAddress: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.textSecondary + '20',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  paymentMethods: {
    gap: 6,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    marginBottom: 0,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  paymentMethodText: {
    flex: 1,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    fontSize: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '20',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    minHeight: 56,
  },
});
