import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedPressable } from '@/components/ThemedPressable';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ProductCard from '@/components/cards/Product';
import Categories from '@/components/Categories';
import Search from '@/components/Search';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, fetchProductsByCategory } from '@/store/slices/productsSlice';
import { Category } from '@/types';
import { CategoriesData } from '@/constants/Categories';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import React from 'react';

export default function Catalog() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { items: products, isLoading, error } = useAppSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchProductsByCategory(selectedCategory));
    } else {
      // Only fetch if no search results exist
      const currentProducts = useAppSelector.getState().products.items;
      if (currentProducts.length === 0) {
        dispatch(fetchProducts());
      }
    }
  }, [selectedCategory, dispatch]);

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
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
          <ThemedText type="subtitle">Catalog</ThemedText>
        </ThemedView>
        <ThemedView style={styles.searchContainer}>
          <Search />
        </ThemedView>
      </HeaderView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories Section */}
        <ThemedView style={styles.categoriesSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle">Categories</ThemedText>
            {selectedCategory && (
              <ThemedPressable
                onPress={() => setSelectedCategory(null)}
                style={styles.clearFilter}
              >
                <ThemedText type="xsmall" style={{ color: Colors.primary }}>
                  Clear Filter
                </ThemedText>
              </ThemedPressable>
            )}
          </ThemedView>
          <ThemedView style={styles.categoriesContainer}>
            {CategoriesData.map((category: Category) => (
              <ThemedPressable
                key={category.id}
                onPress={() => handleCategorySelect(category.id)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      selectedCategory === category.id
                        ? Colors.primary + '20'
                        : Colors[colorScheme].backgroundPaper,
                    borderColor:
                      selectedCategory === category.id
                        ? Colors.primary
                        : Colors[colorScheme].textSecondary + '30',
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      selectedCategory === category.id
                        ? Colors.primary
                        : Colors[colorScheme].textPrimary,
                    fontWeight: selectedCategory === category.id ? '600' : '400',
                  }}
                >
                  {category.name}
                </ThemedText>
              </ThemedPressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Products Section */}
        <ThemedView style={styles.productsSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle">
              {selectedCategory
                ? `${CategoriesData.find((c) => c.id === selectedCategory)?.name} Products`
                : 'All Products'}
            </ThemedText>
            <ThemedText type="xsmall" style={{ color: Colors[colorScheme].textSecondary }}>
              {products.length} items
            </ThemedText>
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
              <ThemedText type="subtitle">No products found</ThemedText>
              <ThemedText type="small" style={{ marginTop: 8, textAlign: 'center' }}>
                {selectedCategory
                  ? 'No products in this category'
                  : 'Check back later for new products'}
              </ThemedText>
            </ThemedView>
          ) : (
            <FlashList
              data={products}
              renderItem={({ item }) => <ProductCard item={item} key={item.id} />}
              numColumns={2}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<ThemedView style={{ height: 100 }} />}
              estimatedItemSize={200}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchContainer: {
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  categoriesSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clearFilter: {
    padding: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  productsSection: {
    gap: 12,
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
