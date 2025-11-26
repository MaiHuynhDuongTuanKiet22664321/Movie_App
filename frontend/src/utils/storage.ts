import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

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
  } catch (e) {
    console.error("Error saving token:", e);
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
  } catch (e) {
    console.error("Error getting token:", e);
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
  } catch (e) {
    console.error("Error removing token:", e);
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
  } catch (e) {
    console.error("Error saving user data:", e);
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
  } catch (e) {
    console.error("Error getting user data:", e);
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
  } catch (e) {
    console.error("Error removing user data:", e);
  }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
  await removeToken();
  await removeUserData();
};
