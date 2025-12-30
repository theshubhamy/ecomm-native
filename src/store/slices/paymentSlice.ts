import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/utils/supabase';
import {
  createRazorpayOrder,
  openRazorpayCheckout,
  verifyRazorpayPayment,
  RazorpayPaymentResponse,
} from '@/services/razorpay';

export type PaymentMethod = 'card' | 'cash' | 'upi' | 'wallet';

export interface PaymentIntent {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  payment_gateway_response?: any;
  created_at: string;
  updated_at: string;
}

interface PaymentState {
  currentPayment: PaymentIntent | null;
  isLoading: boolean;
  error: string | null;
  paymentMethods: PaymentMethod[];
}

const initialState: PaymentState = {
  currentPayment: null,
  isLoading: false,
  error: null,
  paymentMethods: ['card', 'upi', 'wallet', 'cash'],
};

// Create payment intent
export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async (
    {
      orderId,
      amount,
      paymentMethod,
      userEmail,
      userName,
      userPhone,
    }: {
      orderId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      userEmail?: string;
      userName?: string;
      userPhone?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // For cash payments, mark as succeeded immediately
      if (paymentMethod === 'cash') {
        const paymentData = {
          order_id: orderId,
          amount,
          currency: 'INR',
          payment_method: paymentMethod,
          status: 'succeeded',
        };

        const { data, error } = await supabase
          .from('payments')
          .insert(paymentData)
          .select()
          .single();

        if (error) {
          return rejectWithValue(error.message);
        }

        return data as PaymentIntent;
      }

      // For online payments (Card, UPI, Wallet), create Razorpay order
      const razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        return rejectWithValue('Razorpay Key ID not configured');
      }

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(amount, 'INR', orderId);

      // Store payment intent in database
      const paymentData = {
        order_id: orderId,
        amount,
        currency: 'INR',
        payment_method: paymentMethod,
        status: 'pending',
        payment_gateway_response: {
          razorpay_order_id: razorpayOrder.id,
          gateway: 'razorpay',
        },
      };

      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      // Return payment intent with Razorpay order details
      return {
        ...data,
        razorpay_order_id: razorpayOrder.id,
        razorpay_key_id: razorpayKeyId,
        user_email: userEmail,
        user_name: userName,
        user_phone: userPhone,
      } as PaymentIntent & {
        razorpay_order_id: string;
        razorpay_key_id: string;
        user_email?: string;
        user_name?: string;
        user_phone?: string;
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create payment intent'
      );
    }
  }
);

// Process payment with Razorpay (for online payment methods)
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async (
    {
      paymentIntentId,
      razorpayOrderId,
      razorpayKeyId,
      userEmail,
      userName,
      userPhone,
      orderDescription,
    }: {
      paymentIntentId: string;
      razorpayOrderId: string;
      razorpayKeyId: string;
      userEmail?: string;
      userName?: string;
      userPhone?: string;
      orderDescription?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Get payment amount from database
      const { data: paymentData } = await supabase
        .from('payments')
        .select('amount')
        .eq('id', paymentIntentId)
        .single();

      if (!paymentData) {
        throw new Error('Payment intent not found');
      }

      // Open Razorpay Checkout
      const paymentResponse = await openRazorpayCheckout({
        key: razorpayKeyId,
        amount: paymentData.amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Quick Commerce',
        description: orderDescription || 'Order Payment',
        order_id: razorpayOrderId,
        prefill: {
          email: userEmail,
          contact: userPhone,
          name: userName,
        },
        theme: {
          color: '#3399cc',
        },
      });

      // Verify payment signature
      const isVerified = await verifyRazorpayPayment(
        razorpayOrderId,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_signature
      );

      if (!isVerified) {
        // Mark payment as failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            payment_gateway_response: {
              error: 'Payment verification failed',
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentIntentId);

        return rejectWithValue('Payment verification failed');
      }

      // Update payment status to succeeded
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          payment_gateway_response: {
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            verified: true,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentIntentId)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as PaymentIntent;
    } catch (error) {
      // Mark payment as failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          payment_gateway_response: {
            error: error instanceof Error ? error.message : 'Payment processing failed',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentIntentId);

      return rejectWithValue(
        error instanceof Error ? error.message : 'Payment processing failed'
      );
    }
  }
);

// Verify payment status
export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async (paymentIntentId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentIntentId)
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data as PaymentIntent;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to verify payment'
      );
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      // Payment method selection is handled in checkout
    },
    clearPayment: (state) => {
      state.currentPayment = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create payment intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Process payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentPayment?.id === action.payload.id) {
          state.currentPayment = action.payload;
        }
        state.error = null;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPaymentMethod, clearPayment, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;

