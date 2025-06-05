import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
const TopBar = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <ThemedView
      style={{
        ...styles.container,
        paddingTop: insets.top,
        backgroundColor: Colors[colorScheme ?? 'light'].backgroundPaper,
      }}
    >
      <ThemedText>TopBar</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  header: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
export default TopBar;
