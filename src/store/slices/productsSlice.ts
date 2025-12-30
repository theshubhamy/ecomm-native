import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { supabase } from '@/utils/supabase';

interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
};

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
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
      }));

      return products;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
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
      }));

      return products;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
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
      }));

      return products;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search products');
    }
  }
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch product');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProducts: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all products
    builder
      .addCase(fetchProducts.pending, (state) => {
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
      .addCase(fetchProductsByCategory.pending, (state) => {
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
      .addCase(searchProducts.pending, (state) => {
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
      .addCase(fetchProductById.pending, (state) => {
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

export const { setSelectedProduct, clearError, clearProducts } = productsSlice.actions;
export default productsSlice.reducer;

