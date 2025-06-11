import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorSchemeName = 'light' | 'dark';

/**
 * Custom hook to get the current color scheme.
 * Always returns 'light' or 'dark' to avoid null issues.
 */
export function useColorScheme(): ColorSchemeName {
  const colorScheme = useRNColorScheme();

  // Ensure a valid return type by falling back to 'light'
  return colorScheme === 'dark' ? 'dark' : 'light';
}
