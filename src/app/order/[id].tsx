import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedPressable } from '@/components/ThemedPressable';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchOrderById,
  cancelOrder,
  reorder,
  Order,
} from '@/store/slices/ordersSlice';

function getStatusColor(
  status: Order['status'],
  colorScheme: 'light' | 'dark',
) {
  switch (status) {
    case 'delivered':
      return Colors.success;
    case 'out_for_delivery':
      return Colors.primary;
    case 'preparing':
      return Colors.warning;
    case 'confirmed':
      return Colors.primary;
    case 'cancelled':
      return Colors.error;
    default:
      return Colors[colorScheme].textSecondary;
  }
}

const getStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { selectedOrder, isLoading, error } = useAppSelector(
    state => state.orders,
  );
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (id && user?.id) {
      dispatch(fetchOrderById({ userId: user.id, orderId: id }));
    }
  }, [id, user, dispatch]);

  const handleCancelOrder = () => {
    if (!user?.id || !selectedOrder) return;

    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${selectedOrder.order_number}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            dispatch(
              cancelOrder({ userId: user.id, orderId: selectedOrder.id }),
            );
            router.back();
          },
        },
      ],
    );
  };

  const handleReorder = async () => {
    if (!selectedOrder) return;

    try {
      await dispatch(reorder(selectedOrder));
      Alert.alert(
        'Items Added to Cart',
        'All items from this order have been added to your cart.',
        [
          {
            text: 'View Cart',
            onPress: () => router.push('/(tabs)/cart'),
          },
          { text: 'OK' },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to reorder',
      );
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
          Loading order details...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !selectedOrder) {
    return (
      <ThemedView
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <ThemedText type="subtitle" style={{ color: Colors.error }}>
          {error || 'Order not found'}
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

  const statusColor = getStatusColor(selectedOrder.status, colorScheme);
  const canCancel =
    selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed';

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
          <ThemedText type="subtitle">Order Details</ThemedText>
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
        {/* Order Status */}
        <ThemedView
          style={[
            styles.statusCard,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedView style={styles.statusHeader}>
            <ThemedText type="defaultSemiBold">Order Status</ThemedText>
            <ThemedView
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: statusColor, fontWeight: '600' }}
              >
                {getStatusLabel(selectedOrder.status)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText
            type="xsmall"
            style={{
              color: Colors[colorScheme].textSecondary,
              marginTop: 8,
            }}
          >
            Order #{selectedOrder.order_number}
          </ThemedText>
          {selectedOrder.delivery_time_slot && (
            <ThemedText
              type="xsmall"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginTop: 4,
              }}
            >
              Delivery Time: {selectedOrder.delivery_time_slot}
            </ThemedText>
          )}
        </ThemedView>

        {/* Delivery Address */}
        <ThemedView
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Delivery Address
          </ThemedText>
          <ThemedView style={styles.addressCard}>
            <ThemedText type="small">
              {(selectedOrder.delivery_address as any).address_line1 ||
                (selectedOrder.delivery_address as any).addressLine1}
              {((selectedOrder.delivery_address as any).address_line2 ||
                (selectedOrder.delivery_address as any).addressLine2) &&
                `, ${
                  (selectedOrder.delivery_address as any).address_line2 ||
                  (selectedOrder.delivery_address as any).addressLine2
                }`}
            </ThemedText>
            <ThemedText
              type="small"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginTop: 4,
              }}
            >
              {selectedOrder.delivery_address.city},{' '}
              {selectedOrder.delivery_address.state}{' '}
              {selectedOrder.delivery_address.pincode}
            </ThemedText>
            {((selectedOrder.delivery_address as any).contact_phone ||
              (selectedOrder.delivery_address as any).contactPhone) && (
              <ThemedText
                type="small"
                style={{
                  color: Colors[colorScheme].textSecondary,
                  marginTop: 4,
                }}
              >
                Phone:{' '}
                {(selectedOrder.delivery_address as any).contact_phone ||
                  (selectedOrder.delivery_address as any).contactPhone}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        {/* Order Items */}
        <ThemedView
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Order Items ({selectedOrder.items.length})
          </ThemedText>
          {selectedOrder.items.map(item => (
            <ThemedView key={item.id} style={styles.orderItem}>
              {item.product_image && (
                <Image
                  source={{ uri: item.product_image }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
              )}
              <ThemedView style={styles.itemInfo}>
                <ThemedText type="defaultSemiBold">
                  {item.product_name}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{
                    color: Colors[colorScheme].textSecondary,
                    marginTop: 4,
                  }}
                >
                  Quantity: {item.quantity} × ${item.price.toFixed(2)}
                </ThemedText>
              </ThemedView>
              <ThemedText type="defaultSemiBold" style={styles.itemTotal}>
                ${item.total.toFixed(2)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Payment Summary */}
        <ThemedView
          style={[
            styles.section,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Payment Summary
          </ThemedText>
          <ThemedView style={styles.summaryRow}>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Subtotal
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              $
              {(
                selectedOrder.total_amount - selectedOrder.delivery_fee
              ).toFixed(2)}
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
              ${selectedOrder.delivery_fee.toFixed(2)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={[styles.summaryRow, styles.totalRow]}>
            <ThemedText type="subtitle">Total</ThemedText>
            <ThemedText type="subtitle" style={{ color: Colors.primary }}>
              ${selectedOrder.total_amount.toFixed(2)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.paymentInfo}>
            <ThemedText
              type="xsmall"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Payment Method:{' '}
              {selectedOrder.payment_method.charAt(0).toUpperCase() +
                selectedOrder.payment_method.slice(1)}
            </ThemedText>
            <ThemedText
              type="xsmall"
              style={{
                color:
                  selectedOrder.payment_status === 'paid'
                    ? Colors.success
                    : Colors[colorScheme].textSecondary,
                marginTop: 4,
              }}
            >
              Payment Status:{' '}
              {selectedOrder.payment_status.charAt(0).toUpperCase() +
                selectedOrder.payment_status.slice(1)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Action Buttons */}
        <ThemedView style={styles.actionButtons}>
          {selectedOrder.status === 'delivered' && (
            <ThemedButton
              onPress={handleReorder}
              style={[
                styles.reorderButton,
                { backgroundColor: Colors.primary },
              ]}
            >
              <IconSymbol name="cart.fill" size={20} color={Colors.black} />
              <ThemedText
                type="defaultSemiBold"
                style={{ color: Colors.black, marginLeft: 8 }}
              >
                Re-order
              </ThemedText>
            </ThemedButton>
          )}
          {canCancel && (
            <ThemedButton
              onPress={handleCancelOrder}
              style={[
                styles.cancelButton,
                { backgroundColor: Colors.error + '15' },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{ color: Colors.error }}
              >
                Cancel Order
              </ThemedText>
            </ThemedButton>
          )}
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
  statusCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  sectionTitle: {
    marginBottom: 8,
  },
  addressCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '20',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTotal: {
    color: Colors.primary,
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
  paymentInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '20',
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
});
