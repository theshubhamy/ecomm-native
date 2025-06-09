import ScrollView from '@/components/ScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/context';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function Profile() {
  const insets = useSafeAreaInsets();
  const { signOut } = useSession();
  return (
    <ScrollView style={{ paddingTop: insets.top }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedButton onPress={() => signOut()}>
          <ThemedText type="title">Sign Out</ThemedText>
        </ThemedButton>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8,
  },
});
