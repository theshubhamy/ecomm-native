import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopBar from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView backgroundColor={{ light: '#f5f5f5f5', dark: '#050505' }}>
      <TopBar />
      {/* categories */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="subtitle">Categories</ThemedText>
        <IconSymbol name="chevron.right" size={24} color={''} />
      </ThemedView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="subtitle">Flash Sale</ThemedText>
        <IconSymbol name="chevron.right" size={24} color={''} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
