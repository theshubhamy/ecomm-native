import { useThemeColor } from '@/hooks/useThemeColor';
import React, { forwardRef } from 'react';
import {
  GestureResponderEvent,
  TouchableOpacity,
  ViewProps,
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

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  colorName?: ThemeColorName;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewProps['style'];
  disabled?: boolean;
};

export const ThemedButton = forwardRef<any, ThemedViewProps>(
  (
    {
      style,
      lightColor,
      darkColor,
      colorName = 'backgroundPaper',
      disabled,
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
        disabled={disabled}
        {...otherProps}
      />
    );
  },
);

ThemedButton.displayName = 'ThemedButton';
