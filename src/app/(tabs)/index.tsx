import ProductCard from '@/components/cards/Product';
import Categories from '@/components/Categories';
import OffersBanner from '@/components/OffersBanner';
import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedPressable } from '@/components/ThemedPressable';
import TopBar from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Product } from '@/types';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet } from 'react-native';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchOffers } from '@/store/slices/offersSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const {
    items: products,
    isLoading,
    error,
  } = useAppSelector(state => state.products);
  const { items: categories } = useAppSelector(state => state.categories);

  useEffect(() => {
    // Fetch products, offers, and categories on mount
    dispatch(fetchProducts());
    dispatch(fetchOffers());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};

    products.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized';
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(product);
    });

    // Get categories with products, sorted by category name
    const categoriesWithProducts = categories
      .filter(
        category => grouped[category.id] && grouped[category.id].length > 0,
      )
      .map(category => ({
        category,
        products: grouped[category.id],
      }))
      .sort((a, b) => a.category.name.localeCompare(b.category.name));

    // Add uncategorized products if any
    if (grouped['uncategorized'] && grouped['uncategorized'].length > 0) {
      categoriesWithProducts.push({
        category: { id: 'uncategorized', name: 'Other Products', image: '' },
        products: grouped['uncategorized'],
      });
    }

    return categoriesWithProducts;
  }, [products, categories]);

  const handleSeeAll = (categoryId: string) => {
    // Navigate to catalog with category parameter
    router.push(`/catalog?category=${categoryId}`);
  };

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
          </ThemedView>
          {/* Categories */}
          <Categories />
          {/* Products by Category */}
          {isLoading ? (
            <ThemedView style={styles.productsGrid}>
              {[1, 2, 3, 4].map(i => (
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
          ) : productsByCategory.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="subtitle">No products available</ThemedText>
              <ThemedText type="small" style={{ marginTop: 8 }}>
                Check back later for new products
              </ThemedText>
            </ThemedView>
          ) : (
            productsByCategory.map(
              ({ category, products: categoryProducts }) => (
                <ThemedView key={category.id} style={styles.categorySection}>
                  <ThemedView style={styles.titleContainer}>
                    <ThemedText type="subtitle">{category.name}</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.horizontalListContainer}>
                    <FlashList
                      data={categoryProducts}
                      renderItem={({ item }: { item: Product }) => (
                        <ThemedView style={styles.horizontalProductCard}>
                          <ProductCard item={item} />
                        </ThemedView>
                      )}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item: Product) => item.id.toString()}
                      contentContainerStyle={styles.horizontalListContent}
                    />
                  </ThemedView>
                  {/* See All Button */}
                  <ThemedPressable
                    onPress={() => handleSeeAll(category.id)}
                    style={[
                      styles.seeAllButton,
                      {
                        backgroundColor: Colors.primary,
                        borderColor: Colors.primary + '30',
                      },
                    ]}
                  >
                    <ThemedText
                      type="xsmall"
                      style={{
                        color: Colors[colorScheme].textPrimary,
                      }}
                    >
                      See All {category.name} Products
                    </ThemedText>
                    <IconSymbol
                      name="chevron.right"
                      size={18}
                      color={Colors[colorScheme].textPrimary}
                    />
                  </ThemedPressable>
                </ThemedView>
              ),
            )
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
    gap: 10,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  categorySection: {
    marginBottom: 10,
    gap: 12,
  },
  horizontalListContainer: {
    height: 220,
  },
  horizontalListContent: {
    paddingRight: 16,
  },
  horizontalProductCard: {
    width: 160,
    marginRight: 12,
  },
  seeAllButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
});
