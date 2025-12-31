import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView';

type TopBarProps = {
  children: ReactNode;
};

const HeaderView = ({ children }: TopBarProps) => {
  return (
    <ThemedView
      style={{
        ...styles.container,
      }}
    >
      {children}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default HeaderView;
