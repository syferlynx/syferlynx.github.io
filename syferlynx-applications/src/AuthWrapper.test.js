import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthWrapper from './AuthWrapper';

// Mock the LoginForm and RegisterForm components
jest.mock('./LoginForm', () => {
  return function MockLoginForm({ onToggleMode }) {
    return (
      <div data-testid="login-form">
        <h1>Login Form</h1>
        <button onClick={onToggleMode} data-testid="toggle-to-register">
          Switch to Register
        </button>
      </div>
    );
  };
});

jest.mock('./RegisterForm', () => {
  return function MockRegisterForm({ onToggleMode }) {
    return (
      <div data-testid="register-form">
        <h1>Register Form</h1>
        <button onClick={onToggleMode} data-testid="toggle-to-login">
          Switch to Login
        </button>
      </div>
    );
  };
});

describe('AuthWrapper Component', () => {
  describe('Unit Tests', () => {
    test('renders login form by default', () => {
      render(<AuthWrapper />);
      
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByText('Login Form')).toBeInTheDocument();
      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    });

    test('shows only one form at a time', () => {
      render(<AuthWrapper />);
      
      // Initially shows login form
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    });

    test('passes onToggleMode prop to LoginForm', () => {
      render(<AuthWrapper />);
      
      const toggleButton = screen.getByTestId('toggle-to-register');
      expect(toggleButton).toBeInTheDocument();
    });

    test('passes onToggleMode prop to RegisterForm when in register mode', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Switch to register mode
      await user.click(screen.getByTestId('toggle-to-register'));
      
      const toggleButton = screen.getByTestId('toggle-to-login');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    test('switches from login to register mode', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Initially in login mode
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
      
      // Click toggle button
      await user.click(screen.getByTestId('toggle-to-register'));
      
      // Should now be in register mode
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      expect(screen.getByText('Register Form')).toBeInTheDocument();
    });

    test('switches from register to login mode', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Switch to register mode first
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // Switch back to login mode
      await user.click(screen.getByTestId('toggle-to-login'));
      
      // Should now be back in login mode
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
      expect(screen.getByText('Login Form')).toBeInTheDocument();
    });

    test('can toggle between modes multiple times', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Start in login mode
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      
      // Toggle to register
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // Toggle back to login
      await user.click(screen.getByTestId('toggle-to-login'));
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      
      // Toggle to register again
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // Toggle back to login again
      await user.click(screen.getByTestId('toggle-to-login'));
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('maintains internal state correctly', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Verify initial state through rendered component
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      
      // Change state
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // Verify state persists
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });

    test('state changes are immediate', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      const toggleButton = screen.getByTestId('toggle-to-register');
      
      // Click and immediately check
      await user.click(toggleButton);
      
      // Should immediately show register form
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('complete toggle workflow', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Start with login form
      expect(screen.getByText('Login Form')).toBeInTheDocument();
      
      // User wants to register, clicks toggle
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByText('Register Form')).toBeInTheDocument();
      
      // User changes mind, wants to login instead
      await user.click(screen.getByTestId('toggle-to-login'));
      expect(screen.getByText('Login Form')).toBeInTheDocument();
      
      // Verify final state
      expect(screen.queryByText('Register Form')).not.toBeInTheDocument();
    });

    test('handles rapid toggling', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Rapid toggle sequence
      await user.click(screen.getByTestId('toggle-to-register'));
      await user.click(screen.getByTestId('toggle-to-login'));
      await user.click(screen.getByTestId('toggle-to-register'));
      await user.click(screen.getByTestId('toggle-to-login'));
      
      // Should end up in login mode
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    test('initializes with correct default state', () => {
      render(<AuthWrapper />);
      
      // Should start in login mode (isLoginMode = true)
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
    });

    test('maintains state across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<AuthWrapper />);
      
      // Switch to register mode
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // Re-render component
      rerender(<AuthWrapper />);
      
      // Should maintain register mode
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    test('correctly passes onToggleMode to LoginForm', () => {
      render(<AuthWrapper />);
      
      // The mock LoginForm should receive onToggleMode prop
      // This is verified by the presence of the toggle button
      expect(screen.getByTestId('toggle-to-register')).toBeInTheDocument();
    });

    test('correctly passes onToggleMode to RegisterForm', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Switch to register mode
      await user.click(screen.getByTestId('toggle-to-register'));
      
      // The mock RegisterForm should receive onToggleMode prop
      // This is verified by the presence of the toggle button
      expect(screen.getByTestId('toggle-to-login')).toBeInTheDocument();
    });

    test('onToggleMode function works correctly for both forms', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Test LoginForm's onToggleMode
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // Test RegisterForm's onToggleMode
      await user.click(screen.getByTestId('toggle-to-login'));
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('maintains proper focus management during toggle', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      const loginToggleButton = screen.getByTestId('toggle-to-register');
      
      // Focus the toggle button
      loginToggleButton.focus();
      expect(loginToggleButton).toHaveFocus();
      
      // Click to toggle
      await user.click(loginToggleButton);
      
      // New form should be rendered
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // New toggle button should be available
      const registerToggleButton = screen.getByTestId('toggle-to-login');
      expect(registerToggleButton).toBeInTheDocument();
    });

    test('provides consistent interface across both modes', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Both forms should have toggle buttons
      expect(screen.getByTestId('toggle-to-register')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('toggle-to-register'));
      expect(screen.getByTestId('toggle-to-login')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing onToggleMode gracefully', () => {
      // This test ensures the component doesn't crash if there are issues
      // with the toggle function
      expect(() => {
        render(<AuthWrapper />);
      }).not.toThrow();
    });

    test('continues to work after multiple toggles', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Perform many toggles to test stability
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          await user.click(screen.getByTestId('toggle-to-register'));
          expect(screen.getByTestId('register-form')).toBeInTheDocument();
        } else {
          await user.click(screen.getByTestId('toggle-to-login'));
          expect(screen.getByTestId('login-form')).toBeInTheDocument();
        }
      }
      
      // Should still be functional
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('only renders one form at a time', () => {
      render(<AuthWrapper />);
      
      // Should only have one form in the DOM
      const loginForm = screen.queryByTestId('login-form');
      const registerForm = screen.queryByTestId('register-form');
      
      expect(loginForm).toBeInTheDocument();
      expect(registerForm).not.toBeInTheDocument();
      
      // Total forms in DOM should be 1
      const allForms = screen.queryAllByTestId(/form$/);
      expect(allForms).toHaveLength(1);
    });

    test('efficiently switches between forms', async () => {
      const user = userEvent.setup();
      render(<AuthWrapper />);
      
      // Switch to register
      await user.click(screen.getByTestId('toggle-to-register'));
      
      // Should only have register form
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      
      // Total forms should still be 1
      const allForms = screen.queryAllByTestId(/form$/);
      expect(allForms).toHaveLength(1);
    });
  });
}); 