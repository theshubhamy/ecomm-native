import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/utils/supabase';
import { Address } from '@/types';

export interface OrderItem {
  id: string;
  product_id: string | number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  total_amount: number;
  subtotal?: number;
  discount_amount?: number;
  handling_charge?: number;
  applied_offer_id?: string | null;
  delivery_fee: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  delivery_address: Address;
  delivery_time_slot?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

// Fetch user orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            quantity,
            price,
            total
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      const orders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        user_id: order.user_id,
        order_number:
          order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
        status: order.status || 'pending',
        total_amount: order.total_amount || 0,
        subtotal: order.subtotal,
        discount_amount: order.discount_amount || 0,
        handling_charge: order.handling_charge || 0,
        applied_offer_id: order.applied_offer_id || null,
        delivery_fee: order.delivery_fee || 0,
        payment_method: order.payment_method || 'cash',
        payment_status: order.payment_status || 'pending',
        delivery_address: order.delivery_address,
        delivery_time_slot: order.delivery_time_slot,
        items: order.order_items || [],
        created_at: order.created_at,
        updated_at: order.updated_at,
      }));

      return orders;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch orders',
      );
    }
  },
);

// Fetch single order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (
    { userId, orderId }: { userId: string; orderId: string },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            quantity,
            price,
            total
          )
        `,
        )
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      const order: Order = {
        id: data.id,
        user_id: data.user_id,
        order_number:
          data.order_number || `ORD-${data.id.slice(0, 8).toUpperCase()}`,
        status: data.status || 'pending',
        total_amount: data.total_amount || 0,
        subtotal: data.subtotal,
        discount_amount: data.discount_amount || 0,
        handling_charge: data.handling_charge || 0,
        applied_offer_id: data.applied_offer_id || null,
        delivery_fee: data.delivery_fee || 0,
        payment_method: data.payment_method || 'cash',
        payment_status: data.payment_status || 'pending',
        delivery_address: data.delivery_address,
        delivery_time_slot: data.delivery_time_slot,
        items: data.order_items || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return order;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch order',
      );
    }
  },
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (
    { userId, orderId }: { userId: string; orderId: string },
    { rejectWithValue },
  ) => {
    try {
      // Get order details first

      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return data.id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to cancel order',
      );
    }
  },
);

// Re-order - add all items from a previous order to cart
export const reorder = createAsyncThunk(
  'orders/reorder',
  async (order: Order, { rejectWithValue, dispatch }) => {
    try {
      // Import cart actions dynamically to avoid circular dependency
      const { addToCart, addToCartDB } = await import('./cartSlice');

      // Add each item from the order to the cart
      for (const item of order.items) {
        const product = {
          id: item.product_id,
          name: item.product_name,
          imageUrl: item.product_image,
          price: item.price,
        };

        if (order.user_id) {
          await dispatch(
            addToCartDB({
              userId: order.user_id,
              productId: item.product_id,
              quantity: item.quantity,
            }),
          );
        } else {
          await dispatch(
            addToCart({
              product,
              quantity: item.quantity,
            }),
          );
        }
      }

      return order.id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to reorder',
      );
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel order
    builder
      .addCase(cancelOrder.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const order = state.orders.find(o => o.id === action.payload);
        if (order) {
          order.status = 'cancelled';
        }
        if (state.selectedOrder && state.selectedOrder.id === action.payload) {
          state.selectedOrder.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedOrder, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
