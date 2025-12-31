import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedPressable } from '@/components/ThemedPressable';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
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
    <ThemedPressable onPress={onPress} style={styles.orderCard}>
      <ThemedView style={styles.orderHeader}>
        <ThemedView style={styles.orderInfo}>
          <ThemedView style={styles.orderNumberRow}>
            <IconSymbol name="tag.fill" size={16} color={Colors.primary} />
            <ThemedText type="defaultSemiBold" style={styles.orderNumber}>
              Order #{order.order_number}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.orderDateRow}>
            <IconSymbol
              name="calendar"
              size={12}
              color={Colors[colorScheme].textSecondary}
            />
            <ThemedText
              type="xsmall"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginLeft: 4,
              }}
            >
              {new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusColor + '15',
              borderColor: statusColor + '30',
            },
          ]}
        >
          <ThemedView
            style={[styles.statusDot, { backgroundColor: statusColor }]}
          />
          <ThemedText
            type="xsmall"
            style={{ color: statusColor, fontWeight: '600', marginLeft: 6 }}
          >
            {getStatusLabel(order.status)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.orderItems}>
        {order.items.slice(0, 3).map((item, index) => (
          <ThemedView
            key={item.id}
            style={[
              styles.orderItem,
              index < order.items.slice(0, 3).length - 1 &&
                styles.orderItemBorder,
            ]}
          >
            {item.product_image && (
              <Image
                source={{ uri: item.product_image }}
                style={styles.itemImage}
                contentFit="cover"
              />
            )}
            <ThemedView style={styles.itemInfo}>
              <ThemedText
                type="small"
                numberOfLines={1}
                style={{ fontWeight: '500' }}
              >
                {item.product_name}
              </ThemedText>
              <ThemedView style={styles.itemDetailsRow}>
                <ThemedText
                  type="xsmall"
                  style={{ color: Colors[colorScheme].textSecondary }}
                >
                  Qty: {item.quantity}
                </ThemedText>
                <ThemedText
                  type="xsmall"
                  style={{
                    color: Colors[colorScheme].textPrimary,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}
                >
                  ₹{item.price.toFixed(0)}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ))}
        {order.items.length > 3 && (
          <ThemedView style={styles.moreItemsContainer}>
            <ThemedText
              type="xsmall"
              style={{
                color: Colors.primary,
                fontWeight: '600',
              }}
            >
              +{order.items.length - 3} more{' '}
              {order.items.length - 3 === 1 ? 'item' : 'items'}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.orderFooter}>
        <ThemedView style={styles.totalSection}>
          <ThemedText
            type="xsmall"
            style={{ color: Colors[colorScheme].textSecondary }}
          >
            Total Amount
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={{ color: Colors.primary, marginTop: 2 }}
          >
            ₹{order.total_amount.toFixed(0)}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.orderActions}>
          {canReorder && (
            <ThemedPressable
              onPress={onReorder}
              style={[
                styles.reorderButton,
                { backgroundColor: Colors.primary },
              ]}
            >
              <IconSymbol name="cart.fill" size={14} color={Colors.black} />
              <ThemedText
                type="small"
                style={{
                  color: Colors.black,
                  fontWeight: '600',
                  marginLeft: 6,
                }}
              >
                Re-order
              </ThemedText>
            </ThemedPressable>
          )}
          {canCancel && (
            <ThemedPressable
              onPress={onCancel}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: Colors.error + '10',
                  borderColor: Colors.error + '30',
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: Colors.error, fontWeight: '600' }}
              >
                Cancel
              </ThemedText>
            </ThemedPressable>
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
          <ThemedPressable onPress={() => router.back()}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={Colors[colorScheme].textPrimary}
            />
          </ThemedPressable>
          <ThemedText type="subtitle">Orders</ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>
      </HeaderView>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <ThemedView
          style={[
            styles.filterContainer,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
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
                    borderColor:
                      filter === status
                        ? Colors.primary
                        : Colors[colorScheme].textSecondary + '20',
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
                    fontWeight: filter === status ? '600' : '500',
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

      <ScrollView>
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
          [1, 2, 3].map(i => <OrderCardSkeleton key={i} />)
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
            <ThemedView
              style={[
                styles.emptyIconContainer,
                { backgroundColor: Colors[colorScheme].backgroundPaper },
              ]}
            >
              <IconSymbol
                name="cart.fill"
                size={48}
                color={Colors[colorScheme].textSecondary + '60'}
              />
            </ThemedView>
            <ThemedText
              type="defaultSemiBold"
              style={{ marginTop: 20, textAlign: 'center' }}
            >
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </ThemedText>
            <ThemedText
              type="small"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginTop: 8,
                textAlign: 'center',
                paddingHorizontal: 32,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
  },
  filterContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '15',
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
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
    padding: 48,
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ordersList: {
    margin: 10,
    gap: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  orderCard: {
    marginBottom: 16,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  orderNumber: {
    fontSize: 16,
  },
  orderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orderItems: {
    marginTop: 4,
    marginBottom: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '10',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  moreItemsContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.textSecondary + '15',
  },
  totalSection: {
    flex: 1,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
});
