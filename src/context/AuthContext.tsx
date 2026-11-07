import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { authApi } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  updateUserContext: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hospital_token');
    const storedUser = localStorage.getItem('hospital_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify with backend
        authApi
          .getMe()
          .then((res) => {
            if (res.data.success && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('hospital_user', JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            // Token might be expired
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (err) {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    const handleGlobalLogout = () => {
      logout();
    };

    window.addEventListener('auth_logout', handleGlobalLogout);
    return () => window.removeEventListener('auth_logout', handleGlobalLogout);
  }, []);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await authApi.login({ identifier, password: pass });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('hospital_token', receivedToken);
        localStorage.setItem('hospital_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid credentials. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
  };

  const updateUserContext = (updated: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem('hospital_user', JSON.stringify(merged));
    }
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SuperAdmin') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        hasRole,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
