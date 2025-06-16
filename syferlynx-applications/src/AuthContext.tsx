import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User interface
interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

// User with password (for internal use)
interface UserWithPassword extends User {
  password: string;
}

// Authentication result interface
interface AuthResult {
  success: boolean;
  error?: string;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => Promise<AuthResult>;
  loading: boolean;
  isAuthenticated: boolean;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user database (in a real app, this would be handled by a backend)
const mockUsers: UserWithPassword[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In real apps, passwords should be hashed
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  }
];

// AuthProvider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<AuthResult> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const foundUser = mockUsers.find(
        u => (u.username === username || u.email === username) && u.password === password
      );

      if (foundUser) {
        const userSession: User = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role
        };
        
        setUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<AuthResult> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = mockUsers.find(
        u => u.username === username || u.email === email
      );

      if (existingUser) {
        return { success: false, error: 'Username or email already exists' };
      }

      // Create new user
      const newUser: UserWithPassword = {
        id: mockUsers.length + 1,
        username,
        email,
        password, // In real apps, hash the password
        role: 'user'
      };

      mockUsers.push(newUser);

      const userSession: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      };

      setUser(userSession);
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Update user profile
  const updateProfile = async (updatedData: Partial<User>): Promise<AuthResult> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const updatedUser: User = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export types for use in other files
export type { User, AuthResult, AuthContextType };
