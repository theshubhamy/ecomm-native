import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedPressable } from '@/components/ThemedPressable';
import { IconSymbol } from '@/components/ui/IconSymbol';
import HeaderView from '@/components/ui/HeaderView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getCurrentLocation,
  reverseGeocode,
  fetchSavedAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  setSelectedAddress,
} from '@/store/slices/locationSlice';
import { Address } from '@/types';

export default function AddressSelection() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { savedAddresses, selectedAddress, isLoading, error } = useAppSelector(
    (state) => state.location
  );
  const { user } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    contactName: '',
    contactPhone: '',
    type: 'home' as 'home' | 'work' | 'other',
    isDefault: false,
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSavedAddresses(user.id));
    }
  }, [user, dispatch]);

  const handleGetCurrentLocation = async () => {
    try {
      const locationResult = await dispatch(getCurrentLocation());
      if (getCurrentLocation.fulfilled.match(locationResult)) {
        const geocodeResult = await dispatch(reverseGeocode(locationResult.payload));
        if (reverseGeocode.fulfilled.match(geocodeResult)) {
          setFormData({
            ...formData,
            addressLine1: geocodeResult.payload.addressLine1,
            addressLine2: geocodeResult.payload.addressLine2 || '',
            city: geocodeResult.payload.city,
            state: geocodeResult.payload.state,
            pincode: geocodeResult.payload.pincode,
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleSaveAddress = async () => {
    if (!formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to save addresses');
      return;
    }

    try {
      if (editingAddress) {
        await dispatch(
          updateAddress({
            ...editingAddress,
            ...formData,
            userId: user.id,
          })
        );
      } else {
        await dispatch(
          saveAddress({
            userId: user.id,
            ...formData,
            latitude: null,
            longitude: null,
          })
        );
      }
      setIsEditing(false);
      setEditingAddress(null);
      setFormData({
        label: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        contactName: '',
        contactPhone: '',
        type: 'home',
        isDefault: false,
      });
      Alert.alert('Success', 'Address saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleSelectAddress = (address: Address) => {
    dispatch(setSelectedAddress(address));
    router.back();
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      contactName: address.contactName || '',
      contactPhone: address.contactPhone || '',
      type: address.type,
      isDefault: address.isDefault || false,
    });
    setIsEditing(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteAddress(addressId));
        },
      },
    ]);
  };

  if (isEditing) {
    return (
      <ThemedView
        style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      >
        <HeaderView>
          <ThemedView style={styles.header}>
            <ThemedPressable onPress={() => setIsEditing(false)}>
              <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].textPrimary} />
            </ThemedPressable>
            <ThemedText type="subtitle">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </ThemedText>
            <ThemedView style={{ width: 24 }} />
          </ThemedView>
        </HeaderView>

        <ScrollView style={styles.formContainer}>
          <ThemedButton
            onPress={handleGetCurrentLocation}
            style={[styles.locationButton, { backgroundColor: Colors.primary }]}
          >
            <IconSymbol name="location.fill" size={20} color={Colors.black} />
            <ThemedText type="defaultSemiBold" style={{ color: Colors.black, marginLeft: 8 }}>
              Use Current Location
            </ThemedText>
          </ThemedButton>

          <ThemedView style={styles.formGroup}>
            <ThemedText type="small" style={{ marginBottom: 8 }}>
              Label (Home/Work/Other)
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  color: Colors[colorScheme].textPrimary,
                  borderColor: Colors[colorScheme].textSecondary + '30',
                },
              ]}
              value={formData.label}
              onChangeText={(text) => setFormData({ ...formData, label: text })}
              placeholder="e.g., Home"
              placeholderTextColor={Colors[colorScheme].textSecondary}
            />
          </ThemedView>

          <ThemedView style={styles.formGroup}>
            <ThemedText type="small" style={{ marginBottom: 8 }}>
              Address Line 1 *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  color: Colors[colorScheme].textPrimary,
                  borderColor: Colors[colorScheme].textSecondary + '30',
                },
              ]}
              value={formData.addressLine1}
              onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
              placeholder="Street address"
              placeholderTextColor={Colors[colorScheme].textSecondary}
            />
          </ThemedView>

          <ThemedView style={styles.formGroup}>
            <ThemedText type="small" style={{ marginBottom: 8 }}>
              Address Line 2
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  color: Colors[colorScheme].textPrimary,
                  borderColor: Colors[colorScheme].textSecondary + '30',
                },
              ]}
              value={formData.addressLine2}
              onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
              placeholder="Apartment, suite, etc."
              placeholderTextColor={Colors[colorScheme].textSecondary}
            />
          </ThemedView>

          <ThemedView style={styles.row}>
            <ThemedView style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <ThemedText type="small" style={{ marginBottom: 8 }}>
                City *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme].backgroundPaper,
                    color: Colors[colorScheme].textPrimary,
                    borderColor: Colors[colorScheme].textSecondary + '30',
                  },
                ]}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="City"
                placeholderTextColor={Colors[colorScheme].textSecondary}
              />
            </ThemedView>

            <ThemedView style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <ThemedText type="small" style={{ marginBottom: 8 }}>
                State *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme].backgroundPaper,
                    color: Colors[colorScheme].textPrimary,
                    borderColor: Colors[colorScheme].textSecondary + '30',
                  },
                ]}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                placeholder="State"
                placeholderTextColor={Colors[colorScheme].textSecondary}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.formGroup}>
            <ThemedText type="small" style={{ marginBottom: 8 }}>
              Pincode *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  color: Colors[colorScheme].textPrimary,
                  borderColor: Colors[colorScheme].textSecondary + '30',
                },
              ]}
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              placeholder="Pincode"
              placeholderTextColor={Colors[colorScheme].textSecondary}
              keyboardType="numeric"
            />
          </ThemedView>

          <ThemedView style={styles.formGroup}>
            <ThemedText type="small" style={{ marginBottom: 8 }}>
              Contact Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  color: Colors[colorScheme].textPrimary,
                  borderColor: Colors[colorScheme].textSecondary + '30',
                },
              ]}
              value={formData.contactName}
              onChangeText={(text) => setFormData({ ...formData, contactName: text })}
              placeholder="Name"
              placeholderTextColor={Colors[colorScheme].textSecondary}
            />
          </ThemedView>

          <ThemedView style={styles.formGroup}>
            <ThemedText type="small" style={{ marginBottom: 8 }}>
              Contact Phone
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme].backgroundPaper,
                  color: Colors[colorScheme].textPrimary,
                  borderColor: Colors[colorScheme].textSecondary + '30',
                },
              ]}
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              placeholder="Phone number"
              placeholderTextColor={Colors[colorScheme].textSecondary}
              keyboardType="phone-pad"
            />
          </ThemedView>

          <ThemedPressable
            onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            style={styles.checkboxContainer}
          >
            <IconSymbol
              name={formData.isDefault ? 'checkmark.square.fill' : 'square'}
              size={24}
              color={formData.isDefault ? Colors.primary : Colors[colorScheme].textSecondary}
            />
            <ThemedText type="small" style={{ marginLeft: 8 }}>
              Set as default address
            </ThemedText>
          </ThemedPressable>

          <ThemedButton
            onPress={handleSaveAddress}
            style={[styles.saveButton, { backgroundColor: Colors.primary }]}
            disabled={isLoading}
          >
            <ThemedText type="defaultSemiBold" style={{ color: Colors.black }}>
              {isLoading ? 'Saving...' : 'Save Address'}
            </ThemedText>
          </ThemedButton>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
    >
      <HeaderView>
        <ThemedView style={styles.header}>
          <ThemedPressable onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].textPrimary} />
          </ThemedPressable>
          <ThemedText type="subtitle">Select Delivery Address</ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>
      </HeaderView>

      <ScrollView style={styles.content}>
        {!user?.id ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">Please sign in to manage addresses</ThemedText>
            <ThemedButton
              onPress={() => router.push('/sign-in')}
              style={[styles.signInButton, { backgroundColor: Colors.primary }]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: Colors.black }}>
                Sign In
              </ThemedText>
            </ThemedButton>
          </ThemedView>
        ) : (
          <>
            <ThemedButton
              onPress={() => setIsEditing(true)}
              style={[styles.addButton, { backgroundColor: Colors.primary }]}
            >
              <IconSymbol name="plus" size={20} color={Colors.black} />
              <ThemedText type="defaultSemiBold" style={{ color: Colors.black, marginLeft: 8 }}>
                Add New Address
              </ThemedText>
            </ThemedButton>

            <ThemedButton
              onPress={handleGetCurrentLocation}
              style={[
                styles.locationButton,
                { backgroundColor: Colors[colorScheme].backgroundPaper },
              ]}
            >
              <IconSymbol name="location.fill" size={20} color={Colors.primary} />
              <ThemedText type="defaultSemiBold" style={{ marginLeft: 8 }}>
                Use Current Location
              </ThemedText>
            </ThemedButton>

            {isLoading ? (
              <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </ThemedView>
            ) : savedAddresses.length === 0 ? (
              <ThemedView style={styles.emptyContainer}>
                <ThemedText type="subtitle">No saved addresses</ThemedText>
                <ThemedText type="small" style={{ marginTop: 8, textAlign: 'center' }}>
                  Add an address to get started
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedView style={styles.addressesList}>
                {savedAddresses.map((address) => (
                  <ThemedView
                    key={address.id}
                    style={[
                      styles.addressCard,
                      {
                        backgroundColor: Colors[colorScheme].backgroundPaper,
                        borderColor:
                          selectedAddress?.id === address.id
                            ? Colors.primary
                            : Colors[colorScheme].textSecondary + '20',
                        borderWidth: selectedAddress?.id === address.id ? 2 : 1,
                      },
                    ]}
                  >
                    <ThemedPressable
                      onPress={() => handleSelectAddress(address)}
                      style={styles.addressContent}
                    >
                      <ThemedView style={styles.addressHeader}>
                        <ThemedView style={styles.addressLabel}>
                          <IconSymbol
                            name={
                              address.type === 'home'
                                ? 'house.fill'
                                : address.type === 'work'
                                  ? 'briefcase.fill'
                                  : 'mappin.circle.fill'
                            }
                            size={16}
                            color={Colors.primary}
                          />
                          <ThemedText type="defaultSemiBold" style={{ marginLeft: 8 }}>
                            {address.label}
                          </ThemedText>
                          {address.isDefault && (
                            <ThemedView
                              style={[
                                styles.defaultBadge,
                                { backgroundColor: Colors.primary + '20' },
                              ]}
                            >
                              <ThemedText
                                type="xsmall"
                                style={{ color: Colors.primary, fontWeight: 'bold' }}
                              >
                                DEFAULT
                              </ThemedText>
                            </ThemedView>
                          )}
                        </ThemedView>
                      </ThemedView>
                      <ThemedText type="small" style={{ marginTop: 4 }}>
                        {address.addressLine1}
                      </ThemedText>
                      {address.addressLine2 && (
                        <ThemedText type="small">{address.addressLine2}</ThemedText>
                      )}
                      <ThemedText type="small">
                        {address.city}, {address.state} {address.pincode}
                      </ThemedText>
                      {address.contactPhone && (
                        <ThemedText type="xsmall" style={{ marginTop: 4, color: Colors[colorScheme].textSecondary }}>
                          Phone: {address.contactPhone}
                        </ThemedText>
                      )}
                    </ThemedPressable>
                    <ThemedView style={styles.addressActions}>
                      <ThemedButton
                        onPress={() => handleEditAddress(address)}
                        style={styles.actionButton}
                      >
                        <IconSymbol name="pencil" size={18} color={Colors[colorScheme].textPrimary} />
                      </ThemedButton>
                      <ThemedButton
                        onPress={() => handleDeleteAddress(address.id)}
                        style={styles.actionButton}
                      >
                        <IconSymbol name="trash.fill" size={18} color={Colors.error} />
                      </ThemedButton>
                    </ThemedView>
                  </ThemedView>
                ))}
              </ThemedView>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addressesList: {
    gap: 12,
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  signInButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
});

