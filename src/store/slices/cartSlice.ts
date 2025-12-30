import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { supabase } from '@/utils/supabase';
import { cacheCart, getCachedCart } from '@/utils/cache';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  total: number;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  total: 0,
};

// Calculate total price
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = item.product.price || 0;
    return sum + price * item.quantity;
  }, 0);
};

// Fetch cart from Supabase
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Try to get cached cart first
      const cachedCart = await getCachedCart();
      if (cachedCart) {
        // Return cached data immediately, then sync in background
        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from('cart_items')
              .select('*, products(*)')
              .eq('user_id', userId);

            if (!error && data) {
              const cartItems: CartItem[] = (data || []).map((item: any) => ({
                product: {
                  id: item.products?.id || item.product_id,
                  name: item.products?.name || 'Unknown Product',
                  imageUrl: item.products?.image_url || item.products?.imageUrl,
                  price: item.products?.price || 0,
                  description: item.products?.description,
                  categoryId: item.products?.category_id,
                  inStock: item.products?.in_stock ?? true,
                  rating: item.products?.rating,
                },
                quantity: item.quantity || 1,
              }));

              const total = calculateTotal(cartItems);
              await cacheCart({ items: cartItems, total });
            }
          } catch (error) {
            console.error('Background cart sync failed:', error);
          }
        }, 0);
        return cachedCart;
      }

      // No cache, fetch from server
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', userId);

      if (error) {
        // If fetch fails and we have cache, return cache
        if (cachedCart) {
          return cachedCart;
        }
        return rejectWithValue(error.message);
      }

      const cartItems: CartItem[] = (data || []).map((item: any) => ({
        product: {
          id: item.products?.id || item.product_id,
          name: item.products?.name || 'Unknown Product',
          imageUrl: item.products?.image_url || item.products?.imageUrl,
          price: item.products?.price || 0,
          description: item.products?.description,
          categoryId: item.products?.category_id,
          inStock: item.products?.in_stock ?? true,
          rating: item.products?.rating,
        },
        quantity: item.quantity || 1,
      }));

      const total = calculateTotal(cartItems);
      const cartDataToCache = { items: cartItems, total };

      // Cache the fetched data
      await cacheCart(cartDataToCache);

      return cartDataToCache;
    } catch (error) {
      // On error, try to return cached data
      const cachedCart = await getCachedCart();
      if (cachedCart) {
        return cachedCart;
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cart');
    }
  }
);

// Add item to cart in Supabase
export const addToCartDB = createAsyncThunk(
  'cart/addToCartDB',
  async (
    { userId, productId, quantity }: { userId: string; productId: string | number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .select('*, products(*)')
          .single();

        if (error) {
          return rejectWithValue(error.message);
        }

        return {
          product: {
            id: data.products?.id || data.product_id,
            name: data.products?.name || 'Unknown Product',
            imageUrl: data.products?.image_url || data.products?.imageUrl,
            price: data.products?.price || 0,
            description: data.products?.description,
            categoryId: data.products?.category_id,
            inStock: data.products?.in_stock ?? true,
            rating: data.products?.rating,
          },
          quantity: data.quantity,
        };
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
          })
          .select('*, products(*)')
          .single();

        if (error) {
          return rejectWithValue(error.message);
        }

        return {
          product: {
            id: data.products?.id || data.product_id,
            name: data.products?.name || 'Unknown Product',
            imageUrl: data.products?.image_url || data.products?.imageUrl,
            price: data.products?.price || 0,
            description: data.products?.description,
            categoryId: data.products?.category_id,
            inStock: data.products?.in_stock ?? true,
            rating: data.products?.rating,
          },
          quantity: data.quantity,
        };
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  }
);

// Remove item from cart in Supabase
export const removeFromCartDB = createAsyncThunk(
  'cart/removeFromCartDB',
  async (
    { userId, productId }: { userId: string; productId: string | number },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return productId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from cart');
    }
  }
);

// Update quantity in Supabase
export const updateQuantityDB = createAsyncThunk(
  'cart/updateQuantityDB',
  async (
    { userId, productId, quantity }: { userId: string; productId: string | number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) {
          return rejectWithValue(error.message);
        }

        return { productId, quantity: 0 };
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('product_id', productId)
          .select('*, products(*)')
          .single();

        if (error) {
          return rejectWithValue(error.message);
        }

        return {
          productId: data.product_id,
          quantity: data.quantity,
        };
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update quantity');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local cart actions (for offline/guest mode)
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }

      state.total = calculateTotal(state.items);
      // Cache cart after update
      cacheCart({ items: state.items, total: state.total }).catch(console.error);
    },
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
      state.total = calculateTotal(state.items);
      // Cache cart after update
      cacheCart({ items: state.items, total: state.total }).catch(console.error);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string | number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.product.id !== productId);
        } else {
          item.quantity = quantity;
        }
      }

      state.total = calculateTotal(state.items);
      // Cache cart after update
      cacheCart({ items: state.items, total: state.total }).catch(console.error);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      // Clear cache when cart is cleared
      cacheCart({ items: [], total: 0 }).catch(console.error);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both old format (array) and new format (object with items and total)
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
          state.total = calculateTotal(state.items);
        } else {
          state.items = action.payload.items || [];
          state.total = action.payload.total || calculateTotal(state.items);
        }
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to cart
    builder
      .addCase(addToCartDB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartDB.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingItem = state.items.find(
          (item) => item.product.id === action.payload.product.id
        );

        if (existingItem) {
          existingItem.quantity = action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }

        state.total = calculateTotal(state.items);
        state.error = null;
      })
      .addCase(addToCartDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove from cart
    builder
      .addCase(removeFromCartDB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCartDB.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.product.id !== action.payload);
        state.total = calculateTotal(state.items);
        state.error = null;
      })
      .addCase(removeFromCartDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update quantity
    builder
      .addCase(updateQuantityDB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuantityDB.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.quantity === 0) {
          state.items = state.items.filter((item) => item.product.id !== action.payload.productId);
        } else {
          const item = state.items.find((item) => item.product.id === action.payload.productId);
          if (item) {
            item.quantity = action.payload.quantity;
          }
        }
        state.total = calculateTotal(state.items);
        state.error = null;
      })
      .addCase(updateQuantityDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;

