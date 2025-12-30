import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { Address, LocationCoordinates } from '@/types';
import { supabase } from '@/utils/supabase';

interface LocationState {
  currentLocation: LocationCoordinates | null;
  selectedAddress: Address | null;
  savedAddresses: Address[];
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
}

const initialState: LocationState = {
  currentLocation: null,
  selectedAddress: null,
  savedAddresses: [],
  isLoading: false,
  error: null,
  hasPermission: null,
};

// Request location permission and get current location
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return rejectWithValue('Location permission denied');
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to get location'
      );
    }
  }
);

// Reverse geocode coordinates to get address
export const reverseGeocode = createAsyncThunk(
  'location/reverseGeocode',
  async (coordinates: LocationCoordinates, { rejectWithValue }) => {
    try {
      const addresses = await Location.reverseGeocodeAsync(coordinates);
      if (addresses.length === 0) {
        return rejectWithValue('No address found for this location');
      }

      const address = addresses[0];
      return {
        addressLine1: `${address.streetNumber || ''} ${address.street || ''}`.trim(),
        addressLine2: address.district || '',
        city: address.city || '',
        state: address.region || '',
        pincode: address.postalCode || '',
        country: address.country || 'India',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to reverse geocode'
      );
    }
  }
);

// Fetch saved addresses from Supabase
export const fetchSavedAddresses = createAsyncThunk(
  'location/fetchSavedAddresses',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        return rejectWithValue(error.message);
      }

      const addresses: Address[] = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        type: item.type || 'home',
        label: item.label || 'Home',
        addressLine1: item.address_line1,
        addressLine2: item.address_line2,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        country: item.country || 'India',
        latitude: item.latitude,
        longitude: item.longitude,
        isDefault: item.is_default,
        contactName: item.contact_name,
        contactPhone: item.contact_phone,
      }));

      return addresses;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch addresses'
      );
    }
  }
);

// Save address to Supabase
export const saveAddress = createAsyncThunk(
  'location/saveAddress',
  async (address: Omit<Address, 'id'>, { rejectWithValue }) => {
    try {
      const addressData: any = {
        user_id: address.userId,
        type: address.type,
        label: address.label,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2 || null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India',
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        is_default: address.isDefault || false,
        contact_name: address.contactName || null,
        contact_phone: address.contactPhone || null,
      };

      // If this is set as default, unset other defaults
      if (address.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', address.userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert(addressData)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        label: data.label,
        addressLine1: data.address_line1,
        addressLine2: data.address_line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.is_default,
        contactName: data.contact_name,
        contactPhone: data.contact_phone,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to save address'
      );
    }
  }
);

// Update address in Supabase
export const updateAddress = createAsyncThunk(
  'location/updateAddress',
  async (address: Address, { rejectWithValue }) => {
    try {
      const addressData: any = {
        type: address.type,
        label: address.label,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2 || null,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India',
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        is_default: address.isDefault || false,
        contact_name: address.contactName || null,
        contact_phone: address.contactPhone || null,
      };

      // If this is set as default, unset other defaults
      if (address.isDefault && address.userId) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', address.userId)
          .neq('id', address.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', address.id)
        .select()
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        label: data.label,
        addressLine1: data.address_line1,
        addressLine2: data.address_line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.is_default,
        contactName: data.contact_name,
        contactPhone: data.contact_phone,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update address'
      );
    }
  }
);

// Delete address from Supabase
export const deleteAddress = createAsyncThunk(
  'location/deleteAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', addressId);

      if (error) {
        return rejectWithValue(error.message);
      }

      return addressId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete address'
      );
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    setCurrentLocation: (state, action: PayloadAction<LocationCoordinates | null>) => {
      state.currentLocation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPermission: (state, action: PayloadAction<boolean>) => {
      state.hasPermission = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get current location
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLocation = action.payload;
        state.hasPermission = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasPermission = false;
      });

    // Reverse geocode
    builder
      .addCase(reverseGeocode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reverseGeocode.fulfilled, (state, action) => {
        state.isLoading = false;
        // Create a temporary address from reverse geocode
        const tempAddress: Address = {
          id: 'temp',
          type: 'other',
          label: 'Current Location',
          ...action.payload,
        };
        state.selectedAddress = tempAddress;
        state.error = null;
      })
      .addCase(reverseGeocode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch saved addresses
    builder
      .addCase(fetchSavedAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedAddresses = action.payload;
        // Set default address as selected if available
        const defaultAddress = action.payload.find((addr) => addr.isDefault);
        if (defaultAddress && !state.selectedAddress) {
          state.selectedAddress = defaultAddress;
        }
        state.error = null;
      })
      .addCase(fetchSavedAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save address
    builder
      .addCase(saveAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedAddresses.push(action.payload);
        if (action.payload.isDefault) {
          state.selectedAddress = action.payload;
        }
        state.error = null;
      })
      .addCase(saveAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.savedAddresses.findIndex((addr) => addr.id === action.payload.id);
        if (index !== -1) {
          state.savedAddresses[index] = action.payload;
        }
        if (action.payload.isDefault || state.selectedAddress?.id === action.payload.id) {
          state.selectedAddress = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedAddresses = state.savedAddresses.filter(
          (addr) => addr.id !== action.payload
        );
        if (state.selectedAddress?.id === action.payload) {
          state.selectedAddress = state.savedAddresses[0] || null;
        }
        state.error = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAddress, setCurrentLocation, clearError, setPermission } =
  locationSlice.actions;
export default locationSlice.reducer;

