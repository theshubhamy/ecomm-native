import ProductCard from '@/components/cards/Product';
import Categories from '@/components/Categories';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productsSlice';
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
    // Fetch products on mount
    dispatch(fetchProducts());
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
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <ThemedText type="small" style={{ marginTop: 16 }}>
                Loading products...
              </ThemedText>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
