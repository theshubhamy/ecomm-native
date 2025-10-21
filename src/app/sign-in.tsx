import { router } from 'expo-router';

import { useSession } from '@/context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SignIn() {
  const { signIn } = useSession();
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <ThemedText
        onPress={() => {
          signIn();
          router.replace('/');
        }}
      >
        Sign In
      </ThemedText>
    </ThemedView>
  );
}
