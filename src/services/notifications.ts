// Notification service for handling push notifications
// Note: Remote push notifications require a development build (not Expo Go)
// Local notifications work in Expo Go

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Configure notification handler
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.warn('Could not set notification handler:', error);
}

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android (only if not in Expo Go)
    if (Platform.OS === 'android' && !isExpoGo) {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      } catch (error) {
        console.warn('Could not set Android notification channel:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Get push notification token
// Note: This requires a development build (not Expo Go) for Android
export async function getPushToken(): Promise<string | null> {
  try {
    // Push tokens are not available in Expo Go for Android
    if (isExpoGo && Platform.OS === 'android') {
      console.warn(
        'Push notifications are not available in Expo Go for Android. Use a development build instead.',
      );
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    if (!projectId) {
      console.warn(
        'EXPO_PUBLIC_PROJECT_ID is not set. Push tokens require a project ID.',
      );
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    // Gracefully handle errors (e.g., in Expo Go where push tokens aren't available)
    if (
      error instanceof Error &&
      (error.message.includes('expo-notifications') ||
        error.message.includes('development build'))
    ) {
      console.warn(
        'Push notifications require a development build. Local notifications are still available.',
      );
    } else {
      console.error('Error getting push token:', error);
    }
    return null;
  }
}

// Schedule a local notification
// Note: Local notifications work in Expo Go
export async function scheduleLocalNotification(
  notification: NotificationData,
  trigger?: Notifications.NotificationTriggerInput,
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted, skipping notification');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound !== false,
        priority: notification.priority || 'default',
      },
      trigger: trigger || null, // null means show immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    // Return null instead of throwing to gracefully handle errors
    return null;
  }
}

// Send immediate notification
// Note: Works in Expo Go (local notifications only)
export async function sendNotification(
  notification: NotificationData,
): Promise<string | null> {
  return scheduleLocalNotification(notification);
}

// Cancel a notification
export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

// Notification types for order updates
export const NotificationTypes = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PREPARING: 'order_preparing',
  ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  OFFER_AVAILABLE: 'offer_available',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
} as const;

// Helper functions for specific notification types
// All functions return null if notification fails (e.g., in Expo Go without permissions)
export async function notifyOrderConfirmed(
  orderNumber: string,
): Promise<string | null> {
  return sendNotification({
    title: 'Order Confirmed!',
    body: `Your order #${orderNumber} has been confirmed and is being prepared.`,
    data: {
      type: NotificationTypes.ORDER_CONFIRMED,
      orderNumber,
    },
    priority: 'high',
  });
}

export async function notifyOrderPreparing(
  orderNumber: string,
): Promise<string | null> {
  return sendNotification({
    title: 'Order Being Prepared',
    body: `Your order #${orderNumber} is being prepared.`,
    data: {
      type: NotificationTypes.ORDER_PREPARING,
      orderNumber,
    },
  });
}

export async function notifyOrderOutForDelivery(
  orderNumber: string,
): Promise<string | null> {
  return sendNotification({
    title: 'Order Out for Delivery',
    body: `Your order #${orderNumber} is on its way!`,
    data: {
      type: NotificationTypes.ORDER_OUT_FOR_DELIVERY,
      orderNumber,
    },
    priority: 'high',
  });
}

export async function notifyOrderDelivered(
  orderNumber: string,
): Promise<string | null> {
  return sendNotification({
    title: 'Order Delivered!',
    body: `Your order #${orderNumber} has been delivered. Enjoy!`,
    data: {
      type: NotificationTypes.ORDER_DELIVERED,
      orderNumber,
    },
    priority: 'high',
  });
}

export async function notifyOrderCancelled(
  orderNumber: string,
): Promise<string | null> {
  return sendNotification({
    title: 'Order Cancelled',
    body: `Your order #${orderNumber} has been cancelled.`,
    data: {
      type: NotificationTypes.ORDER_CANCELLED,
      orderNumber,
    },
  });
}

export async function notifyOfferAvailable(
  offerTitle: string,
): Promise<string | null> {
  return sendNotification({
    title: 'New Offer Available!',
    body: `${offerTitle} - Check it out now!`,
    data: {
      type: NotificationTypes.OFFER_AVAILABLE,
      offerTitle,
    },
  });
}

export async function notifyPaymentSuccess(
  orderNumber: string,
  amount: number,
): Promise<string | null> {
  return sendNotification({
    title: 'Payment Successful',
    body: `Payment of $${amount.toFixed(
      2,
    )} for order #${orderNumber} was successful.`,
    data: {
      type: NotificationTypes.PAYMENT_SUCCESS,
      orderNumber,
      amount,
    },
    priority: 'high',
  });
}

export async function notifyPaymentFailed(
  orderNumber: string,
): Promise<string | null> {
  return sendNotification({
    title: 'Payment Failed',
    body: `Payment for order #${orderNumber} failed. Please try again.`,
    data: {
      type: NotificationTypes.PAYMENT_FAILED,
      orderNumber,
    },
    priority: 'high',
  });
}

// Set up notification listeners
// Note: Works in Expo Go for local notifications
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void,
) {
  try {
    // Listener for notifications received while app is in foreground
    const receivedListener = Notifications.addNotificationReceivedListener(
      notification => {
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      },
    );

    // Listener for when user taps on a notification
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(response => {
        if (onNotificationTapped) {
          onNotificationTapped(response);
        }
      });

    return {
      remove: () => {
        try {
          receivedListener.remove();
          responseListener.remove();
        } catch (error) {
          console.warn('Error removing notification listeners:', error);
        }
      },
    };
  } catch (error) {
    console.warn('Error setting up notification listeners:', error);
    // Return a no-op remove function if setup fails
    return {
      remove: () => {},
    };
  }
}
