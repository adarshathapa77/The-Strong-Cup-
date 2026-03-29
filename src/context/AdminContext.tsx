import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminUser: AdminUser | null;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  validateAdminCode: (code: string) => boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount and verify with backend
  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');
      
      if (storedToken && storedUser) {
        try {
          // Verify session with backend
          const response = await fetch(`${API_BASE_URL}/api/admin/verify-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: storedToken }),
          });

          if (response.ok) {
            const data = await response.json();
            setAdminToken(storedToken);
            setAdminUser(data.data.admin);
            setIsAdminLoggedIn(true);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        } catch (err) {
          console.error('Session verification error:', err);
          // If backend is not available, allow local session for demo
          try {
            setAdminToken(storedToken);
            setAdminUser(JSON.parse(storedUser));
            setIsAdminLoggedIn(true);
          } catch {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        }
      }
    };

    loadSession();
  }, []);

  const validateAdminCode = (code: string): boolean => {
    // Secret code validation
    return code === 'NANU';
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return { success: false, message: data.message || 'Login failed' };
      }

      if (data.success) {
        const { token, admin } = data.data;
        setAdminUser(admin);
        setAdminToken(token);
        setIsAdminLoggedIn(true);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(admin));
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      const errorMessage = 'Login failed: Unable to connect to server';
      setError(errorMessage);
      console.error('Login error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (adminToken) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: adminToken }),
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdminUser(null);
      setAdminToken(null);
      setIsAdminLoggedIn(false);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  };

  const clearError = () => setError(null);

  return (
    <AdminContext.Provider 
      value={{ 
        isAdminLoggedIn, 
        adminUser, 
        adminToken, 
        login, 
        logout, 
        validateAdminCode,
        isLoading,
        error,
        clearError
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
