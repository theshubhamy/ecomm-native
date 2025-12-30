import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import HeaderView from '@/components/ui/HeaderView';
import ProductCard from '@/components/cards/Product';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWishlist, removeFromWishlistDB } from '@/store/slices/wishlistSlice';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function Wishlist() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.wishlist);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist(user.id));
    }
  }, [user, dispatch]);

  const handleRemoveItem = (productId: string | number) => {
    if (user?.id) {
      dispatch(removeFromWishlistDB({ userId: user.id, productId }));
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
          <ThemedText type="subtitle">Wishlist</ThemedText>
          {items.length > 0 && (
            <ThemedText type="xsmall" style={{ color: Colors[colorScheme].textSecondary }}>
              {items.length} items
            </ThemedText>
          )}
        </ThemedView>
      </HeaderView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!user?.id ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">Sign in to view your wishlist</ThemedText>
            <ThemedText
              type="small"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Sign in to save your favorite products
            </ThemedText>
          </ThemedView>
        ) : isLoading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <ThemedText type="small" style={{ marginTop: 16 }}>
              Loading wishlist...
            </ThemedText>
          </ThemedView>
        ) : error ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText type="subtitle" style={{ color: Colors.error }}>
              Error loading wishlist
            </ThemedText>
            <ThemedText type="small" style={{ marginTop: 8 }}>
              {error}
            </ThemedText>
          </ThemedView>
        ) : items.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">Your wishlist is empty</ThemedText>
            <ThemedText
              type="small"
              style={{
                color: Colors[colorScheme].textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Start adding products to your wishlist
            </ThemedText>
          </ThemedView>
        ) : (
          <FlashList
            data={items}
            renderItem={({ item }) => <ProductCard item={item} key={item.id} />}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<ThemedView style={{ height: 100 }} />}
            estimatedItemSize={200}
          />
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
});
