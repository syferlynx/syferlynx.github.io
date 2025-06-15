import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AuthProvider } from './AuthContext';

// Mock the AuthContext to provide authenticated user
const MockAuthProvider = ({ children, mockUser = null }) => {
  const mockAuthValue = {
    user: mockUser || {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    },
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    loading: false,
    isAuthenticated: !!mockUser
  };

  return (
    <AuthProvider value={mockAuthValue}>
      {children}
    </AuthProvider>
  );
};

// Helper function to render App with authentication
const renderAppWithAuth = (mockUser) => {
  return render(
    <MockAuthProvider mockUser={mockUser}>
      <App />
    </MockAuthProvider>
  );
};

describe('App Component', () => {
  describe('Unit Tests', () => {
    test('renders main application structure when authenticated', () => {
      renderAppWithAuth();
      
      expect(screen.getByText('My React App')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
    });

    test('renders home section by default', () => {
      renderAppWithAuth();
      
      expect(screen.getByText('Welcome Home!')).toBeInTheDocument();
      expect(screen.getByText(/This is the main dashboard/)).toBeInTheDocument();
    });

    test('sidebar navigation works correctly', async () => {
      const user = userEvent.setup();
      renderAppWithAuth();
      
      // Click on Profile
      await user.click(screen.getByText('Profile'));
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      
      // Click on Settings
      await user.click(screen.getByText('Settings'));
      expect(screen.getByText('Application Settings')).toBeInTheDocument();
      
      // Click on Tic Tac Toe
      await user.click(screen.getByText('Tic Tac Toe'));
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
    });

    test('profile section renders correctly', async () => {
      const user = userEvent.setup();
      renderAppWithAuth();
      
      await user.click(screen.getByText('Profile'));
      
      expect(screen.getByDisplayValue('CurrentUser')).toBeInTheDocument();
      expect(screen.getByDisplayValue('current.user@example.com')).toBeInTheDocument();
      expect(screen.getByText('Save Profile')).toBeInTheDocument();
    });

    test('settings section renders with toggle switches', async () => {
      const user = userEvent.setup();
      renderAppWithAuth();
      
      await user.click(screen.getByText('Settings'));
      
      expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      expect(screen.getByText('Language')).toBeInTheDocument();
    });
  });

  describe('Tic Tac Toe Game Tests', () => {
    beforeEach(() => {
      renderAppWithAuth();
      fireEvent.click(screen.getByText('Tic Tac Toe'));
    });

    test('initializes game with empty board', () => {
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
      
      // Check that all squares are empty (no X or O text)
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      expect(squares).toHaveLength(9);
      squares.forEach(square => {
        expect(square.textContent).toBe('');
      });
    });

    test('allows players to make moves', async () => {
      const user = userEvent.setup();
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // First move - X
      await user.click(squares[0]);
      expect(squares[0]).toHaveTextContent('X');
      expect(screen.getByText('Next player: O')).toBeInTheDocument();
      
      // Second move - O
      await user.click(squares[1]);
      expect(squares[1]).toHaveTextContent('O');
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
    });

    test('prevents moves on occupied squares', async () => {
      const user = userEvent.setup();
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // Make first move
      await user.click(squares[0]);
      expect(squares[0]).toHaveTextContent('X');
      
      // Try to click same square again
      await user.click(squares[0]);
      expect(squares[0]).toHaveTextContent('X'); // Should still be X
      expect(screen.getByText('Next player: O')).toBeInTheDocument(); // Should still be O's turn
    });

    test('detects horizontal win', async () => {
      const user = userEvent.setup();
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // X wins top row: X-X-X, O-O-_
      await user.click(squares[0]); // X
      await user.click(squares[3]); // O
      await user.click(squares[1]); // X
      await user.click(squares[4]); // O
      await user.click(squares[2]); // X wins
      
      expect(screen.getByText('Winner: X')).toBeInTheDocument();
    });

    test('detects vertical win', async () => {
      const user = userEvent.setup();
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // X wins first column: X-O-_, X-O-_, X-_-_
      await user.click(squares[0]); // X
      await user.click(squares[1]); // O
      await user.click(squares[3]); // X
      await user.click(squares[4]); // O
      await user.click(squares[6]); // X wins
      
      expect(screen.getByText('Winner: X')).toBeInTheDocument();
    });

    test('detects diagonal win', async () => {
      const user = userEvent.setup();
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // X wins diagonal: X-O-_, _-X-O, _-_-X
      await user.click(squares[0]); // X
      await user.click(squares[1]); // O
      await user.click(squares[4]); // X
      await user.click(squares[5]); // O
      await user.click(squares[8]); // X wins
      
      expect(screen.getByText('Winner: X')).toBeInTheDocument();
    });

    test('detects draw game', async () => {
      const user = userEvent.setup();
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // Create a draw: X-O-X, O-O-X, O-X-O
      const moves = [0, 1, 2, 3, 5, 4, 6, 8, 7]; // Sequence that results in draw
      const players = ['X', 'O'];
      
      for (let i = 0; i < moves.length; i++) {
        await user.click(squares[moves[i]]);
      }
      
      expect(screen.getByText('Draw!')).toBeInTheDocument();
    });

    test('restart button resets the game', async () => {
      const user = userEvent.setup();
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // Make some moves
      await user.click(squares[0]); // X
      await user.click(squares[1]); // O
      
      // Click restart
      await user.click(screen.getByText('Restart Game'));
      
      // Check game is reset
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
      squares.forEach(square => {
        expect(square.textContent).toBe('');
      });
    });
  });

  describe('Toggle Switch Tests', () => {
    test('toggle switches work correctly', async () => {
      const user = userEvent.setup();
      renderAppWithAuth();
      
      await user.click(screen.getByText('Settings'));
      
      const notificationToggle = screen.getByLabelText('Enable Notifications');
      const darkModeToggle = screen.getByLabelText('Dark Mode');
      
      // Initially unchecked
      expect(notificationToggle).not.toBeChecked();
      expect(darkModeToggle).not.toBeChecked();
      
      // Click to toggle
      await user.click(notificationToggle);
      await user.click(darkModeToggle);
      
      expect(notificationToggle).toBeChecked();
      expect(darkModeToggle).toBeChecked();
    });
  });

  describe('Integration Tests', () => {
    test('complete user workflow - navigation and game play', async () => {
      const user = userEvent.setup();
      renderAppWithAuth();
      
      // Start at home
      expect(screen.getByText('Welcome Home!')).toBeInTheDocument();
      
      // Navigate to profile
      await user.click(screen.getByText('Profile'));
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      
      // Navigate to settings and toggle a switch
      await user.click(screen.getByText('Settings'));
      const toggle = screen.getByLabelText('Enable Notifications');
      await user.click(toggle);
      expect(toggle).toBeChecked();
      
      // Navigate to tic-tac-toe and play a game
      await user.click(screen.getByText('Tic Tac Toe'));
      const squares = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-20 h-20')
      );
      
      // Play a quick game
      await user.click(squares[0]); // X
      await user.click(squares[1]); // O
      await user.click(squares[3]); // X
      await user.click(squares[4]); // O
      await user.click(squares[6]); // X wins
      
      expect(screen.getByText('Winner: X')).toBeInTheDocument();
      
      // Reset and verify
      await user.click(screen.getByText('Restart Game'));
      expect(screen.getByText('Next player: X')).toBeInTheDocument();
    });

    test('sidebar active state updates correctly', async () => {
      const user = userEvent.setup();
      renderAppWithAuth();
      
      // Check initial active state (Home should be active)
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('bg-gray-700');
      
      // Click Profile and check active state
      await user.click(screen.getByText('Profile'));
      const profileLink = screen.getByText('Profile').closest('a');
      expect(profileLink).toHaveClass('bg-gray-700');
      expect(homeLink).not.toHaveClass('bg-gray-700');
    });
  });

  describe('Error Handling', () => {
    test('handles missing authentication gracefully', () => {
      // This would typically show the AuthWrapper instead
      render(<App />);
      // The actual behavior depends on how AuthContext handles missing provider
      // This test ensures the app doesn't crash
    });
  });
});

// Test helper functions
describe('calculateWinner helper function', () => {
  // Since calculateWinner is not exported, we'll test it through the game behavior
  // The function is already tested indirectly through the game win detection tests above
  
  test('calculateWinner is working through game behavior', async () => {
    const user = userEvent.setup();
    renderAppWithAuth();
    
    await user.click(screen.getByText('Tic Tac Toe'));
    const squares = screen.getAllByRole('button').filter(button => 
      button.className.includes('w-20 h-20')
    );
    
    // Test that the helper function correctly identifies wins
    await user.click(squares[0]); // X
    await user.click(squares[3]); // O
    await user.click(squares[1]); // X
    await user.click(squares[4]); // O
    await user.click(squares[2]); // X wins top row
    
    expect(screen.getByText('Winner: X')).toBeInTheDocument();
  });
});
