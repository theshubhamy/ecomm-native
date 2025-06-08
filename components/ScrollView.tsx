import type { PropsWithChildren } from 'react';
import type { ScrollViewProps } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';

import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

type Props = PropsWithChildren<ScrollViewProps>;

export default function ScrollView({ style, children, ...otherProps }: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const bottom = useBottomTabOverflow();

  return (
    <Animated.ScrollView
      ref={scrollRef}
      scrollEventThrottle={16}
      scrollIndicatorInsets={{ bottom }}
      contentContainerStyle={[{ paddingBottom: bottom }, style]}
      {...otherProps}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Animated.ScrollView>
  );
}
