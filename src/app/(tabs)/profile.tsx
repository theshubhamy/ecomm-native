import ScrollView from '@/components/ScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedPressable } from '@/components/ThemedPressable';
import HeaderView from '@/components/ui/HeaderView';
import { IconSymbol, type IconSymbolName } from '@/components/ui/IconSymbol';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signOut } from '@/store/slices/authSlice';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface MenuItemProps {
  icon: IconSymbolName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  colorScheme: 'light' | 'dark';
}

const MenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  colorScheme,
}: MenuItemProps) => {
  return (
    <ThemedPressable
      onPress={onPress}
      style={[
        styles.menuItem,
        { backgroundColor: Colors[colorScheme].backgroundPaper },
      ]}
    >
      <ThemedView style={styles.menuItemLeft}>
        <ThemedView
          style={[
            styles.iconContainer,
            { backgroundColor: Colors.primary + '20' },
          ]}
        >
          <IconSymbol name={icon} size={24} color={Colors.primary} />
        </ThemedView>
        <ThemedView style={styles.menuItemText}>
          <ThemedText type="defaultSemiBold">{title}</ThemedText>
          {subtitle && (
            <ThemedText
              type="xsmall"
              style={{ color: Colors[colorScheme].textSecondary, marginTop: 2 }}
            >
              {subtitle}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
      {showChevron && (
        <IconSymbol
          name="chevron.right"
          size={20}
          color={Colors[colorScheme].textSecondary}
        />
      )}
    </ThemedPressable>
  );
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);
  const colorScheme = useColorScheme();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => dispatch(signOut()),
      },
    ]);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.display_name) {
      return (
        user.user_metadata.display_name.charAt(0).toUpperCase() +
        user.user_metadata.display_name.slice(1)
      );
    }
    return 'User';
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <HeaderView>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Profile</ThemedText>
        </ThemedView>
      </HeaderView>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <ThemedView
          style={[
            styles.userCard,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedView style={styles.userInfo}>
            <ThemedView
              style={[
                styles.userIconContainer,
                { backgroundColor: Colors.primary + '20' },
              ]}
            >
              <IconSymbol name="person.fill" size={40} color={Colors.primary} />
            </ThemedView>
            <ThemedView style={styles.userInfoText}>
              <ThemedText type="subtitle" style={styles.userName}>
                {getUserDisplayName()}
              </ThemedText>
              {user?.email && (
                <ThemedText
                  type="small"
                  style={{
                    color: Colors[colorScheme].textSecondary,
                    marginTop: 4,
                  }}
                >
                  {user.email}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Account Section Card */}
        <ThemedView
          style={[
            styles.sectionCard,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText
            type="xsmall"
            style={[
              styles.sectionTitle,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            ACCOUNT
          </ThemedText>

          <ThemedView style={styles.menuItemsContainer}>
            <MenuItem
              icon="cart.fill"
              title="My Orders"
              subtitle="View order history"
              onPress={() => router.push('/(tabs)/orders')}
              colorScheme={colorScheme}
            />

            <MenuItem
              icon="location.fill"
              title="Saved Addresses"
              subtitle="Manage delivery addresses"
              onPress={() => router.push('/address-selection')}
              colorScheme={colorScheme}
            />
          </ThemedView>
        </ThemedView>

        {/* Settings Section Card */}
        <ThemedView
          style={[
            styles.sectionCard,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText
            type="xsmall"
            style={[
              styles.sectionTitle,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            SETTINGS
          </ThemedText>

          <ThemedView style={styles.menuItemsContainer}>
            <MenuItem
              icon="notification.fill"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => {
                // TODO: Navigate to notifications
                Alert.alert(
                  'Coming Soon',
                  'Notification settings coming soon!',
                );
              }}
              colorScheme={colorScheme}
            />

            <MenuItem
              icon="person.fill"
              title="Account Settings"
              subtitle="Privacy and security"
              onPress={() => {
                // TODO: Navigate to account settings
                Alert.alert('Coming Soon', 'Account settings coming soon!');
              }}
              colorScheme={colorScheme}
            />

            <MenuItem
              icon="paperplane.fill"
              title="Help & Support"
              subtitle="Get help and contact us"
              onPress={() => {
                // TODO: Navigate to help
                Alert.alert('Coming Soon', 'Help & Support coming soon!');
              }}
              colorScheme={colorScheme}
            />
          </ThemedView>
        </ThemedView>

        {/* Sign Out Button */}
        <ThemedButton
          onPress={handleSignOut}
          disabled={isLoading}
          style={[
            styles.signOutButton,
            {
              backgroundColor: Colors.error + '15',
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
        >
          <IconSymbol
            name="chevron.left.forwardslash.chevron.right"
            size={20}
            color={Colors.error}
          />
          <ThemedText
            type="defaultSemiBold"
            style={{ color: Colors.error, marginLeft: 8 }}
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </ThemedText>
        </ThemedButton>

        {/* App Version */}
        <ThemedText
          type="xsmall"
          style={[
            styles.versionText,
            { color: Colors[colorScheme].textSecondary },
          ]}
        >
          QuickShop v1.0.0
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  userIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  userInfoText: {
    flex: 1,
  },

  userCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  userName: {
    textAlign: 'left',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItemsContainer: {
    gap: 8,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    minHeight: 64,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    minHeight: 52,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
