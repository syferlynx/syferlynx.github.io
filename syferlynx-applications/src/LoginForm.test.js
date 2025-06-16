import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import { AuthProvider } from './AuthContext';

// Mock AuthContext
const mockAuthContext = {
  user: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  loading: false,
  isAuthenticated: false,
};

// Mock the useAuth hook
jest.mock('./AuthContext', () => ({
  ...jest.requireActual('./AuthContext'),
  useAuth: () => mockAuthContext,
}));

const renderLoginForm = (onToggleMode = jest.fn()) => {
  return render(<LoginForm onToggleMode={onToggleMode} />);
};

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.login.mockResolvedValue({ success: true });
  });

  describe('Unit Tests', () => {
    test('renders login form with all elements', () => {
      renderLoginForm();

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Username or Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Sign In' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Sign up here')).toBeInTheDocument();
    });

    test('renders demo credentials section', () => {
      renderLoginForm();

      expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
      expect(screen.getByText(/Admin: admin \/ admin123/)).toBeInTheDocument();
      expect(screen.getByText(/User: user \/ user123/)).toBeInTheDocument();
    });

    test('form inputs are initially empty', () => {
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(usernameInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });

    test('password visibility toggle works', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      // Initially password should be hidden
      expect(passwordInput.type).toBe('password');

      // Click toggle to show password
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      // Click toggle to hide password again
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    test('form inputs update correctly', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpass');

      expect(usernameInput.value).toBe('testuser');
      expect(passwordInput.value).toBe('testpass');
    });

    test('toggle mode button calls onToggleMode', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();
      renderLoginForm(mockToggle);

      const toggleButton = screen.getByText('Sign up here');
      await user.click(toggleButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    test('shows error when submitting empty form', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    test('shows error when username is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    test('shows error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'testuser');
      await user.click(submitButton);

      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    test('error clears when user starts typing', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      // Submit empty form to show error
      await user.click(submitButton);
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();

      // Start typing to clear error
      await user.type(usernameInput, 'a');
      expect(
        screen.queryByText('Please fill in all fields'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('successful login submission', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      expect(mockAuthContext.login).toHaveBeenCalledWith('admin', 'admin123');
    });

    test('failed login shows error message', async () => {
      mockAuthContext.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'invalid');
      await user.type(passwordInput, 'invalid');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    test('handles login exception', async () => {
      mockAuthContext.login.mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('An unexpected error occurred'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state during submission', async () => {
      // Mock login to return a promise that we can control
      let resolveLogin;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockAuthContext.login.mockReturnValue(loginPromise);

      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');

      // Start submission
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the login
      resolveLogin({ success: true });

      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
      });
    });

    test('disables form elements during loading', async () => {
      let resolveLogin;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockAuthContext.login.mockReturnValue(loginPromise);

      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      const toggleModeButton = screen.getByText('Sign up here');

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      // All form elements should be disabled during loading
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(toggleModeButton).toBeDisabled();

      resolveLogin({ success: true });

      await waitFor(() => {
        expect(usernameInput).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    test('form has proper labels and structure', () => {
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(usernameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('error messages are properly associated', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(submitButton);

      const errorMessage = screen.getByText('Please fill in all fields');
      expect(errorMessage).toHaveClass('text-red-700');
    });

    test('password toggle button is accessible', () => {
      renderLoginForm();

      const toggleButtons = screen.getAllByRole('button');
      const passwordToggle = toggleButtons.find((button) =>
        button.className.includes('absolute'),
      );

      expect(passwordToggle).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('complete login flow with valid credentials', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      // Fill form
      await user.type(screen.getByLabelText('Username or Email'), 'admin');
      await user.type(screen.getByLabelText('Password'), 'admin123');

      // Toggle password visibility
      const toggleButton = screen
        .getAllByRole('button')
        .find((button) => button.className.includes('absolute'));
      await user.click(toggleButton);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');

      // Submit form
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(mockAuthContext.login).toHaveBeenCalledWith('admin', 'admin123');
    });

    test('error handling and recovery flow', async () => {
      mockAuthContext.login
        .mockResolvedValueOnce({ success: false, error: 'Invalid credentials' })
        .mockResolvedValueOnce({ success: true });

      const user = userEvent.setup();
      renderLoginForm();

      // First attempt - fail
      await user.type(screen.getByLabelText('Username or Email'), 'wrong');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Clear and retry with correct credentials
      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.clear(usernameInput);
      await user.clear(passwordInput);
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(mockAuthContext.login).toHaveBeenCalledTimes(2);
      expect(mockAuthContext.login).toHaveBeenLastCalledWith(
        'admin',
        'admin123',
      );
    });

    test('form submission with Enter key', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.keyboard('{Enter}');

      expect(mockAuthContext.login).toHaveBeenCalledWith('admin', 'admin123');
    });
  });

  describe('UI/UX Tests', () => {
    test('renders with correct styling classes', () => {
      renderLoginForm();

      const container = screen.getByText('Welcome Back').closest('div');
      expect(container).toHaveClass('bg-white', 'rounded-2xl', 'shadow-2xl');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      expect(submitButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    test('demo credentials section is visible', () => {
      renderLoginForm();

      const demoSection = screen.getByText('Demo Credentials:').closest('div');
      expect(demoSection).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    test('form maintains focus management', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');

      // Tab through form elements
      await user.tab();
      expect(usernameInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    test('handles very long input values', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const longString = 'a'.repeat(1000);
      const usernameInput = screen.getByLabelText('Username or Email');

      await user.type(usernameInput, longString);
      expect(usernameInput.value).toBe(longString);
    });

    test('handles special characters in input', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const usernameInput = screen.getByLabelText('Username or Email');

      await user.type(usernameInput, specialChars);
      expect(usernameInput.value).toBe(specialChars);
    });

    test('handles rapid form submissions', async () => {
      const user = userEvent.setup();
      renderLoginForm();

      const usernameInput = screen.getByLabelText('Username or Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');

      // Rapid clicks should only trigger one submission due to loading state
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      expect(mockAuthContext.login).toHaveBeenCalledTimes(1);
    });
  });
});
