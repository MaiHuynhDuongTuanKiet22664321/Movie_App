import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { clearAuthData, getToken, getUserData, saveToken, saveUserData } from '../utils/storage';

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data and token from storage on mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const savedToken = await getToken();
        const savedUser = await getUserData();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUserState(savedUser);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const setUser = async (userData: User | null, userToken: string | null = null) => {
    setUserState(userData);
    setToken(userToken);

    if (userData && userToken) {
      try {
        await saveToken(userToken);
        await saveUserData(userData);
      } catch (error) {
        console.error('Error saving auth data:', error);
      }
    } else {
      await clearAuthData();
    }
  };

  const logout = async () => {
    setUserState(null);
    setToken(null);
    await clearAuthData();
  };

  return (
    <UserContext.Provider value={{ user, token, loading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
