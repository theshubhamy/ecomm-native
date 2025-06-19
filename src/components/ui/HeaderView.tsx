import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';

type TopBarProps = {
  children: ReactNode;
};

const HeaderView = ({ children }: TopBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={{
        ...styles.container,
        paddingTop: insets.top,
      }}
    >
      {children}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default HeaderView;
