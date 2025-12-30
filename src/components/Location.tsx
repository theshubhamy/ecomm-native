import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getCurrentLocation,
  reverseGeocode,
  fetchSavedAddresses,
} from '@/store/slices/locationSlice';
import { router } from 'expo-router';
import React, { useEffect, useCallback } from 'react';
import { ThemedPressable } from './ThemedPressable';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

const Location = () => {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { selectedAddress, savedAddresses } = useAppSelector(
    state => state.location,
  );
  const { user } = useAppSelector(state => state.auth);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const locationResult = await dispatch(getCurrentLocation());
      if (getCurrentLocation.fulfilled.match(locationResult)) {
        await dispatch(reverseGeocode(locationResult.payload));
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    // Fetch current location on component mount
    handleGetCurrentLocation();
    // Fetch saved addresses if user is logged in
    if (user?.id) {
      dispatch(fetchSavedAddresses(user.id));
    }
  }, [user?.id, dispatch, handleGetCurrentLocation]);

  const handleLocationPress = () => {
    // Navigate to address selection screen
    router.push('/address-selection');
  };

  const displayAddress = selectedAddress
    ? `${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`
    : savedAddresses.length > 0
    ? `${savedAddresses[0].city}, ${savedAddresses[0].state} ${savedAddresses[0].pincode}`
    : 'Select delivery address';

  return (
    <ThemedPressable
      onPress={handleLocationPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
        gap: 8,
        flex: 1,
      }}
    >
      <IconSymbol name="location.fill" size={16} color={Colors.primary} />
      <ThemedView style={{ flex: 1 }}>
        <ThemedText
          type="xsmall"
          style={{ color: Colors[colorScheme].textSecondary }}
          numberOfLines={1}
        >
          Delivery address
        </ThemedText>
        <ThemedText type="small" numberOfLines={1}>
          {displayAddress}
        </ThemedText>
      </ThemedView>
      <IconSymbol
        name="chevron.down"
        size={14}
        color={Colors[colorScheme].textSecondary}
      />
    </ThemedPressable>
  );
};

export default Location;
