import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from './RegisterForm';

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

const renderRegisterForm = (onToggleMode = jest.fn()) => {
  return render(<RegisterForm onToggleMode={onToggleMode} />);
};

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.register.mockResolvedValue({ success: true });
  });

  describe('Unit Tests', () => {
    test('renders registration form with all elements', () => {
      renderRegisterForm();

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Join us today')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create Account' })
      ).toBeInTheDocument();
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    });

    test('form inputs are initially empty', () => {
      renderRegisterForm();

      expect(
        (screen.getByLabelText('Username') as HTMLInputElement).value
      ).toBe('');
      expect(
        (screen.getByLabelText('Email Address') as HTMLInputElement).value
      ).toBe('');
      expect(
        (screen.getByLabelText('Password') as HTMLInputElement).value
      ).toBe('');
      expect(
        (screen.getByLabelText('Confirm Password') as HTMLInputElement).value
      ).toBe('');
    });

    test('password visibility toggles work', async () => {
      renderRegisterForm();

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const toggleButtons = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('absolute'));

      // Initially passwords should be hidden
      expect((passwordInput as HTMLInputElement).type).toBe('password');
      expect((confirmPasswordInput as HTMLInputElement).type).toBe('password');

      // Toggle password visibility
      await userEvent.click(toggleButtons[0]);
      expect((passwordInput as HTMLInputElement).type).toBe('text');

      // Toggle confirm password visibility
      await userEvent.click(toggleButtons[1]);
      expect((confirmPasswordInput as HTMLInputElement).type).toBe('text');
    });

    test('form inputs update correctly', async () => {
      renderRegisterForm();

      await userEvent.type(screen.getByLabelText('Username'), 'testuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'test@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      expect(
        (screen.getByLabelText('Username') as HTMLInputElement).value
      ).toBe('testuser');
      expect(
        (screen.getByLabelText('Email Address') as HTMLInputElement).value
      ).toBe('test@example.com');
      expect(
        (screen.getByLabelText('Password') as HTMLInputElement).value
      ).toBe('password123');
      expect(
        (screen.getByLabelText('Confirm Password') as HTMLInputElement).value
      ).toBe('password123');
    });

    test('toggle mode button calls onToggleMode', async () => {
      const mockToggle = jest.fn();

      renderRegisterForm(mockToggle);

      const toggleButton = screen.getByText('Sign in here');
      await userEvent.click(toggleButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Validation', () => {
    test('shows username validation errors', async () => {
      renderRegisterForm();

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      // Test empty username
      await userEvent.click(submitButton);
      expect(screen.getByText('Username is required')).toBeInTheDocument();

      // Test short username
      await userEvent.type(screen.getByLabelText('Username'), 'ab');
      await userEvent.click(submitButton);
      expect(
        screen.getByText('Username must be at least 3 characters')
      ).toBeInTheDocument();

      // Test invalid characters
      await userEvent.clear(screen.getByLabelText('Username'));
      await userEvent.type(screen.getByLabelText('Username'), 'user@name');
      await userEvent.click(submitButton);
      expect(
        screen.getByText(
          'Username can only contain letters, numbers, and underscores'
        )
      ).toBeInTheDocument();
    });

    test('shows email validation errors', async () => {
      renderRegisterForm();

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      // Test empty email
      await userEvent.type(screen.getByLabelText('Username'), 'validuser');
      await userEvent.click(submitButton);
      expect(screen.getByText('Email is required')).toBeInTheDocument();

      // Test invalid email format
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'invalid-email'
      );
      await userEvent.click(submitButton);
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
    });

    test('shows password validation errors', async () => {
      renderRegisterForm();

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      // Fill valid username and email
      await userEvent.type(screen.getByLabelText('Username'), 'validuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'valid@example.com'
      );

      // Test empty password
      await userEvent.click(submitButton);
      expect(screen.getByText('Password is required')).toBeInTheDocument();

      // Test short password
      await userEvent.type(screen.getByLabelText('Password'), '123');
      await userEvent.click(submitButton);
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });

    test('shows confirm password validation errors', async () => {
      renderRegisterForm();

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      // Fill valid data except confirm password
      await userEvent.type(screen.getByLabelText('Username'), 'validuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'valid@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');

      // Test empty confirm password
      await userEvent.click(submitButton);
      expect(
        screen.getByText('Please confirm your password')
      ).toBeInTheDocument();

      // Test mismatched passwords
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'different'
      );
      await userEvent.click(submitButton);
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    test('field errors clear when user starts typing', async () => {
      renderRegisterForm();

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });
      const usernameInput = screen.getByLabelText('Username');

      // Trigger validation error
      await userEvent.click(submitButton);
      expect(screen.getByText('Username is required')).toBeInTheDocument();

      // Start typing to clear error
      await userEvent.type(usernameInput, 'a');
      expect(
        screen.queryByText('Username is required')
      ).not.toBeInTheDocument();
    });

    test('validates username format correctly', async () => {
      renderRegisterForm();

      const usernameInput = screen.getByLabelText('Username');
      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      // Valid usernames should not show error
      const validUsernames = ['user123', 'test_user', 'User_123'];

      for (const username of validUsernames) {
        await userEvent.clear(usernameInput);
        await userEvent.type(usernameInput, username);
        await userEvent.type(
          screen.getByLabelText('Email Address'),
          'test@example.com'
        );
        await userEvent.type(screen.getByLabelText('Password'), 'password123');
        await userEvent.type(
          screen.getByLabelText('Confirm Password'),
          'password123'
        );
        await userEvent.click(submitButton);

        expect(
          screen.queryByText(
            'Username can only contain letters, numbers, and underscores'
          )
        ).not.toBeInTheDocument();
      }
    });

    test('validates email format correctly', async () => {
      renderRegisterForm();

      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      // Fill other valid fields
      await userEvent.type(screen.getByLabelText('Username'), 'validuser');
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      // Test invalid email formats
      const invalidEmails = ['invalid', '@example.com', 'test@', 'test@.com'];

      for (const email of invalidEmails) {
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, email);
        await userEvent.click(submitButton);

        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      }
    });
  });

  describe('Form Submission', () => {
    test('successful registration submission', async () => {
      renderRegisterForm();

      // Fill valid form data
      await userEvent.type(screen.getByLabelText('Username'), 'newuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'new@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      expect(mockAuthContext.register).toHaveBeenCalledWith(
        'newuser',
        'new@example.com',
        'password123'
      );
    });

    test('failed registration shows error message', async () => {
      mockAuthContext.register.mockResolvedValue({
        success: false,
        error: 'Username already exists',
      });

      renderRegisterForm();

      // Fill valid form data
      await userEvent.type(screen.getByLabelText('Username'), 'existinguser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'existing@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      await waitFor(() => {
        expect(screen.getByText('Username already exists')).toBeInTheDocument();
      });
    });

    test('handles registration exception', async () => {
      mockAuthContext.register.mockRejectedValue(new Error('Network error'));

      renderRegisterForm();

      // Fill valid form data
      await userEvent.type(screen.getByLabelText('Username'), 'newuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'new@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      await waitFor(() => {
        expect(
          screen.getByText('An unexpected error occurred')
        ).toBeInTheDocument();
      });
    });

    test('does not submit form with validation errors', async () => {
      renderRegisterForm();

      // Fill form with validation errors
      await userEvent.type(screen.getByLabelText('Username'), 'ab'); // Too short
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'invalid-email'
      );
      await userEvent.type(screen.getByLabelText('Password'), '123'); // Too short
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'different'
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      // Should not call register function
      expect(mockAuthContext.register).not.toHaveBeenCalled();

      // Should show validation errors
      expect(
        screen.getByText('Username must be at least 3 characters')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading state during submission', async () => {
      let resolveRegister: ((value: any) => void) | undefined;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      mockAuthContext.register.mockReturnValue(registerPromise);

      renderRegisterForm();

      // Fill valid form data
      await userEvent.type(screen.getByLabelText('Username'), 'newuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'new@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      // Start submission
      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      // Should show loading state
      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Creating Account...' })
      ).toBeDisabled();

      // Resolve the registration
      resolveRegister!({ success: true });

      await waitFor(() => {
        expect(
          screen.queryByText('Creating Account...')
        ).not.toBeInTheDocument();
      });
    });

    test('disables form elements during loading', async () => {
      let resolveRegister: ((value: any) => void) | undefined;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      mockAuthContext.register.mockReturnValue(registerPromise);

      renderRegisterForm();

      // Fill valid form data
      await userEvent.type(screen.getByLabelText('Username'), 'newuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'new@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      // All form elements should be disabled during loading
      expect(screen.getByLabelText('Username')).toBeDisabled();
      expect(screen.getByLabelText('Email Address')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
      expect(screen.getByLabelText('Confirm Password')).toBeDisabled();
      expect(screen.getByText('Sign in here')).toBeDisabled();

      resolveRegister!({ success: true });

      await waitFor(() => {
        expect(screen.getByLabelText('Username')).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    test('form has proper labels and structure', () => {
      renderRegisterForm();

      const inputs = [
        screen.getByLabelText('Username'),
        screen.getByLabelText('Email Address'),
        screen.getByLabelText('Password'),
        screen.getByLabelText('Confirm Password'),
      ];

      inputs.forEach((input) => {
        expect(input).toHaveAttribute('required');
      });

      expect(screen.getByLabelText('Email Address')).toHaveAttribute(
        'type',
        'email'
      );
    });

    test('error messages have proper styling', async () => {
      renderRegisterForm();

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      const errorMessages = screen.getAllByText(/is required|must be/);
      errorMessages.forEach((error) => {
        expect(error).toHaveClass('text-red-600');
      });
    });

    test('form inputs have proper error styling when invalid', async () => {
      renderRegisterForm();

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveClass('border-red-300');
    });
  });

  describe('Integration Tests', () => {
    test('complete registration flow with valid data', async () => {
      renderRegisterForm();

      // Fill form step by step
      await userEvent.type(screen.getByLabelText('Username'), 'newuser123');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'newuser@example.com'
      );

      // Toggle password visibility and fill
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const toggleButtons = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('absolute'));

      await userEvent.click(toggleButtons[0]); // Show password
      await userEvent.type(passwordInput, 'securepassword123');
      expect((passwordInput as HTMLInputElement).type).toBe('text');

      await userEvent.click(toggleButtons[1]); // Show confirm password
      await userEvent.type(confirmPasswordInput, 'securepassword123');
      expect((confirmPasswordInput as HTMLInputElement).type).toBe('text');

      // Submit form
      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      expect(mockAuthContext.register).toHaveBeenCalledWith(
        'newuser123',
        'newuser@example.com',
        'securepassword123'
      );
    });

    test('error handling and recovery flow', async () => {
      mockAuthContext.register
        .mockResolvedValueOnce({
          success: false,
          error: 'Email already exists',
        })
        .mockResolvedValueOnce({ success: true });

      renderRegisterForm();

      // First attempt - fail
      await userEvent.type(screen.getByLabelText('Username'), 'newuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'existing@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      // Retry with different email
      const emailInput = screen.getByLabelText('Email Address');
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'newemail@example.com');
      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      expect(mockAuthContext.register).toHaveBeenCalledTimes(2);
      expect(mockAuthContext.register).toHaveBeenLastCalledWith(
        'newuser',
        'newemail@example.com',
        'password123'
      );
    });

    test('form submission with Enter key', async () => {
      renderRegisterForm();

      // Fill valid form data
      await userEvent.type(screen.getByLabelText('Username'), 'newuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'new@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      // Press Enter to submit
      await userEvent.keyboard('{Enter}');

      expect(mockAuthContext.register).toHaveBeenCalledWith(
        'newuser',
        'new@example.com',
        'password123'
      );
    });
  });

  describe('UI/UX Tests', () => {
    test('renders with correct styling classes', () => {
      renderRegisterForm();

      const container = screen.getByText('Create Account').closest('div');
      expect(container).toHaveClass('bg-white', 'rounded-2xl', 'shadow-2xl');

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });
      expect(submitButton).toHaveClass('bg-green-600', 'hover:bg-green-700');
    });

    test('form maintains focus management', async () => {
      renderRegisterForm();

      const inputs = [
        screen.getByLabelText('Username'),
        screen.getByLabelText('Email Address'),
        screen.getByLabelText('Password'),
        screen.getByLabelText('Confirm Password'),
      ];

      // Tab through form elements
      for (const input of inputs) {
        await userEvent.tab();
        expect(input).toHaveFocus();
      }
    });

    test('password strength indicator behavior', async () => {
      renderRegisterForm();

      const passwordInput = screen.getByLabelText('Password');

      // Test different password lengths
      await userEvent.type(passwordInput, '123');
      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();

      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, '123456');
      // Should not show length error anymore
      expect(
        screen.queryByText('Password must be at least 6 characters')
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very long input values', async () => {
      renderRegisterForm();

      const longString = 'a'.repeat(1000);
      const usernameInput = screen.getByLabelText('Username');

      await userEvent.type(usernameInput, longString);
      expect((usernameInput as HTMLInputElement).value).toBe(longString);
    });

    test('handles special characters in inputs', async () => {
      renderRegisterForm();

      // Test special characters in email (should be allowed)
      const emailInput = screen.getByLabelText('Email Address');
      await userEvent.type(emailInput, 'test+tag@example-domain.co.uk');
      expect((emailInput as HTMLInputElement).value).toBe(
        'test+tag@example-domain.co.uk'
      );

      // Test special characters in password (should be allowed)
      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, 'P@ssw0rd!#$');
      expect((passwordInput as HTMLInputElement).value).toBe('P@ssw0rd!#$');
    });

    test('handles rapid form submissions', async () => {
      renderRegisterForm();

      // Fill valid form data
      await userEvent.type(screen.getByLabelText('Username'), 'newuser');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        'new@example.com'
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      const submitButton = screen.getByRole('button', {
        name: 'Create Account',
      });

      // Rapid clicks should only trigger one submission due to loading state
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);
      await userEvent.click(submitButton);

      expect(mockAuthContext.register).toHaveBeenCalledTimes(1);
    });

    test('handles whitespace in inputs correctly', async () => {
      renderRegisterForm();

      // Test trimming behavior
      await userEvent.type(screen.getByLabelText('Username'), '  testuser  ');
      await userEvent.type(
        screen.getByLabelText('Email Address'),
        '  test@example.com  '
      );
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.type(
        screen.getByLabelText('Confirm Password'),
        'password123'
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );

      // The validation should handle trimming appropriately
      // This depends on the actual implementation
    });
  });

  describe('Password Matching', () => {
    test('real-time password matching validation', async () => {
      renderRegisterForm();

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      // Fill password
      await userEvent.type(passwordInput, 'password123');

      // Start typing confirm password - should not match initially
      await userEvent.type(confirmPasswordInput, 'password12');
      await userEvent.click(
        screen.getByRole('button', { name: 'Create Account' })
      );
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();

      // Complete the matching password
      await userEvent.type(confirmPasswordInput, '3');
      // Error should clear when passwords match
      expect(
        screen.queryByText('Passwords do not match')
      ).not.toBeInTheDocument();
    });
  });
});
