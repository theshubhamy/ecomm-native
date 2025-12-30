import ProductCard from '@/components/cards/Product';
import Categories from '@/components/Categories';
import OffersBanner from '@/components/OffersBanner';
import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopBar from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/types';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchOffers } from '@/store/slices/offersSlice';
import { notifyOfferAvailable } from '@/services/notifications';
import { useEffect } from 'react';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const {
    items: products,
    isLoading,
    error,
  } = useAppSelector(state => state.products);

  useEffect(() => {
    // Fetch products and offers on mount
    dispatch(fetchProducts());
    dispatch(fetchOffers()).then((result) => {
      // Notify about new offers
      if (fetchOffers.fulfilled.match(result) && result.payload.length > 0) {
        // Notify about the first active offer
        const firstOffer = result.payload[0];
        notifyOfferAvailable(firstOffer.title).catch(console.error);
      }
    });
  }, [dispatch]);

  return (
    <ThemedView
      style={{
        ...styles.container,
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <TopBar />
      <ScrollView>
        <ThemedView style={styles.bodyContainer}>
          {/* Offers Banner */}
          <OffersBanner />

          <ThemedView style={styles.titleContainer}>
            <ThemedText type="subtitle">Categories</ThemedText>
            <ThemedView
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <ThemedText
                type="xsmall"
                style={{ color: Colors[colorScheme].textSecondary }}
              >
                See All
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={Colors[colorScheme].icon}
              />
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.stepContainer}>
            <Categories />
          </ThemedView>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="subtitle">Flash Sale</ThemedText>
            <ThemedView
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <ThemedText
                type="xsmall"
                style={{ color: Colors[colorScheme].textSecondary }}
              >
                See All
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={Colors[colorScheme].icon}
              />
            </ThemedView>
          </ThemedView>
          {isLoading ? (
            <ThemedView style={styles.productsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </ThemedView>
          ) : error ? (
            <ThemedView style={styles.errorContainer}>
              <ThemedText type="subtitle" style={{ color: Colors.error }}>
                Error loading products
              </ThemedText>
              <ThemedText type="small" style={{ marginTop: 8 }}>
                {error}
              </ThemedText>
            </ThemedView>
          ) : products.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="subtitle">No products available</ThemedText>
              <ThemedText type="small" style={{ marginTop: 8 }}>
                Check back later for new products
              </ThemedText>
            </ThemedView>
          ) : (
            <FlashList
              data={products}
              renderItem={({ item }: { item: Product }) => (
                <ProductCard item={item} key={item.id} />
              )}
              numColumns={2}
              keyExtractor={(item: Product) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<ThemedView style={{ height: 100 }} />}
            />
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
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 16,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 10,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
