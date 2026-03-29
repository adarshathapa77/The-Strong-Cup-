import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  validateAdminCode: (code: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedAdminSession = localStorage.getItem('adminSession');
    const storedAdminEmail = localStorage.getItem('adminEmail');
    if (storedAdminSession && storedAdminEmail) {
      setIsAdminLoggedIn(true);
      setAdminEmail(storedAdminEmail);
    }
  }, []);

  const validateAdminCode = (code: string): boolean => {
    // Secret code validation
    return code === 'NANU';
  };

  const login = (email: string, password: string): boolean => {
    // Simulated admin credentials check
    // In production, this would call a backend API
    const validAdmins = [
      { email: 'admin@thestrong.com', password: 'admin123' },
      { email: 'admin@strongcup.com', password: 'strongcup123' },
    ];

    const isValidAdmin = validAdmins.some(
      (admin) => admin.email === email && admin.password === password
    );

    if (isValidAdmin) {
      const sessionToken = `admin-session-${Date.now()}`;
      localStorage.setItem('adminSession', sessionToken);
      localStorage.setItem('adminEmail', email);
      setIsAdminLoggedIn(true);
      setAdminEmail(email);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminEmail');
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
  };

  return (
    <AdminContext.Provider value={{ isAdminLoggedIn, adminEmail, login, logout, validateAdminCode }}>
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
