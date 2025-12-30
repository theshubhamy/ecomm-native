import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch } from '@/store/hooks';
import { searchProducts } from '@/store/slices/productsSlice';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { ThemedButton } from './ThemedButton';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface SearchProps {
  onSearchFocus?: () => void;
  autoFocus?: boolean;
}

const Search = ({ onSearchFocus, autoFocus = false }: SearchProps) => {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        dispatch(searchProducts(searchQuery.trim()));
        // Navigate to catalog with search results
        router.push('/catalog');
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, dispatch]);

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      dispatch(searchProducts(searchQuery.trim()));
      router.push('/catalog');
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        height: 44,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderColor: Colors[colorScheme].textSecondary + '30',
        backgroundColor: Colors[colorScheme].backgroundPaper,
      }}
    >
      <IconSymbol
        name="search.fill"
        size={20}
        color={Colors[colorScheme].textSecondary}
      />
      <TextInput
        style={{
          flex: 1,
          color: Colors[colorScheme].textPrimary,
          fontSize: 14,
          lineHeight: 20,
        }}
        cursorColor={Colors.primary}
        selectionColor={Colors.primary}
        placeholder="Search for products or categories..."
        placeholderTextColor={Colors[colorScheme].textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        onFocus={onSearchFocus}
        autoFocus={autoFocus}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={{ padding: 4 }}>
          <IconSymbol
            name="chevron.left.forwardslash.chevron.right"
            size={18}
            color={Colors[colorScheme].textSecondary}
          />
        </TouchableOpacity>
      )}
      <ThemedButton
        onPress={handleSearch}
        style={{
          backgroundColor: 'transparent',
          padding: 4,
        }}
      >
        <IconSymbol name="microphone.fill" size={20} color={Colors.primary} />
      </ThemedButton>
    </ThemedView>
  );
};

export default Search;
