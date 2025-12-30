import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import locationReducer from './slices/locationSlice';
import wishlistReducer from './slices/wishlistSlice';
import ordersReducer from './slices/ordersSlice';
import offersReducer from './slices/offersSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    location: locationReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    offers: offersReducer,
    payment: paymentReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/setSession',
          'products/subscribeToInventoryUpdates/fulfilled',
          'products/subscribeToInventoryUpdates/rejected',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.user', 'payload.session'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.session'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
