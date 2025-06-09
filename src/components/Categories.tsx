import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import { CategoriesData } from '../constants/Categories'; // Adjust the import path as necessary
import ScrollView from './ScrollView';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
const Categories = () => {
  return (
    <ScrollView horizontal>
      {CategoriesData?.map((category: any) => (
        <ThemedView style={styles.categoryCard} key={category.id}>
          <Image
            source={category.image}
            style={styles.categoryImage}
            contentFit="cover"
            transition={1000}
            alt={category.name}
          />
          <ThemedText type="xsmall">{category.name}</ThemedText>
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
