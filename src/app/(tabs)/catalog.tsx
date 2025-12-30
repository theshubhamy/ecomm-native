import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';

import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedPressable } from '@/components/ThemedPressable';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ProductCard from '@/components/cards/Product';
import Search from '@/components/Search';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProducts,
  fetchProductsByCategory,
} from '@/store/slices/productsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { Category } from '@/types';

export default function Catalog() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {
    items: products,
    isLoading,
    error,
  } = useAppSelector(state => state.products);
  const { items: categories, isLoading: categoriesLoading } = useAppSelector(
    state => state.categories,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories on mount
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, categoriesLoading]);

  useEffect(() => {
    if (selectedCategory) {
      // Always fetch when category is selected
      dispatch(fetchProductsByCategory(selectedCategory));
    } else {
      // Fetch all products when no category is selected
      dispatch(fetchProducts());
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

      <ThemedView style={styles.contentContainer}>
        {/* Sidebar for Categories */}
        <ThemedView
          style={[
            styles.sidebar,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          {categoriesLoading ? (
            <ThemedView style={styles.loadingCategories}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <ThemedText
                type="xsmall"
                style={{ marginTop: 8, textAlign: 'center' }}
              >
                Loading...
              </ThemedText>
            </ThemedView>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarContent}
            >
              {/* All Products Option */}
              <ThemedPressable
                onPress={() => setSelectedCategory(null)}
                style={[
                  styles.sidebarItem,
                  {
                    backgroundColor:
                      selectedCategory === null
                        ? Colors.primary + '15'
                        : 'transparent',
                    borderLeftWidth: selectedCategory === null ? 3 : 0,
                    borderLeftColor:
                      selectedCategory === null
                        ? Colors.primary
                        : 'transparent',
                  },
                ]}
              >
                <ThemedView style={styles.sidebarItemContent}>
                  <ThemedView
                    style={[
                      styles.categoryImageContainer,
                      {
                        backgroundColor: Colors.primary + '20',
                      },
                    ]}
                  >
                    <IconSymbol
                      name="square.grid.2x2"
                      size={20}
                      color={Colors.primary}
                    />
                  </ThemedView>
                  <ThemedText
                    type="xsmall"
                    style={[
                      styles.sidebarItemText,
                      {
                        color:
                          selectedCategory === null
                            ? Colors.primary
                            : Colors[colorScheme].textPrimary,
                        fontWeight: selectedCategory === null ? '600' : '400',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    All Products
                  </ThemedText>
                </ThemedView>
              </ThemedPressable>

              {/* Category Items */}
              {categories.map((category: Category) => (
                <ThemedPressable
                  key={category.id}
                  onPress={() => handleCategorySelect(category.id)}
                  style={[
                    styles.sidebarItem,
                    {
                      backgroundColor:
                        selectedCategory === category.id
                          ? Colors.primary + '15'
                          : 'transparent',
                      borderLeftWidth: selectedCategory === category.id ? 3 : 0,
                      borderLeftColor:
                        selectedCategory === category.id
                          ? Colors.primary
                          : 'transparent',
                    },
                  ]}
                >
                  <ThemedView style={styles.sidebarItemContent}>
                    <ThemedView
                      style={[
                        styles.categoryImageContainer,
                        {
                          backgroundColor:
                            selectedCategory === category.id
                              ? Colors.primary + '20'
                              : Colors[colorScheme].backgroundPaper,
                        },
                      ]}
                    >
                      {category.image &&
                      typeof category.image === 'string' &&
                      category.image.length > 0 ? (
                        <Image
                          source={{ uri: category.image }}
                          style={styles.categoryImage}
                          contentFit="cover"
                          transition={200}
                        />
                      ) : (
                        <IconSymbol
                          name="tag"
                          size={20}
                          color={
                            selectedCategory === category.id
                              ? Colors.primary
                              : Colors[colorScheme].textSecondary
                          }
                        />
                      )}
                    </ThemedView>
                    <ThemedText
                      type="xsmall"
                      style={[
                        styles.sidebarItemText,
                        {
                          color:
                            selectedCategory === category.id
                              ? Colors.primary
                              : Colors[colorScheme].textPrimary,
                          fontWeight:
                            selectedCategory === category.id ? '600' : '400',
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {category.name}
                    </ThemedText>
                  </ThemedView>
                </ThemedPressable>
              ))}
            </ScrollView>
          )}
        </ThemedView>

        {/* Products Section */}
        <ThemedView style={styles.productsSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="subtitle">
              {selectedCategory
                ? `${
                    categories.find(c => c.id === selectedCategory)?.name ||
                    'Category'
                  } Products`
                : 'All Products'}
            </ThemedText>
            {!isLoading && (
              <ThemedText
                type="xsmall"
                style={{ color: Colors[colorScheme].textSecondary }}
              >
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </ThemedText>
            )}
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
              <ThemedText
                type="small"
                style={{ marginTop: 8, textAlign: 'center' }}
              >
                {error}
              </ThemedText>
            </ThemedView>
          ) : products.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="subtitle">No products found</ThemedText>
              <ThemedText
                type="small"
                style={{ marginTop: 8, textAlign: 'center' }}
              >
                {selectedCategory
                  ? 'No products in this category'
                  : 'Check back later for new products'}
              </ThemedText>
            </ThemedView>
          ) : (
            <FlashList
              data={products}
              renderItem={({ item }) => <ProductCard item={item} />}
              numColumns={2}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              ListFooterComponent={
                <ThemedView style={{ height: insets.bottom + 100 }} />
              }
            />
          )}
        </ThemedView>
      </ThemedView>
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
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 100,
    borderRightWidth: 1,
    borderRightColor: Colors.light.textSecondary + '20',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.textSecondary + '20',
  },
  clearFilter: {
    padding: 2,
  },
  sidebarContent: {
    paddingVertical: 4,
  },
  sidebarItem: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  sidebarItemContent: {
    alignItems: 'center',
    gap: 8,
  },
  categoryImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sidebarItemText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  loadingCategories: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyCategories: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  productsSection: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 16,
  },
  productsList: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
});
