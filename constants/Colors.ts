/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryColor = '#c3e703';
const secondaryColor = '#96d1c7';

export const Colors = {
  primary: primaryColor,
  secondary: secondaryColor,
  black: '#000',
  white: '#fff',
  transparent: 'transparent',
  error: '#ff3b30',
  warning: '#ff9500',
  success: '#4cd964',
  light: {
    textPrimary: '#11181C',
    textSecondary: '#9BA1A6',
    background: '#f5f5f5',
    backgroundPaper: '#fff',
    tint: primaryColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryColor,
  },
  dark: {
    textPrimary: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    backgroundPaper: '#fff',
    tint: primaryColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryColor,
  },
};
