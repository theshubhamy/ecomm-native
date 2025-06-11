import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type ColorSchemeName = 'light' | 'dark';
/**
 * Custom hook to get the current color scheme.
 * Ensures consistent return during hydration for web static rendering.
 */
export function useColorScheme(): NonNullable<ColorSchemeName> {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated && colorScheme) {
    return colorScheme === 'dark' ? 'dark' : 'light';
  }

  return 'light';
}
