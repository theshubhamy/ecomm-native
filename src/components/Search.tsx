import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import React from 'react';
import { TextInput } from 'react-native';
import { ThemedButton } from './ThemedButton';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

const Search = () => {
  const colorScheme = useColorScheme();
  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: 40,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        borderColor: Colors[colorScheme].background,
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <IconSymbol
        name="search.fill"
        size={20}
        color={Colors[colorScheme].textPrimary}
      />
      <TextInput
        style={{
          flex: 1,
          color: Colors[colorScheme].textPrimary,
          fontSize: 16,
          lineHeight: 24,
        }}
        cursorColor={Colors.secondary}
        selectionColor={Colors.secondary}
        placeholder="Search for products or categories ..."
        placeholderTextColor={Colors[colorScheme].textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={event => {
          // Handle search submission
          console.log('Search query:', event.nativeEvent.text);
        }}
        onChangeText={text => {
          // Handle text change
          console.log('Search input:', text);
        }}
      />
      <ThemedButton
        onPress={() => {
          // console.log('Search button pressed');
          // Handle microphone button press on press enable keyboard voice input
          // This is a placeholder for voice input functionality
          console.log('Voice input activated');
        }}
        style={{
          backgroundColor: Colors[colorScheme].background,
        }}
      >
        <IconSymbol name="microphone.fill" size={24} color={Colors.primary} />
      </ThemedButton>
    </ThemedView>
  );
};

export default Search;
