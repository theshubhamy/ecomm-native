import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  PRODUCTS: 'cached_products',
  CART: 'cached_cart',
  LAST_SYNC: 'last_sync_timestamp',
} as const;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface CacheData<T> {
  data: T;
  timestamp: number;
}

// Generic cache functions
export const cacheData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
  }
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const cacheData: CacheData<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - cacheData.timestamp > CACHE_DURATION) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error(`Error getting cached data for key ${key}:`, error);
    return null;
  }
};

export const clearCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cache for key ${key}:`, error);
  }
};

export const clearAllCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(CACHE_KEYS));
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

// Specific cache functions
export const cacheProducts = async (products: any[]) => {
  await cacheData(CACHE_KEYS.PRODUCTS, products);
};

export const getCachedProducts = async () => {
  return getCachedData<any[]>(CACHE_KEYS.PRODUCTS);
};

export const cacheCart = async (cart: any) => {
  await cacheData(CACHE_KEYS.CART, cart);
};

export const getCachedCart = async () => {
  return getCachedData<any>(CACHE_KEYS.CART);
};

export const setLastSyncTime = async (): Promise<void> => {
  await cacheData(CACHE_KEYS.LAST_SYNC, Date.now());
};

export { CACHE_KEYS };
