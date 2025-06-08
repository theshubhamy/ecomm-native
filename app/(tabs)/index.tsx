import Categories from '@/components/Categories';
import ScrollView from '@/components/ScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopBar from '@/components/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet } from 'react-native';
export default function HomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <ThemedView
      style={{
        ...styles.container,
        backgroundColor: Colors[colorScheme ?? 'light'].background,
      }}
    >
      <TopBar />
      <ScrollView>
        <ThemedView style={styles.bodyContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="subtitle">Categories</ThemedText>
            <ThemedView
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <ThemedText
                type="xsmall"
                style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}
              >
                See All
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={Colors[colorScheme ?? 'light'].icon}
              />
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.stepContainer}>
            <Categories />
          </ThemedView>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="subtitle">Flash Sale</ThemedText>
            <ThemedView
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <ThemedText
                type="xsmall"
                style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}
              >
                See All
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={Colors[colorScheme ?? 'light'].icon}
              />
            </ThemedView>
          </ThemedView>
          {/* Products */}
          <ThemedView style={styles.stepContainer}>
            <ThemedView
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThemedText type="subtitle" style={{ marginTop: 8 }}>
                Coming Soon!
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  bodyContainer: {
    flex: 1,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 16,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 10,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
