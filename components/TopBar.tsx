import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Location from './Location';
import Search from './Search';
import { ThemedPressable } from './ThemedPressable';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
const TopBar = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <ThemedView
      style={{
        ...styles.container,
        paddingTop: insets.top,
      }}
    >
      <ThemedView style={styles.header}>
        <Image
          source={require('../assets/images/icon.png')}
          style={{
            width: 40,
            height: 40,
            backgroundColor: Colors[colorScheme ?? 'light'].backgroundPaper,
          }}
          contentFit="cover"
          transition={1000}
          alt="App Icon"
        />
        <Location />
        <ThemedPressable style={styles.notification}>
          <IconSymbol
            name="notification.fill"
            size={28}
            color={Colors[colorScheme ?? 'light'].icon}
          />
        </ThemedPressable>
      </ThemedView>
      <Search />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  header: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
  },
  notification: {
    padding: 8,
    borderRadius: 9999,
    shadowColor: Colors.light.tint,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
export default TopBar;
