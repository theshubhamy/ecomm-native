import { useThemeColor } from '@/hooks/useThemeColor';
import React, { forwardRef, ReactNode } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

type ThemeColorName =
  | 'background'
  | 'backgroundPaper'
  | 'tint'
  | 'icon'
  | 'tabIconDefault'
  | 'tabIconSelected'
  | 'textPrimary'
  | 'textSecondary';

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  colorName?: ThemeColorName;
  children?: ReactNode;
};

export const ThemedButton = forwardRef<TouchableOpacity, ThemedButtonProps>(
  (
    {
      style,
      lightColor,
      darkColor,
      colorName = 'backgroundPaper',
      children,
      ...otherProps
    },
    ref,
  ) => {
    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      colorName || 'backgroundPaper',
    );

    return (
      <TouchableOpacity
        ref={ref}
        style={[{ backgroundColor }, style]}
        accessible={true}
        accessibilityRole="button"
        {...otherProps}
      >
        {children}
      </TouchableOpacity>
    );
  },
);

ThemedButton.displayName = 'ThemedButton';
