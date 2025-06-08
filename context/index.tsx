import { useStorageState } from '@/hooks/useStorageState';
import { createContext, useContext, type PropsWithChildren } from 'react';

// Define the shape of the auth context
type AuthContextType = {
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
};

// Create the context with undefined initially
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access the context
export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession must be used within a <SessionProvider />');
  }
  return context;
}

// Session provider component
function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signIn: () => setSession('xxx'),
        signOut: () => setSession(null),
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default SessionProvider;
