import ScrollView from '@/components/ScrollView';
import { ThemedPressable } from '@/components/ThemedPressable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
export default function Cart() {
  const [cartItem, setCartItem] = useState<[] | null>(null);
  const colorScheme = useColorScheme();
  return (
    <ThemedView
      style={{
        ...styles.container,
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <HeaderView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Cart</ThemedText>
          <ThemedPressable style={styles.dotsButton}>
            <IconSymbol
              name="ellipsis.fill"
              size={20}
              color={Colors[colorScheme].icon}
            />
          </ThemedPressable>
        </ThemedView>
      </HeaderView>

      <ScrollView>
        {cartItem ? (
          <></>
        ) : (
          <>
            <ThemedView
              style={{ flex: 1, alignItems: 'center', paddingTop: 20 }}
            >
              <ThemedText type="small" style={{ marginTop: 10 }}>
                Your cart is empty.
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1, alignItems: 'center', padding: 20 }}>
              <ThemedText type="small" style={{ textAlign: 'center' }}>
                Start shopping now!
              </ThemedText>
            </ThemedView>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dotsButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: Colors.light.background,
  },
});
