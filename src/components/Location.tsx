import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import React from 'react';
import { ThemedPressable } from './ThemedPressable';
import { ThemedText } from './ThemedText';

const Location = () => {
  const colorScheme = useColorScheme();
  return (
    <ThemedPressable
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
      }}
    >
      <ThemedText
        type="xsmall"
        style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}
      >
        Delivery address
      </ThemedText>
      <ThemedText type="small"> Purnea Bihar, 854301</ThemedText>
    </ThemedPressable>
  );
};

export default Location;
