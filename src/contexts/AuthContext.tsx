import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'patient' | 'doctor';

interface User {
  fullName: string;
  patientId: string;
  shortName: string;
  profileImage: string;
  email: string;
  role: UserRole;
  specialty?: string; // For doctors
  hospital?: string; // For doctors
  experience?: number; // For doctors
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    console.log('AuthContext.login called with:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    console.log('Auth state updated - isAuthenticated:', true);
  };

  const logout = () => {
    console.log('AuthContext.logout called');
    setUser(null);
    setIsAuthenticated(false);
    console.log('Auth state updated - isAuthenticated:', false);
    // AppNavigator will handle navigation automatically
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
