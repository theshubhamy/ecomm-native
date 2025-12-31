import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { StoreProvider } from '@/store/StoreProvider';
import { useAppSelector } from '@/store/hooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StoreProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}

function RootNavigator() {
  const user = useAppSelector(state => state.auth.user);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Stack>
      <Stack.Protected guard={!!user}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
            },
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
        <Stack.Screen
          name="orders"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
        <Stack.Screen
          name="order/[id]"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
        <Stack.Screen
          name="coupons"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
        <Stack.Screen
          name="address-selection"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors[colorScheme].backgroundPaper,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          }}
        />
      </Stack.Protected>

      <Stack.Screen
        name="+not-found"
        options={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors[colorScheme].backgroundPaper,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        }}
      />
    </Stack>
  );
}
