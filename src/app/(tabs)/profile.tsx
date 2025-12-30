import ScrollView from '@/components/ScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signOut } from '@/store/slices/authSlice';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const handleSignOut = () => {
    dispatch(signOut());
  };

  return (
    <ScrollView style={{ paddingTop: insets.top }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
        {user && (
          <ThemedView style={styles.userInfo}>
            <ThemedText type="subtitle">Email: {user.email}</ThemedText>
            <ThemedText type="small">User ID: {user.id}</ThemedText>
          </ThemedView>
        )}
        <ThemedButton onPress={handleSignOut} disabled={isLoading}>
          <ThemedText type="title">{isLoading ? 'Signing out...' : 'Sign Out'}</ThemedText>
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
