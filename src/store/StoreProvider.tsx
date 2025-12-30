import { useEffect, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { useAppDispatch } from './hooks';
import { initializeAuth, setSession } from './slices/authSlice';
import { supabase } from '@/utils/supabase';

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
