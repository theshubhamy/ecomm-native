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
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';

export default function Cart() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { items, isLoading, total, error } = useAppSelector(
    state => state.cart,
  );
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Fetch cart from DB if user is authenticated
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [user, dispatch]);

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
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText type="small" style={{ marginTop: 16 }}>
              Loading cart...
            </ThemedText>
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
              <ThemedView style={styles.summaryRow}>
                <ThemedText type="subtitle">Total</ThemedText>
                <ThemedText type="subtitle" style={{ color: Colors.primary }}>
                  ${total.toFixed(2)}
                </ThemedText>
              </ThemedView>
              <ThemedButton
                style={styles.checkoutButton}
                onPress={() => {
                  // TODO: Implement checkout
                  console.log('Checkout');
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
  },
});
