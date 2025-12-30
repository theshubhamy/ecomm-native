import { useEffect, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { useAppDispatch } from './hooks';
import { initializeAuth, setSession } from './slices/authSlice';
import { subscribeToInventoryUpdates } from './slices/productsSlice';
import { supabase } from '@/utils/supabase';
import { requestNotificationPermissions, setupNotificationListeners } from '@/services/notifications';
import { router } from 'expo-router';

// Inner component to handle auth state changes
function AuthListener({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth on mount
    dispatch(initializeAuth());

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(
        setSession({
          session,
          user: session?.user ?? null,
        }),
      );
    });

    // Subscribe to real-time inventory updates
    dispatch(subscribeToInventoryUpdates());

    // Request notification permissions and setup listeners
    requestNotificationPermissions().then((granted) => {
      if (granted) {
        setupNotificationListeners(
          (notification) => {
            console.log('Notification received:', notification);
          },
          (response) => {
            const data = response.notification.request.content.data;
            // Handle notification tap - navigate to relevant screen
            if (data?.type === 'order_confirmed' || data?.type === 'order_delivered') {
              router.push('/(tabs)/orders');
            } else if (data?.type === 'offer_available') {
              router.push('/(tabs)/catalog');
            }
          }
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}

// Main store provider
export function StoreProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <AuthListener>{children}</AuthListener>
    </Provider>
  );
}
