import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AuthProvider, useAuth, AuthContextType } from './AuthContext';

// Mock the useAuth hook to provide authenticated user
jest.mock('./AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockAuthContextValue: AuthContextType = {
  user: {
    id: 1,
    username: 'CurrentUser',
    email: 'current.user@example.com',
    role: 'user' as const,
  },
  login: jest.fn().mockResolvedValue({ success: true }),
  register: jest.fn().mockResolvedValue({ success: true }),
  logout: jest.fn(),
  updateProfile: jest.fn().mockResolvedValue({ success: true }),
  loading: false,
  isAuthenticated: true,
};

// Helper function to render App with authentication
const renderAppWithAuth = (customMockUser?: Partial<AuthContextType>) => {
  const mockUser = customMockUser || mockAuthContextValue;
  (useAuth as jest.Mock).mockReturnValue(mockUser);
  return render(<App />);
};

describe('App Component', () => {
  beforeEach(() => {
    // Reset and setup mock for each test
    (useAuth as jest.Mock).mockReturnValue(mockAuthContextValue);
  });

  describe('Unit Tests', () => {
    test('renders main application structure when authenticated', () => {
      renderAppWithAuth();

      expect(screen.getByText('My React App')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /profile/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /settings/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /tic tac toe/i })
      ).toBeInTheDocument();
    });

    test('renders home section by default', () => {
      renderAppWithAuth();

      expect(screen.getByText('Welcome Home!')).toBeInTheDocument();
      expect(
        screen.getByText(/This is the main dashboard/)
      ).toBeInTheDocument();
    });

    test('sidebar navigation works correctly', async () => {
      renderAppWithAuth();

      // Click on Profile
      await userEvent.click(screen.getByRole('button', { name: /profile/i }));
      expect(screen.getByText('User Profile')).toBeInTheDocument();

      // Click on Settings
      await userEvent.click(screen.getByRole('button', { name: /settings/i }));
      expect(screen.getByText('Application Settings')).toBeInTheDocument();

      // Click on Tic Tac Toe
      await userEvent.click(
        screen.getByRole('button', { name: /tic tac toe/i })
      );
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
    });

    test('profile section renders correctly', async () => {
      renderAppWithAuth();

      await userEvent.click(screen.getByRole('button', { name: /profile/i }));

      expect(screen.getByDisplayValue('CurrentUser')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('current.user@example.com')
      ).toBeInTheDocument();
      expect(screen.getByText('Save Profile')).toBeInTheDocument();
    });

    test('settings section renders with toggle switches', async () => {
      renderAppWithAuth();

      await userEvent.click(screen.getByRole('button', { name: /settings/i }));

      expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('Language')).toBeInTheDocument();
    });
  });

  describe('Tic Tac Toe Game Tests', () => {
    beforeEach(() => {
      renderAppWithAuth();
      fireEvent.click(screen.getByRole('button', { name: /tic tac toe/i }));
    });

    test('initializes game with empty board', () => {
      expect(screen.getByText('Next player: X')).toBeInTheDocument();

      // Check that all squares are empty (no X or O text)
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));
      expect(squares).toHaveLength(9);
      squares.forEach((square) => {
        expect(square.textContent).toBe('');
      });
    });

    test('allows players to make moves', async () => {
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // First move - X
      await userEvent.click(squares[0]);
      expect(squares[0]).toHaveTextContent('X');
      expect(screen.getByText('Next player: O')).toBeInTheDocument();

      // Second move - O
      await userEvent.click(squares[1]);
      expect(squares[1]).toHaveTextContent('O');
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
    });

    test('prevents moves on occupied squares', async () => {
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // Make first move
      await userEvent.click(squares[0]);
      expect(squares[0]).toHaveTextContent('X');

      // Try to click same square again
      await userEvent.click(squares[0]);
      expect(squares[0]).toHaveTextContent('X'); // Should still be X
      expect(screen.getByText('Next player: O')).toBeInTheDocument(); // Should still be O's turn
    });

    test('detects horizontal win', async () => {
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // X wins top row: X-X-X, O-O-_
      await userEvent.click(squares[0]); // X
      await userEvent.click(squares[3]); // O
      await userEvent.click(squares[1]); // X
      await userEvent.click(squares[4]); // O
      await userEvent.click(squares[2]); // X wins

      expect(screen.getByText('Winner: X')).toBeInTheDocument();
    });

    test('detects vertical win', async () => {
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // X wins first column: X-O-_, X-O-_, X-_-_
      await userEvent.click(squares[0]); // X
      await userEvent.click(squares[1]); // O
      await userEvent.click(squares[3]); // X
      await userEvent.click(squares[4]); // O
      await userEvent.click(squares[6]); // X wins

      expect(screen.getByText('Winner: X')).toBeInTheDocument();
    });

    test('detects diagonal win', async () => {
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // X wins diagonal: X-O-_, _-X-O, _-_-X
      await userEvent.click(squares[0]); // X
      await userEvent.click(squares[1]); // O
      await userEvent.click(squares[4]); // X
      await userEvent.click(squares[5]); // O
      await userEvent.click(squares[8]); // X wins

      expect(screen.getByText('Winner: X')).toBeInTheDocument();
    });

    test('detects draw game', async () => {
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // Create a draw: X-O-X, O-O-X, O-X-O
      const moves = [0, 1, 2, 3, 5, 4, 6, 8, 7]; // Sequence that results in draw
      const players = ['X', 'O'];

      for (let i = 0; i < moves.length; i++) {
        await userEvent.click(squares[moves[i]]);
      }

      expect(screen.getByText('Draw!')).toBeInTheDocument();
    });

    test('restart button resets the game', async () => {
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // Make some moves
      await userEvent.click(squares[0]); // X
      await userEvent.click(squares[1]); // O

      // Click restart
      await userEvent.click(screen.getByText('Restart Game'));

      // Check game is reset
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
      squares.forEach((square) => {
        expect(square.textContent).toBe('');
      });
    });
  });

  describe('Toggle Switch Tests', () => {
    test('toggle switches work correctly', async () => {
      renderAppWithAuth();

      await userEvent.click(screen.getByRole('button', { name: /settings/i }));

      const notificationToggle = screen.getByLabelText('Enable Notifications');
      const darkModeToggle = screen.getByLabelText('Dark Mode');

      // Initially unchecked
      expect(notificationToggle).not.toBeChecked();
      expect(darkModeToggle).not.toBeChecked();

      // Click to toggle
      await userEvent.click(notificationToggle);
      await userEvent.click(darkModeToggle);

      expect(notificationToggle).toBeChecked();
      expect(darkModeToggle).toBeChecked();
    });
  });

  describe('Integration Tests', () => {
    test('complete user workflow - navigation and game play', async () => {
      renderAppWithAuth();

      // Start at home
      expect(screen.getByText('Welcome Home!')).toBeInTheDocument();

      // Navigate to profile
      await userEvent.click(screen.getByRole('button', { name: /profile/i }));
      expect(screen.getByText('User Profile')).toBeInTheDocument();

      // Navigate to settings and toggle a switch
      await userEvent.click(screen.getByRole('button', { name: /settings/i }));
      const toggle = screen.getByLabelText('Enable Notifications');
      await userEvent.click(toggle);
      expect(toggle).toBeChecked();

      // Navigate to tic-tac-toe and play a game
      await userEvent.click(
        screen.getByRole('button', { name: /tic tac toe/i })
      );
      const squares = screen
        .getAllByRole('button')
        .filter((button) => button.className.includes('w-20 h-20'));

      // Play a quick game
      await userEvent.click(squares[0]); // X
      await userEvent.click(squares[1]); // O
      await userEvent.click(squares[3]); // X
      await userEvent.click(squares[4]); // O
      await userEvent.click(squares[6]); // X wins

      expect(screen.getByText('Winner: X')).toBeInTheDocument();

      // Reset and verify
      await userEvent.click(screen.getByText('Restart Game'));
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
    });

    test('sidebar active state updates correctly', async () => {
      renderAppWithAuth();

      // Check initial active state (Home should be active)
      const homeLink = screen.getByRole('button', { name: /home/i });
      expect(homeLink).toHaveClass('bg-gray-700');

      // Click Profile and check active state
      await userEvent.click(screen.getByRole('button', { name: /profile/i }));
      const profileLink = screen.getByRole('button', { name: /profile/i });
      expect(profileLink).toHaveClass('bg-gray-700');
      expect(homeLink).not.toHaveClass('bg-gray-700');
    });
  });

  describe('Error Handling', () => {
    test('throws error when used without AuthProvider', () => {
      // Reset the mock to its original behavior for this test
      (useAuth as jest.Mock).mockImplementation(() => {
        throw new Error('useAuth must be used within an AuthProvider');
      });

      expect(() => {
        render(<App />);
      }).toThrow('useAuth must be used within an AuthProvider');

      // Restore the mock for other tests
      (useAuth as jest.Mock).mockReturnValue(mockAuthContextValue);
    });
  });
});

// Test helper functions
describe('calculateWinner helper function', () => {
  // Since calculateWinner is not exported, we'll test it through the game behavior
  // The function is already tested indirectly through the game win detection tests above

  test('calculateWinner is working through game behavior', async () => {
    renderAppWithAuth();

    await userEvent.click(screen.getByRole('button', { name: /tic tac toe/i }));
    const squares = screen
      .getAllByRole('button')
      .filter((button) => button.className.includes('w-20 h-20'));

    // Test that the helper function correctly identifies wins
    await userEvent.click(squares[0]); // X
    await userEvent.click(squares[3]); // O
    await userEvent.click(squares[1]); // X
    await userEvent.click(squares[4]); // O
    await userEvent.click(squares[2]); // X wins top row

    expect(screen.getByText('Winner: X')).toBeInTheDocument();
  });
});
