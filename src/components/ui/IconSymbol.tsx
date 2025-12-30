// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'cart.fill': 'shopping-cart',
  'managesearch.fill': 'manage-search',
  'favorite.fill': 'favorite',
  'person.fill': 'person',
  'ellipsis.fill': 'more-vert',
  'ellipsis.circle.fill': 'more-horiz',
  'notification.fill': 'notifications',
  'location.fill': 'location-on',
  'search.fill': 'search',
  'microphone.fill': 'mic',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'plus': 'add',
  'minus': 'remove',
  'pencil': 'edit',
  'trash.fill': 'delete',
  'checkmark.square.fill': 'check-box',
  'square': 'check-box-outline-blank',
  'creditcard.fill': 'credit-card',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'square.grid.2x2': 'apps',
  'square.grid.2x2.fill': 'apps',
  'tag': 'local-offer',
  'tag.fill': 'local-offer',
} as const;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
