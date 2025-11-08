import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Helper: Check if running on web
const isWeb = Platform.OS === 'web';

// Save token
export const saveToken = async (token: string): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Get token
export const getToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove token
export const removeToken = async (): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Save user data
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    const data = JSON.stringify(userData);
    if (isWeb) {
      localStorage.setItem(USER_KEY, data);
    } else {
      await SecureStore.setItemAsync(USER_KEY, data);
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Get user data
export const getUserData = async (): Promise<any | null> => {
  try {
    if (isWeb) {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } else {
      const data = await SecureStore.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Remove user data
export const removeUserData = async (): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

// Clear all
export const clearAuthData = async (): Promise<void> => {
  await Promise.all([removeToken(), removeUserData()]);
};
