import { Category } from '@/types';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import ScrollView from './ScrollView';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const Categories = () => {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const {
    items: categories,
    isLoading,
    error,
  } = useAppSelector(state => state.categories);

  useEffect(() => {
    // Fetch categories if not already loaded
    if (categories.length === 0 && !isLoading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, isLoading]);

  if (isLoading && categories.length === 0) {
    return (
      <ScrollView horizontal>
        <ThemedView
          style={{ backgroundColor: Colors[colorScheme].backgroundPaper }}
        >
          <ActivityIndicator size="small" color={Colors.primary} />
          <ThemedText type="xsmall" style={{ marginTop: 8 }}>
            Loading categories...
          </ThemedText>
        </ThemedView>
      </ScrollView>
    );
  }

  if (error && categories.length === 0) {
    return (
      <ScrollView horizontal>
        <ThemedView
          style={{ backgroundColor: Colors[colorScheme].backgroundPaper }}
        >
          <ThemedText type="xsmall" style={{ color: Colors.error }}>
            Failed to load categories
          </ThemedText>
        </ThemedView>
      </ScrollView>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {categories.map((category: Category) => (
        <ThemedView
          style={[
            styles.categoryCard,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
          key={category.id}
        >
          {category.image && (
            <Image
              source={{
                uri: typeof category.image === 'string' ? category.image : '',
              }}
              style={styles.categoryImage}
              contentFit="cover"
              transition={1000}
              alt={category.name}
            />
          )}
          <ThemedText
            type="xsmall"
            style={{ textAlign: 'center', marginTop: 4 }}
          >
            {category.name}
          </ThemedText>
        </ThemedView>
      ))}
    </ScrollView>
  );
};

export default Categories;

const styles = StyleSheet.create({
  categoryCard: {
    width: 100,
    height: 120,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
});
