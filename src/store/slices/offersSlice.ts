import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/utils/supabase';

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  promo_code?: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  image_url?: string;
  category_id?: string;
  product_id?: string;
}

interface OffersState {
  offers: Offer[];
  activeOffers: Offer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OffersState = {
  offers: [],
  activeOffers: [],
  isLoading: false,
  error: null,
};

// Fetch all active offers
export const fetchOffers = createAsyncThunk(
  'offers/fetchOffers',
  async (_, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', now)
        .lte('valid_from', now)
        .order('discount_value', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      return (data || []) as Offer[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch offers',
      );
    }
  },
);

// Validate promo code
export const validatePromoCode = createAsyncThunk(
  'offers/validatePromoCode',
  async (code: string, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('promo_code', code.toUpperCase())
        .eq('is_active', true)
        .gte('valid_until', now)
        .lte('valid_from', now)
        .single();

      if (error || !data) {
        return rejectWithValue('Invalid or expired promo code');
      }

      return data as Offer;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to validate promo code',
      );
    }
  },
);

// Calculate discount amount
export const calculateDiscount = (
  offer: Offer | null,
  orderAmount: number,
): number => {
  if (!offer) return 0;

  // Check minimum order amount
  if (offer.min_order_amount && orderAmount < offer.min_order_amount) {
    return 0;
  }

  let discount = 0;

  if (offer.discount_type === 'percentage') {
    discount = (orderAmount * offer.discount_value) / 100;
    // Apply max discount if specified
    if (offer.max_discount && discount > offer.max_discount) {
      discount = offer.max_discount;
    }
  } else {
    discount = offer.discount_value;
  }

  // Don't exceed order amount
  return Math.min(discount, orderAmount);
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearOffers: state => {
      state.offers = [];
      state.activeOffers = [];
    },
  },
  extraReducers: builder => {
    // Fetch offers
    builder
      .addCase(fetchOffers.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.offers = action.payload;
        state.activeOffers = action.payload;
        state.error = null;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Validate promo code
    builder
      .addCase(validatePromoCode.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add validated offer to active offers if not already present
        const existingOffer = state.activeOffers.find(
          o => o.id === action.payload.id,
        );
        if (!existingOffer) {
          state.activeOffers.push(action.payload);
        }
        state.error = null;
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearOffers } = offersSlice.actions;
export default offersSlice.reducer;
