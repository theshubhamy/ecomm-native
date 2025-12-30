import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { supabase } from '@/utils/supabase';
import {
  cacheProducts,
  getCachedProducts,
  setLastSyncTime,
} from '@/utils/cache';

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  inventoryUpdates: {
    [productId: string | number]: {
      inStock: boolean;
      lastUpdated?: number;
    };
  };
}

const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
  inventoryUpdates: {},
};

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Try to get cached products first
      const cachedProducts = await getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        // Return cached data immediately, then fetch fresh data in background
        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from('products')
              .select('*')
              .order('created_at', { ascending: false });
            if (!error && data) {
              const products: Product[] = (data || []).map((item: any) => ({
                id: item.id,
                name: item.name || item.title || 'Unnamed Product',
                imageUrl: item.image_url || item.image || item.imageUrl,
                price: item.price,
                description: item.description,
                categoryId: item.category_id || item.categoryId,
                inStock: item.in_stock ?? item.inStock ?? true,
                rating: item.rating,
                reviewCount: item.review_count || item.reviewCount,
              }));
              await cacheProducts(products);
              await setLastSyncTime();
            }
          } catch (error) {
            console.error('Background product sync failed:', error);
          }
        }, 0);
        return cachedProducts as Product[];
      }

      // No cache, fetch from server
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If fetch fails and we have cache, return cache
        if (cachedProducts) {
          return cachedProducts as Product[];
        }
        return rejectWithValue(error.message);
      }

      // Transform Supabase data to Product type
      const products: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || item.title || 'Unnamed Product',
        imageUrl: item.image_url || item.image || item.imageUrl,
        price: item.price,
        description: item.description,
        categoryId: item.category_id || item.categoryId,
        inStock: item.in_stock ?? item.inStock ?? true,
        rating: item.rating,
        reviewCount: item.review_count || item.reviewCount,
      }));

      // Cache the fetched data
      if (products.length > 0) {
        await cacheProducts(products);
        await setLastSyncTime();
      }

      return products;
    } catch (error) {
      // On error, try to return cached data
      const cachedProducts = await getCachedProducts();
      if (cachedProducts) {
        return cachedProducts as Product[];
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch products',
      );
    }
  },
);

// Fetch products by category
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      const products: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || item.title || 'Unnamed Product',
        imageUrl: item.image_url || item.image || item.imageUrl,
        price: item.price,
        description: item.description,
        categoryId: item.category_id || item.categoryId,
        inStock: item.in_stock ?? item.inStock ?? true,
        rating: item.rating,
        reviewCount: item.review_count || item.reviewCount,
      }));

      return products;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch products',
      );
    }
  },
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      const products: Product[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || item.title || 'Unnamed Product',
        imageUrl: item.image_url || item.image || item.imageUrl,
        price: item.price,
        description: item.description,
        categoryId: item.category_id || item.categoryId,
        inStock: item.in_stock ?? item.inStock ?? true,
        rating: item.rating,
        reviewCount: item.review_count || item.reviewCount,
      }));

      return products;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to search products',
      );
    }
  },
);

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string | number, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      const product: Product = {
        id: data.id,
        name: data.name || data.title || 'Unnamed Product',
        imageUrl: data.image_url || data.image || data.imageUrl,
        price: data.price,
        description: data.description,
        categoryId: data.category_id || data.categoryId,
        inStock: data.in_stock ?? data.inStock ?? true,
        rating: data.rating,
      };

      return product;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch product',
      );
    }
  },
);

// Store channel reference outside Redux to avoid serialization issues
let inventoryChannel: ReturnType<typeof supabase.channel> | null = null;

// Subscribe to real-time inventory updates
export const subscribeToInventoryUpdates = createAsyncThunk(
  'products/subscribeToInventoryUpdates',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Unsubscribe from existing channel if it exists
      if (inventoryChannel) {
        await supabase.removeChannel(inventoryChannel);
      }

      inventoryChannel = supabase
        .channel('inventory-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products',
          },
          payload => {
            if (payload.new) {
              const product = payload.new as any;
              dispatch(
                updateProductInventory({
                  productId: product.id,
                  inStock: product.in_stock ?? true,
                }),
              );
            }
          },
        )
        .subscribe();

      // Return a simple serializable value instead of the channel object
      return { subscribed: true, channelId: 'inventory-updates' };
    } catch (error) {
      console.error('Error subscribing to inventory updates:', error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to subscribe to inventory updates',
      );
    }
  },
);

// Unsubscribe from inventory updates
export const unsubscribeFromInventoryUpdates = createAsyncThunk(
  'products/unsubscribeFromInventoryUpdates',
  async () => {
    if (inventoryChannel) {
      await supabase.removeChannel(inventoryChannel);
      inventoryChannel = null;
    }
    return { unsubscribed: true };
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    updateProductInventory: (
      state,
      action: PayloadAction<{ productId: string | number; inStock: boolean }>,
    ) => {
      const { productId, inStock } = action.payload;

      // Update in items array
      const product = state.items.find(p => p.id === productId);
      if (product) {
        product.inStock = inStock;
      }

      // Update selected product if it matches
      if (state.selectedProduct?.id === productId) {
        state.selectedProduct.inStock = inStock;
      }

      // Store update timestamp
      state.inventoryUpdates[productId] = {
        inStock,
        lastUpdated: Date.now(),
      };
    },
    clearError: state => {
      state.error = null;
    },
    clearProducts: state => {
      state.items = [];
    },
  },
  extraReducers: builder => {
    // Fetch all products
    builder
      .addCase(fetchProducts.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch products by category
    builder
      .addCase(fetchProductsByCategory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search products
    builder
      .addCase(searchProducts.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedProduct,
  updateProductInventory,
  clearError,
  clearProducts,
} = productsSlice.actions;
export default productsSlice.reducer;
