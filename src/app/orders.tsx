import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedPressable } from '@/components/ThemedPressable';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ThemedButton } from '@/components/ThemedButton';
import {
  fetchOrders,
  cancelOrder,
  setSelectedOrder,
  reorder,
  Order,
} from '@/store/slices/ordersSlice';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { OrderCardSkeleton } from '@/components/SkeletonLoader';
import { router } from 'expo-router';

const getStatusColor = (
  status: Order['status'],
  colorScheme: 'light' | 'dark',
) => {
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
      return Colors[colorScheme as 'light' | 'dark'].textSecondary;
  }
};

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

const OrderCard = ({
  order,
  onPress,
  onCancel,
  onReorder,
}: {
  order: Order;
  onPress: () => void;
  onCancel: () => void;
  onReorder: () => void;
}) => {
  const colorScheme = useColorScheme();
  const statusColor = getStatusColor(order.status, colorScheme);
  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const canReorder = order.status === 'delivered';

  return (
    <ThemedPressable
      onPress={onPress}
      style={[
        styles.orderCard,
        { backgroundColor: Colors[colorScheme].backgroundPaper },
      ]}
    >
      <ThemedView style={styles.orderHeader}>
        <ThemedView style={styles.orderInfo}>
          <ThemedText type="defaultSemiBold">
            Order #{order.order_number}
          </ThemedText>
          <ThemedText
            type="xsmall"
            style={{ color: Colors[colorScheme].textSecondary, marginTop: 2 }}
          >
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </ThemedText>
        </ThemedView>
        <ThemedView
          style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}
        >
          <ThemedText
            type="xsmall"
            style={{ color: statusColor, fontWeight: '600' }}
          >
            {getStatusLabel(order.status)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.orderItems}>
        {order.items.slice(0, 3).map(item => (
          <ThemedView key={item.id} style={styles.orderItem}>
            {item.product_image && (
              <Image
                source={{ uri: item.product_image }}
                style={styles.itemImage}
                contentFit="cover"
              />
            )}
            <ThemedView style={styles.itemInfo}>
              <ThemedText type="small" numberOfLines={1}>
                {item.product_name}
              </ThemedText>
              <ThemedText
                type="xsmall"
                style={{ color: Colors[colorScheme].textSecondary }}
              >
                Qty: {item.quantity} × ₹{item.price.toFixed(0)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
        {order.items.length > 3 && (
          <ThemedText
            type="xsmall"
            style={{
              color: Colors.primary,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            +{order.items.length - 3} more items
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.orderFooter}>
        <ThemedView>
          <ThemedText
            type="xsmall"
            style={{ color: Colors[colorScheme].textSecondary }}
          >
            Total Amount
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: Colors.primary }}>
            ₹{order.total_amount.toFixed(0)}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.orderActions}>
          {canReorder && (
            <ThemedButton
              onPress={onReorder}
              style={[
                styles.reorderButton,
                { backgroundColor: Colors.primary },
              ]}
            >
              <IconSymbol name="cart.fill" size={16} color={Colors.black} />
              <ThemedText
                type="small"
                style={{
                  color: Colors.black,
                  fontWeight: '600',
                  marginLeft: 4,
                }}
              >
                Re-order
              </ThemedText>
            </ThemedButton>
          )}
          {canCancel && (
            <ThemedButton
              onPress={onCancel}
              style={[
                styles.cancelButton,
                { backgroundColor: Colors.error + '15' },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: Colors.error, fontWeight: '600' }}
              >
                Cancel
              </ThemedText>
            </ThemedButton>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedPressable>
  );
};

export default function Orders() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { orders, isLoading, error } = useAppSelector(state => state.orders);
  const { user } = useAppSelector(state => state.auth);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrders(user.id));
    }
  }, [user, dispatch]);

  const filteredOrders =
    filter === 'all' ? orders : orders.filter(order => order.status === filter);

  const handleOrderPress = (order: Order) => {
    dispatch(setSelectedOrder(order));
    router.push(`/order/${order.id}`);
  };

  const handleCancelOrder = (order: Order) => {
    if (!user?.id) return;

    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${order.order_number}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            dispatch(cancelOrder({ userId: user.id, orderId: order.id }));
          },
        },
      ],
    );
  };

  const handleReorder = async (order: Order) => {
    try {
      await dispatch(reorder(order));
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

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <HeaderView>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">My Orders</ThemedText>
          {orders.length > 0 && (
            <ThemedText
              type="xsmall"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              {orders.length} orders
            </ThemedText>
          )}
        </ThemedView>
      </HeaderView>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <ThemedView style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(
              [
                'all',
                'pending',
                'confirmed',
                'preparing',
                'out_for_delivery',
                'delivered',
              ] as const
            ).map(status => (
              <ThemedPressable
                key={status}
                onPress={() => setFilter(status)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor:
                      filter === status
                        ? Colors.primary
                        : Colors[colorScheme].backgroundPaper,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      filter === status
                        ? Colors.black
                        : Colors[colorScheme].textPrimary,
                    fontWeight: filter === status ? '600' : '400',
                  }}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'out_for_delivery'
                    ? 'Out for Delivery'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </ThemedText>
              </ThemedPressable>
            ))}
          </ScrollView>
        </ThemedView>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!user?.id ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">Sign in to view your orders</ThemedText>
            <ThemedText
              type="small"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Sign in to see your order history
            </ThemedText>
          </ThemedView>
        ) : isLoading ? (
          <ThemedView style={styles.ordersList}>
            {[1, 2, 3].map(i => (
              <OrderCardSkeleton key={i} />
            ))}
          </ThemedView>
        ) : error ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText type="subtitle" style={{ color: Colors.error }}>
              Error loading orders
            </ThemedText>
            <ThemedText type="small" style={{ marginTop: 8 }}>
              {error}
            </ThemedText>
          </ThemedView>
        ) : filteredOrders.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol
              name="cart.fill"
              size={64}
              color={Colors[colorScheme].textSecondary}
            />
            <ThemedText type="subtitle" style={{ marginTop: 16 }}>
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </ThemedText>
            <ThemedText
              type="small"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {filter === 'all'
                ? 'Start shopping to see your orders here'
                : `You don't have any ${filter} orders`}
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.ordersList}>
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => handleOrderPress(order)}
                onCancel={() => handleCancelOrder(order)}
                onReorder={() => handleReorder(order)}
              />
            ))}
          </ThemedView>
        )}
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
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '20',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderItems: {
    gap: 8,
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '20',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
