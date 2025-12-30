// Product types
export interface Product {
  id: number | string;
  name: string;
  imageUrl?: string;
  price?: number;
  description?: string;
  categoryId?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}

// Category types
export interface Category {
  id: string;
  name: string;
  image: string | number; // Can be URL string or require() number
  description?: string;
}

// User/Session types
export interface User {
  id: string;
  email?: string;
  name?: string;
}

// Address types
export interface Address {
  id: string;
  userId?: string;
  type: 'home' | 'work' | 'other';
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  contactName?: string;
  contactPhone?: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  coordinates: LocationCoordinates | null;
  address: Address | null;
  isLoading: boolean;
  error: string | null;
}

