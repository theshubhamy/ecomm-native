import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
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
import { fetchSavedAddresses, setSelectedAddress } from '@/store/slices/locationSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { createPaymentIntent, processPayment, PaymentMethod } from '@/store/slices/paymentSlice';
import { notifyOrderConfirmed, notifyPaymentSuccess } from '@/services/notifications';
import { Address } from '@/types';

export default function Checkout() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { items, total } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { savedAddresses, selectedAddress } = useAppSelector(
    (state) => state.location
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSavedAddresses(user.id));
    }
  }, [user, dispatch]);

  const deliveryFee = total >= 10 ? 2.99 : 0;
  const finalTotal = total + deliveryFee;

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
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      // Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          order_number: orderNumber,
          status: 'pending',
          total_amount: finalTotal,
          delivery_fee: deliveryFee,
          payment_method: selectedPaymentMethod,
          payment_status: 'pending',
          delivery_address_id: selectedAddress.id,
          delivery_time_slot: '', // Get from cart state if needed
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      // Create order items
      const orderItems = items.map((item) => ({
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
            userName: user?.name || user?.user_metadata?.display_name,
          })
        );
      } else {
        // Online payment - create payment intent and process with Razorpay
        const paymentResult = await dispatch(
          createPaymentIntent({
            orderId: orderData.id,
            amount: finalTotal,
            paymentMethod: selectedPaymentMethod,
            userEmail: user?.email,
            userName: user?.name || user?.user_metadata?.display_name,
            userPhone: selectedAddress.contact_phone,
          })
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
            })
          );

          if (processPayment.rejected.match(processResult)) {
            throw new Error(processResult.payload as string || 'Payment failed');
          }
        } else {
          throw new Error(paymentResult.payload as string || 'Payment failed');
        }
      }

      // Update order status
      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
        })
        .eq('id', orderData.id);

      // Clear cart after successful order
      dispatch(clearCart());

      // Send notifications
      await notifyOrderConfirmed(orderNumber);
      if (selectedPaymentMethod !== 'cash') {
        await notifyPaymentSuccess(orderNumber, finalTotal);
      }

      Alert.alert(
        'Order Placed!',
        `Your order #${orderNumber} has been placed successfully. You will receive a confirmation shortly.`,
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/(tabs)/orders'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Order Failed',
        error instanceof Error ? error.message : 'Failed to place order'
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
        <ThemedView
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold">Delivery Address</ThemedText>
            <ThemedPressable
              onPress={() => router.push('/address-selection')}
              style={styles.addButton}
            >
              <IconSymbol name="plus" size={16} color={Colors.primary} />
              <ThemedText
                type="small"
                style={{ color: Colors.primary, marginLeft: 4 }}
              >
                {savedAddresses.length > 0 ? 'Change' : 'Add'}
              </ThemedText>
            </ThemedPressable>
          </ThemedView>

          {selectedAddress ? (
            <ThemedView style={styles.addressCard}>
              <ThemedView style={styles.addressHeader}>
                <ThemedText type="defaultSemiBold">
                  {selectedAddress.type.charAt(0).toUpperCase() +
                    selectedAddress.type.slice(1)}
                </ThemedText>
                {selectedAddress.is_default && (
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
              <ThemedText
                type="small"
                style={{
                  color: Colors[colorScheme].textSecondary,
                  marginTop: 4,
                }}
              >
                {selectedAddress.address_line1}
                {selectedAddress.address_line2 && `, ${selectedAddress.address_line2}`}
              </ThemedText>
              <ThemedText
                type="small"
                style={{
                  color: Colors[colorScheme].textSecondary,
                  marginTop: 2,
                }}
              >
                {selectedAddress.city}, {selectedAddress.state}{' '}
                {selectedAddress.pincode}
              </ThemedText>
              {selectedAddress.contact_phone && (
                <ThemedText
                  type="small"
                  style={{
                    color: Colors[colorScheme].textSecondary,
                    marginTop: 4,
                  }}
                >
                  Phone: {selectedAddress.contact_phone}
                </ThemedText>
              )}
            </ThemedView>
          ) : (
            <ThemedView style={styles.emptyAddress}>
              <IconSymbol
                name="location.fill"
                size={32}
                color={Colors[colorScheme].textSecondary}
              />
              <ThemedText
                type="small"
                style={{
                  color: Colors[colorScheme].textSecondary,
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                No address selected. Please add a delivery address.
              </ThemedText>
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
            {(['card', 'upi', 'wallet', 'cash'] as PaymentMethod[]).map(
              (method) => (
                <ThemedPressable
                  key={method}
                  onPress={() => setSelectedPaymentMethod(method)}
                  style={[
                    styles.paymentMethodItem,
                    {
                      backgroundColor:
                        selectedPaymentMethod === method
                          ? Colors.primary + '20'
                          : Colors[colorScheme].background,
                      borderColor:
                        selectedPaymentMethod === method
                          ? Colors.primary
                          : Colors[colorScheme].textSecondary + '30',
                    },
                  ]}
                >
                  <ThemedView style={styles.paymentMethodLeft}>
                    <IconSymbol
                      name={
                        method === 'card'
                          ? 'creditcard.fill'
                          : method === 'upi'
                          ? 'paperplane.fill'
                          : method === 'wallet'
                          ? 'square'
                          : 'cash'
                      }
                      size={24}
                      color={
                        selectedPaymentMethod === method
                          ? Colors.primary
                          : Colors[colorScheme].textSecondary
                      }
                    />
                    <ThemedText
                      type="defaultSemiBold"
                      style={{
                        marginLeft: 12,
                        color:
                          selectedPaymentMethod === method
                            ? Colors.primary
                            : Colors[colorScheme].textPrimary,
                      }}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </ThemedText>
                  </ThemedView>
                  {selectedPaymentMethod === method && (
                    <IconSymbol
                      name="checkmark.square.fill"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </ThemedPressable>
              )
            )}
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
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Subtotal ({items.length} items)
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              ${total.toFixed(2)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.summaryRow}>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Delivery Fee
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              ${deliveryFee.toFixed(2)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText type="subtitle">Total</ThemedText>
            <ThemedText type="subtitle" style={{ color: Colors.primary }}>
              ${finalTotal.toFixed(2)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Place Order Button */}
        <ThemedButton
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || !selectedAddress || !selectedPaymentMethod}
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
            <ThemedText
              type="defaultSemiBold"
              style={{ color: Colors.black }}
            >
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
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  addressCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyAddress: {
    alignItems: 'center',
    padding: 24,
  },
  paymentMethods: {
    gap: 8,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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

