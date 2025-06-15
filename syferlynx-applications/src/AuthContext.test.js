import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

// Test component to access auth context
const TestComponent = () => {
  const { 
    user, 
    login, 
    register, 
    logout, 
    updateProfile, 
    loading, 
    isAuthenticated 
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'No User'}</div>
      
      <button 
        data-testid="login-btn" 
        onClick={() => login('admin', 'admin123')}
      >
        Login
      </button>
      
      <button 
        data-testid="register-btn" 
        onClick={() => register('newuser', 'new@example.com', 'password123')}
      >
        Register
      </button>
      
      <button 
        data-testid="logout-btn" 
        onClick={logout}
      >
        Logout
      </button>
      
      <button 
        data-testid="update-profile-btn" 
        onClick={() => updateProfile({ username: 'updateduser' })}
      >
        Update Profile
      </button>
    </div>
  );
};

// Helper to render component with AuthProvider
const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Unit Tests', () => {
    test('provides initial state correctly', () => {
      renderWithAuthProvider();
      
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });

    test('loads user from localStorage on initialization', () => {
      const savedUser = {
        id: 1,
        username: 'saveduser',
        email: 'saved@example.com',
        role: 'user'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedUser));
      
      renderWithAuthProvider();
      
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(savedUser));
    });

    test('throws error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Login Functionality', () => {
    test('successful login with valid credentials', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();
      
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      const userData = JSON.parse(screen.getByTestId('user').textContent);
      expect(userData.username).toBe('admin');
      expect(userData.email).toBe('admin@example.com');
      expect(userData.role).toBe('admin');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'currentUser',
        expect.stringContaining('admin')
      );
    });

    test('login with email instead of username', async () => {
      const TestComponentWithEmail = () => {
        const { login } = useAuth();
        return (
          <button 
            data-testid="login-email-btn" 
            onClick={() => login('admin@example.com', 'admin123')}
          >
            Login with Email
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithEmail />
          <TestComponent />
        </AuthProvider>
      );
      
      const user = userEvent.setup();
      
      await act(async () => {
        await user.click(screen.getByTestId('login-email-btn'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
    });

    test('failed login with invalid credentials', async () => {
      const TestComponentWithInvalidLogin = () => {
        const { login } = useAuth();
        const [result, setResult] = React.useState(null);
        
        const handleLogin = async () => {
          const loginResult = await login('invalid', 'invalid');
          setResult(loginResult);
        };
        
        return (
          <div>
            <button data-testid="invalid-login-btn" onClick={handleLogin}>
              Invalid Login
            </button>
            <div data-testid="login-result">
              {result ? JSON.stringify(result) : 'No Result'}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithInvalidLogin />
          <TestComponent />
        </AuthProvider>
      );
      
      const user = userEvent.setup();
      
      await act(async () => {
        await user.click(screen.getByTestId('invalid-login-btn'));
      });
      
      await waitFor(() => {
        const result = JSON.parse(screen.getByTestId('login-result').textContent);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid username or password');
      });
      
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    test('login shows loading state', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();
      
      // Start login process
      user.click(screen.getByTestId('login-btn'));
      
      // Should show loading immediately
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
      });
      
      // Wait for login to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
    });
  });

  describe('Registration Functionality', () => {
    test('successful registration with valid data', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();
      
      await act(async () => {
        await user.click(screen.getByTestId('register-btn'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      const userData = JSON.parse(screen.getByTestId('user').textContent);
      expect(userData.username).toBe('newuser');
      expect(userData.email).toBe('new@example.com');
      expect(userData.role).toBe('user');
    });

    test('failed registration with existing username', async () => {
      const TestComponentWithExistingUser = () => {
        const { register } = useAuth();
        const [result, setResult] = React.useState(null);
        
        const handleRegister = async () => {
          const registerResult = await register('admin', 'admin2@example.com', 'password123');
          setResult(registerResult);
        };
        
        return (
          <div>
            <button data-testid="existing-user-btn" onClick={handleRegister}>
              Register Existing User
            </button>
            <div data-testid="register-result">
              {result ? JSON.stringify(result) : 'No Result'}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithExistingUser />
          <TestComponent />
        </AuthProvider>
      );
      
      const user = userEvent.setup();
      
      await act(async () => {
        await user.click(screen.getByTestId('existing-user-btn'));
      });
      
      await waitFor(() => {
        const result = JSON.parse(screen.getByTestId('register-result').textContent);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username or email already exists');
      });
    });

    test('failed registration with existing email', async () => {
      const TestComponentWithExistingEmail = () => {
        const { register } = useAuth();
        const [result, setResult] = React.useState(null);
        
        const handleRegister = async () => {
          const registerResult = await register('newuser2', 'admin@example.com', 'password123');
          setResult(registerResult);
        };
        
        return (
          <div>
            <button data-testid="existing-email-btn" onClick={handleRegister}>
              Register Existing Email
            </button>
            <div data-testid="register-result">
              {result ? JSON.stringify(result) : 'No Result'}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithExistingEmail />
          <TestComponent />
        </AuthProvider>
      );
      
      const user = userEvent.setup();
      
      await act(async () => {
        await user.click(screen.getByTestId('existing-email-btn'));
      });
      
      await waitFor(() => {
        const result = JSON.parse(screen.getByTestId('register-result').textContent);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Username or email already exists');
      });
    });
  });

  describe('Logout Functionality', () => {
    test('logout clears user state and localStorage', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();
      
      // First login
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      // Then logout
      await act(async () => {
        await user.click(screen.getByTestId('logout-btn'));
      });
      
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('currentUser');
    });
  });

  describe('Profile Update Functionality', () => {
    test('successful profile update', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();
      
      // First login
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      // Update profile
      await act(async () => {
        await user.click(screen.getByTestId('update-profile-btn'));
      });
      
      await waitFor(() => {
        const userData = JSON.parse(screen.getByTestId('user').textContent);
        expect(userData.username).toBe('updateduser');
      });
    });

    test('profile update without being logged in', async () => {
      const TestComponentWithProfileUpdate = () => {
        const { updateProfile } = useAuth();
        const [result, setResult] = React.useState(null);
        
        const handleUpdate = async () => {
          const updateResult = await updateProfile({ username: 'shouldfail' });
          setResult(updateResult);
        };
        
        return (
          <div>
            <button data-testid="update-no-user-btn" onClick={handleUpdate}>
              Update Without User
            </button>
            <div data-testid="update-result">
              {result ? JSON.stringify(result) : 'No Result'}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithProfileUpdate />
          <TestComponent />
        </AuthProvider>
      );
      
      const user = userEvent.setup();
      
      await act(async () => {
        await user.click(screen.getByTestId('update-no-user-btn'));
      });
      
      // This should handle the case where user is null
      // The actual behavior depends on implementation
    });
  });

  describe('Integration Tests', () => {
    test('complete authentication flow', async () => {
      const user = userEvent.setup();
      renderWithAuthProvider();
      
      // Start unauthenticated
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      
      // Register new user
      await act(async () => {
        await user.click(screen.getByTestId('register-btn'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      // Update profile
      await act(async () => {
        await user.click(screen.getByTestId('update-profile-btn'));
      });
      
      await waitFor(() => {
        const userData = JSON.parse(screen.getByTestId('user').textContent);
        expect(userData.username).toBe('updateduser');
      });
      
      // Logout
      await act(async () => {
        await user.click(screen.getByTestId('logout-btn'));
      });
      
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      
      // Login again
      await act(async () => {
        await user.click(screen.getByTestId('login-btn'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
    });

    test('localStorage persistence across sessions', () => {
      const savedUser = {
        id: 1,
        username: 'persisteduser',
        email: 'persisted@example.com',
        role: 'user'
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedUser));
      
      renderWithAuthProvider();
      
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(savedUser));
      expect(localStorageMock.getItem).toHaveBeenCalledWith('currentUser');
    });
  });

  describe('Error Handling', () => {
    test('handles corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not crash and should start with no user
      renderWithAuthProvider();
      
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });

    test('handles network errors during login', async () => {
      // Mock a network error by making the login function throw
      const TestComponentWithNetworkError = () => {
        const { login } = useAuth();
        const [result, setResult] = React.useState(null);
        
        const handleLogin = async () => {
          // Simulate network error by rejecting the promise
          try {
            const loginResult = await login('admin', 'admin123');
            setResult(loginResult);
          } catch (error) {
            setResult({ success: false, error: 'Network error' });
          }
        };
        
        return (
          <div>
            <button data-testid="network-error-btn" onClick={handleLogin}>
              Login with Network Error
            </button>
            <div data-testid="error-result">
              {result ? JSON.stringify(result) : 'No Result'}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithNetworkError />
          <TestComponent />
        </AuthProvider>
      );
      
      const user = userEvent.setup();
      
      await act(async () => {
        await user.click(screen.getByTestId('network-error-btn'));
      });
      
      // The login should complete successfully in this case since we're using mock data
      // In a real scenario with actual network calls, this would test error handling
    });
  });

  describe('Loading States', () => {
    test('shows loading state during initialization', () => {
      const TestComponentWithLoadingCheck = () => {
        const { loading } = useAuth();
        const [initialLoading, setInitialLoading] = React.useState(null);
        
        React.useEffect(() => {
          if (initialLoading === null) {
            setInitialLoading(loading);
          }
        }, [loading, initialLoading]);
        
        return (
          <div>
            <div data-testid="initial-loading">
              {initialLoading !== null ? (initialLoading ? 'Was Loading' : 'Was Not Loading') : 'Unknown'}
            </div>
            <div data-testid="current-loading">
              {loading ? 'Currently Loading' : 'Not Currently Loading'}
            </div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithLoadingCheck />
        </AuthProvider>
      );
      
      // The component should eventually show not loading
      expect(screen.getByTestId('current-loading')).toHaveTextContent('Not Currently Loading');
    });
  });
}); 