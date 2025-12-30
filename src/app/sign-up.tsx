import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signUp, clearError } from '@/store/slices/authSlice';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SignUp() {
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector(state => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Navigate to home when user is authenticated
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  // Show error alert when error occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Sign Up Failed', error, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  const validateName = (nameValue: string) => {
    if (!nameValue.trim()) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }));
      return false;
    }
    if (nameValue.trim().length < 2) {
      setErrors(prev => ({
        ...prev,
        name: 'Name must be at least 2 characters',
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, name: '' }));
    return true;
  };

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address',
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (passwordValue: string) => {
    if (!passwordValue) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (passwordValue.length < 6) {
      setErrors(prev => ({
        ...prev,
        password: 'Password must be at least 6 characters',
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const handleSignUp = async () => {
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    dispatch(signUp({ name, email, password }));
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Decoration */}
      <ThemedView style={styles.backgroundDecoration}>
        <ThemedView
          style={[
            styles.decorativeCircle1,
            { backgroundColor: Colors.primary + '15' },
          ]}
        />
        <ThemedView
          style={[
            styles.decorativeCircle2,
            { backgroundColor: Colors.secondary + '10' },
          ]}
        />
      </ThemedView>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Branding */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.logoContainer}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </ThemedView>
          <ThemedText type="title" style={styles.appName}>
            QuickShop
          </ThemedText>
          <ThemedText
            type="small"
            style={[
              styles.tagline,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Create your account to get started
          </ThemedText>
        </ThemedView>

        {/* Sign Up Form */}
        <ThemedView
          style={[
            styles.formContainer,
            { backgroundColor: Colors[colorScheme].backgroundPaper },
          ]}
        >
          <ThemedText type="subtitle" style={styles.welcomeText}>
            Create Account
          </ThemedText>
          <ThemedText
            type="small"
            style={[
              styles.subtitle,
              { color: Colors[colorScheme].textSecondary },
            ]}
          >
            Sign up to start shopping
          </ThemedText>

          {/* Name Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText
              type="xsmall"
              style={[
                styles.label,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              Full Name
            </ThemedText>
            <ThemedView
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  borderColor: errors.name
                    ? Colors.error
                    : Colors[colorScheme].textSecondary + '30',
                },
              ]}
            >
              <IconSymbol
                name="person.fill"
                size={20}
                color={Colors[colorScheme].textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme].textPrimary,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (errors.name) validateName(text);
                }}
                onBlur={() => validateName(name)}
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect={false}
              />
            </ThemedView>
            {errors.name ? (
              <ThemedText type="xsmall" style={styles.errorText}>
                {errors.name}
              </ThemedText>
            ) : null}
          </ThemedView>

          {/* Email Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText
              type="xsmall"
              style={[
                styles.label,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              Email Address
            </ThemedText>
            <ThemedView
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  borderColor: errors.email
                    ? Colors.error
                    : Colors[colorScheme].textSecondary + '30',
                },
              ]}
            >
              <IconSymbol
                name="envelope.fill"
                size={20}
                color={Colors[colorScheme].textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme].textPrimary,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (errors.email) validateEmail(text);
                }}
                onBlur={() => validateEmail(email)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                autoCorrect={false}
              />
            </ThemedView>
            {errors.email ? (
              <ThemedText type="xsmall" style={styles.errorText}>
                {errors.email}
              </ThemedText>
            ) : null}
          </ThemedView>

          {/* Password Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText
              type="xsmall"
              style={[
                styles.label,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              Password
            </ThemedText>
            <ThemedView
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  borderColor: errors.password
                    ? Colors.error
                    : Colors[colorScheme].textSecondary + '30',
                },
              ]}
            >
              <IconSymbol
                name="lock.fill"
                size={20}
                color={Colors[colorScheme].textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme].textPrimary,
                  },
                ]}
                placeholder="Create a password"
                placeholderTextColor={Colors[colorScheme].textSecondary}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.password) validatePassword(text);
                }}
                onBlur={() => validatePassword(password)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <IconSymbol
                  name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color={Colors[colorScheme].textSecondary}
                />
              </TouchableOpacity>
            </ThemedView>
            {errors.password ? (
              <ThemedText type="xsmall" style={styles.errorText}>
                {errors.password}
              </ThemedText>
            ) : null}
          </ThemedView>

          {/* Sign Up Button */}
          <ThemedButton
            onPress={handleSignUp}
            disabled={isLoading}
            style={[
              styles.signUpButton,
              {
                backgroundColor: Colors.primary,
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.black} />
            ) : (
              <ThemedText
                type="defaultSemiBold"
                style={{ color: Colors.black }}
              >
                Create Account
              </ThemedText>
            )}
          </ThemedButton>

          {/* Divider */}
          <ThemedView style={styles.divider}>
            <ThemedView
              style={[
                styles.dividerLine,
                { backgroundColor: Colors[colorScheme].textSecondary + '30' },
              ]}
            />
            <ThemedText
              type="xsmall"
              style={[
                styles.dividerText,
                { color: Colors[colorScheme].textSecondary },
              ]}
            >
              OR
            </ThemedText>
            <ThemedView
              style={[
                styles.dividerLine,
                { backgroundColor: Colors[colorScheme].textSecondary + '30' },
              ]}
            />
          </ThemedView>

          {/* Sign In Link */}
          <ThemedView style={styles.signInContainer}>
            <ThemedText
              type="small"
              style={{ color: Colors[colorScheme].textSecondary }}
            >
              Already have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <ThemedText
                type="small"
                style={{ color: Colors.primary, fontWeight: '600' }}
              >
                Sign In
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: -50,
    left: -50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
  },
  formContainer: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    height: 44,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: Colors.error,
    marginTop: 4,
    fontSize: 12,
  },
  signUpButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 20,
  },
});
