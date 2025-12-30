# Push Notifications Setup Guide

This app includes a notification service structure. To enable push notifications, follow these steps:

## Installation

1. Install the required package:
```bash
npx expo install expo-notifications
```

2. The notification service is already set up in `src/services/notifications.ts`

## Configuration

### iOS Setup

1. Add the following to `app.json` (already added):
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./src/assets/images/icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

2. For iOS, you'll need to configure push notification certificates in your Apple Developer account.

### Android Setup

1. The notification channel is automatically configured in the service.

2. For Android, you'll need to configure Firebase Cloud Messaging (FCM) if you want remote push notifications.

## Environment Variables

Add to your `.env` file:
```
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

## Usage

The notification service is automatically initialized when the app starts. It handles:
- Order confirmations
- Order status updates
- Payment notifications
- Offer notifications

## Testing

To test notifications locally:
1. Request permissions when the app starts
2. Notifications will be sent for order updates
3. Tap notifications to navigate to relevant screens

## Remote Push Notifications

For remote push notifications (when app is closed), you'll need to:
1. Set up Expo Push Notification service
2. Store user push tokens in your database
3. Send notifications from your backend using Expo's push notification API

## Current Implementation

The current implementation uses local notifications. To enable remote push notifications:
1. Get user's push token using `getPushToken()`
2. Store the token in your Supabase database
3. Set up a backend service to send push notifications via Expo's API

