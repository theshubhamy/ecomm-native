import { ThemedPressable } from '@/components/ThemedPressable';
import { ThemedView } from '@/components/ThemedView';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import Location from './Location';
import Search from './Search';
const TopBar = () => {
  const colorScheme = useColorScheme();
  return (
    <HeaderView>
      <ThemedView style={styles.header}>
        <Image
          source={require('../assets/images/icon.png')}
          style={{
            width: 40,
            height: 40,
            backgroundColor: Colors[colorScheme].backgroundPaper,
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
            color={Colors[colorScheme].icon}
          />
        </ThemedPressable>
      </ThemedView>
      <Search />
    </HeaderView>
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
