// Razorpay payment integration service
// For Expo: Uses Razorpay Checkout via WebView
// For bare React Native: Can use react-native-razorpay package

import * as WebBrowser from 'expo-web-browser';

export interface RazorpayOptions {
  key: string; // Razorpay Key ID
  amount: number; // Amount in smallest currency unit (paise for INR)
  currency?: string; // Currency code (default: INR)
  name?: string; // Merchant name
  description?: string; // Payment description
  order_id?: string; // Razorpay order ID
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
  notes?: Record<string, string>;
  handler?: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id: string;
  };
}

// Create Razorpay order (should be done on backend for security)
// This is a client-side helper that calls your backend API
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  orderId?: string,
): Promise<{ id: string; amount: number; currency: string }> {
  try {
    // TODO: Replace with your backend API endpoint
    // This should call your backend which creates the Razorpay order
    const response = await fetch(
      `${
        process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com'
      }/api/razorpay/create-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          receipt: orderId || `receipt_${Date.now()}`,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Fallback: For development, you can use a mock order
    // In production, always use backend API
    console.warn('Using mock Razorpay order (development only)', error);
    return {
      id: `order_${Date.now()}`,
      amount: amount * 100,
      currency,
    };
  }
}

// Open Razorpay Checkout (WebView approach for Expo)
// Note: For production, consider using a deep linking approach to handle payment callbacks
export async function openRazorpayCheckout(
  options: RazorpayOptions,
): Promise<RazorpayPaymentResponse> {
  return new Promise((resolve, reject) => {
    try {
      // Build Razorpay Checkout URL with callback
      const callbackUrl = `${
        process.env.EXPO_PUBLIC_APP_SCHEME || 'ecommnative'
      }://payment-callback`;

      const params = new URLSearchParams({
        key_id: options.key,
        amount: options.amount.toString(),
        currency: options.currency || 'INR',
        name: options.name || 'Merchant',
        description: options.description || 'Payment',
        ...(options.order_id && { order_id: options.order_id }),
        ...(options.prefill?.email && { prefill_email: options.prefill.email }),
        ...(options.prefill?.contact && {
          prefill_contact: options.prefill.contact,
        }),
        ...(options.prefill?.name && { prefill_name: options.prefill.name }),
        ...(options.theme?.color && { theme_color: options.theme.color }),
        callback_url: callbackUrl,
      });

      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?${params.toString()}`;

      // Open in WebView
      WebBrowser.openBrowserAsync(checkoutUrl, {
        showTitle: true,
        toolbarColor: options.theme?.color || '#3399cc',
        enableBarCollapsing: false,
      })
        .then(result => {
          // Handle the result
          if (result.type === 'cancel') {
            reject(new Error('Payment cancelled by user'));
          } else {
            // Note: In production, you should:
            // 1. Set up deep linking to handle payment callback
            // 2. Extract payment_id, order_id, and signature from callback URL
            // 3. Verify payment on backend before resolving

            // For now, this is a placeholder
            // You'll need to implement deep linking to get the actual payment response
            // See RAZORPAY_SETUP.md for details
            reject(
              new Error(
                'Payment callback handling required. Please implement deep linking.',
              ),
            );
          }
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      reject(
        error instanceof Error
          ? error
          : new Error('Failed to open Razorpay checkout'),
      );
    }
  });
}

// Verify payment signature (should be done on backend)
export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  try {
    // TODO: Replace with your backend API endpoint
    // Payment verification should always be done on backend for security
    const response = await fetch(
      `${
        process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com'
      }/api/razorpay/verify-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: paymentId,
          signature,
        }),
      },
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

// For native React Native (if using react-native-razorpay)
// Uncomment and use this if you're using bare React Native
/*
import RazorpayCheckout from 'react-native-razorpay';

export async function openRazorpayNative(options: RazorpayOptions): Promise<RazorpayPaymentResponse> {
  return new Promise((resolve, reject) => {
    RazorpayCheckout.open({
      description: options.description || 'Payment',
      image: options.image,
      currency: options.currency || 'INR',
      key: options.key,
      amount: options.amount,
      name: options.name || 'Merchant',
      order_id: options.order_id,
      prefill: options.prefill,
      theme: options.theme,
    })
      .then((data: RazorpayPaymentResponse) => {
        resolve(data);
      })
      .catch((error: RazorpayError) => {
        reject(new Error(error.description || 'Payment failed'));
      });
  });
}
*/
