import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
        style={{ color: Colors[colorScheme].textSecondary }}
      >
        Delivery address
      </ThemedText>
      <ThemedText type="small"> Purnea Bihar, 854301</ThemedText>
    </ThemedPressable>
  );
};

export default Location;
