import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthResponse } from '../api/auth';
import { setToken, getToken, removeToken, setUser, getUser, clearStorage } from '../utils/storage';

interface User {
  id: string;
  email: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await getToken();
      const storedUser = await getUser();
      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUserState(storedUser as unknown as User);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthResponse = async (response: AuthResponse) => {
    await setToken(response.token);
    await setUser(response.user as unknown as Record<string, unknown>);
    setTokenState(response.token);
    setUserState(response.user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    await handleAuthResponse(data);
  };

  const register = async (email: string, password: string) => {
    const { data } = await authApi.register({ email, password });
    await handleAuthResponse(data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors
    }
    await clearStorage();
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
