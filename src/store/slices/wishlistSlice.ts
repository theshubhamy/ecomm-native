import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { supabase } from '@/utils/supabase';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
};

// Fetch wishlist from Supabase
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', userId);

      if (error) {
        return rejectWithValue(error.message);
      }

      const products: Product[] = (data || []).map((item: any) => ({
        id: item.products?.id || item.product_id,
        name: item.products?.name || 'Unknown Product',
        imageUrl: item.products?.image_url || item.products?.imageUrl,
        price: item.products?.price || 0,
        description: item.products?.description,
        categoryId: item.products?.category_id,
        inStock: item.products?.in_stock ?? true,
        rating: item.products?.rating,
      }));

      return products;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch wishlist'
      );
    }
  }
);

// Add item to wishlist in Supabase
export const addToWishlistDB = createAsyncThunk(
  'wishlist/addToWishlistDB',
  async (
    { userId, productId }: { userId: string; productId: string | number },
    { rejectWithValue }
  ) => {
    try {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        return rejectWithValue('Product already in wishlist');
      }

      // Get product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        return rejectWithValue('Product not found');
      }

      // Add to wishlist
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          product_id: productId,
        })
        .select('*, products(*)')
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return {
        id: data.products?.id || data.product_id,
        name: data.products?.name || 'Unknown Product',
        imageUrl: data.products?.image_url || data.products?.imageUrl,
        price: data.products?.price || 0,
        description: data.products?.description,
        categoryId: data.products?.category_id,
        inStock: data.products?.in_stock ?? true,
        rating: data.products?.rating,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to add to wishlist'
      );
    }
  }
);

// Remove item from wishlist in Supabase
export const removeFromWishlistDB = createAsyncThunk(
  'wishlist/removeFromWishlistDB',
  async (
    { userId, productId }: { userId: string; productId: string | number },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return productId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to remove from wishlist'
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Local wishlist actions (for offline/guest mode)
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to wishlist
    builder
      .addCase(addToWishlistDB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlistDB.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingItem = state.items.find(
          (item) => item.id === action.payload.id
        );
        if (!existingItem) {
          state.items.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addToWishlistDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove from wishlist
    builder
      .addCase(removeFromWishlistDB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistDB.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.error = null;
      })
      .addCase(removeFromWishlistDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, clearError } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;

