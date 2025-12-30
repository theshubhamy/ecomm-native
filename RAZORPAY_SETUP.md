# Razorpay Integration Setup Guide

This app includes Razorpay payment gateway integration. Follow these steps to complete the setup.

## Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **API Keys**: Get your Key ID and Key Secret from Razorpay Dashboard

## Installation

### For Expo (Current Setup)

The current implementation uses Razorpay Checkout via WebView, which works with Expo without native modules.

No additional packages needed - the integration uses `expo-web-browser` which is already installed.

### For Bare React Native (Optional)

If you're using bare React Native, you can use the native Razorpay SDK:

```bash
npm install react-native-razorpay
```

Then uncomment the native implementation in `src/services/razorpay.ts`.

## Configuration

### 1. Environment Variables

Add to your `.env` file:

```env
EXPO_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
EXPO_PUBLIC_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EXPO_PUBLIC_API_URL=https://your-backend-api.com
```

**Important**: Never expose your Key Secret in the client app. Always use it on your backend.

### 2. Backend API Setup

You need to create backend endpoints for:

#### a) Create Razorpay Order

**Endpoint**: `POST /api/razorpay/create-order`

**Request Body**:
```json
{
  "amount": 10000,  // Amount in paise
  "currency": "INR",
  "receipt": "receipt_123"
}
```

**Response**:
```json
{
  "id": "order_xxxxx",
  "amount": 10000,
  "currency": "INR"
}
```

**Backend Implementation Example (Node.js)**:
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const order = await razorpay.orders.create({
      amount,
      currency: currency || 'INR',
      receipt,
      payment_capture: 1,
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### b) Verify Payment

**Endpoint**: `POST /api/razorpay/verify-payment`

**Request Body**:
```json
{
  "order_id": "order_xxxxx",
  "payment_id": "pay_xxxxx",
  "signature": "signature_xxxxx"
}
```

**Response**:
```json
{
  "verified": true
}
```

**Backend Implementation Example (Node.js)**:
```javascript
const crypto = require('crypto');

app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    const isVerified = generated_signature === signature;

    res.json({ verified: isVerified });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testing

### Test Mode

1. Use Razorpay Test Mode keys from your dashboard
2. Test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

### Production Mode

1. Switch to Production keys in Razorpay Dashboard
2. Update environment variables
3. Test with real payment methods

## Payment Flow

1. User selects payment method (Card/UPI/Wallet)
2. App creates Razorpay order via backend API
3. Razorpay Checkout opens in WebView
4. User completes payment
5. Payment response is verified on backend
6. Order status is updated in database

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never expose Key Secret**: Always keep it on your backend
2. **Always verify signatures**: Payment verification must be done on backend
3. **Use HTTPS**: Always use HTTPS in production
4. **Validate amounts**: Verify payment amount matches order amount
5. **Handle webhooks**: Set up Razorpay webhooks for payment status updates

## Webhook Setup

Set up Razorpay webhooks to receive payment status updates:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-api.com/api/razorpay/webhook`
3. Subscribe to events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`

## Troubleshooting

### Payment not opening
- Check if `EXPO_PUBLIC_RAZORPAY_KEY_ID` is set
- Verify backend API is accessible
- Check network connectivity

### Payment verification fails
- Ensure backend is using correct Key Secret
- Verify signature generation matches Razorpay's algorithm
- Check order_id and payment_id are correct

### WebView issues
- For better UX, consider using native Razorpay SDK in bare React Native
- Ensure WebView permissions are granted

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com

