import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ThemedButton } from './ThemedButton';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const colorScheme = useColorScheme();

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ThemedView style={styles.content}>
        <ThemedView
          style={[
            styles.iconContainer,
            { backgroundColor: Colors.error + '20' },
          ]}
        >
          <IconSymbol
            name="chevron.left.forwardslash.chevron.right"
            size={48}
            color={Colors.error}
          />
        </ThemedView>

        <ThemedText type="subtitle" style={styles.title}>
          Something went wrong
        </ThemedText>

        <ThemedText
          type="small"
          style={[styles.message, { color: Colors[colorScheme].textSecondary }]}
        >
          We are sorry, but something unexpected happened. Please try again.
        </ThemedText>

        {error && __DEV__ && (
          <ThemedView
            style={[
              styles.errorDetails,
              { backgroundColor: Colors[colorScheme].backgroundPaper },
            ]}
          >
            <ThemedText
              type="xsmall"
              style={{ color: Colors.error, fontFamily: 'monospace' }}
            >
              {error.toString()}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedButton
          onPress={onReset}
          style={[styles.resetButton, { backgroundColor: Colors.primary }]}
        >
          <ThemedText type="defaultSemiBold" style={{ color: Colors.black }}>
            Try Again
          </ThemedText>
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorDetails: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    maxHeight: 200,
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
});
