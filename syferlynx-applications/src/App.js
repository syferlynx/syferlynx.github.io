import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import AuthWrapper from './AuthWrapper';

// --- Icon Components ---
// (HomeIcon, ProfileIcon, SettingsIcon, GameIcon remain the same)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const GameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);


// --- Sidebar Component ---
const Sidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { id: 'home', title: 'Home', icon: <HomeIcon /> },
    { id: 'profile', title: 'Profile', icon: <ProfileIcon /> },
    { id: 'settings', title: 'Settings', icon: <SettingsIcon /> },
    { id: 'tictactoe', title: 'Tic Tac Toe', icon: <GameIcon /> },
  ];

  const handleLogout = () => {
    logout();
    setActiveSection('home'); // Reset to home section after logout
  };

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-700"> 
        <h1 className="text-xl font-semibold">My React App</h1> 
      </div>
      
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-700 bg-gray-750">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
            {user?.role && (
              <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                user.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); setActiveSection(item.id); }}
            className={` block px-4 py-2 rounded hover:bg-gray-700 transition duration-200 flex items-center ${activeSection === item.id ? 'bg-gray-700 font-bold border-l-4 border-blue-500 pl-3' : 'border-l-4 border-transparent' }`} >
            {item.icon} {item.title}
          </a>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition duration-200"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
      
      <div className="p-4 border-t border-gray-700"> 
        <p className="text-xs text-gray-400">&copy; 2025 My React App</p> 
      </div>
    </aside>
  );
};


// --- Content Section Components ---
// (HomeSection, ProfileSection, SettingsSection, ToggleSwitch remain the same)
const HomeSection = () => (
  <div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Welcome Home!</h3>
    <p className="text-gray-600">This is the main dashboard or home section of your application, built with React. You can put summary information, quick links, or introductory content here.</p>
    <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded text-blue-800"> This is a sample notification box within a React component. </div>
  </div>
);
const ProfileSection = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message) setMessage(''); // Clear message when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">User Profile</h3>
      <p className="text-gray-600 mb-4">Manage your profile information below.</p>
      
      {/* User Role Badge */}
      {user?.role && (
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
            user.role === 'admin' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} User
          </span>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-md">
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile-username">
              Username
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="profile-username" 
              name="username"
              type="text" 
              placeholder="Your Username" 
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile-email">
              Email
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="profile-email" 
              name="email"
              type="email" 
              placeholder="your.email@example.com" 
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <button 
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
const ToggleSwitch = ({ label, id }) => {
    const [isChecked, setIsChecked] = useState(false);
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <label htmlFor={id} className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id={id} className="sr-only" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                    <div className={`block w-14 h-8 rounded-full transition ${isChecked ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${isChecked ? 'translate-x-6' : ''}`}></div>
                </div>
            </label>
        </div>
    );
};
const SettingsSection = () => (
  <div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Application Settings</h3>
    <p className="text-gray-600 mb-4">Configure application preferences (React version).</p>
    <div className="bg-white p-6 rounded shadow-md space-y-4">
      <ToggleSwitch label="Enable Notifications" id="toggle-notifications" />
      <ToggleSwitch label="Dark Mode" id="toggle-dark-mode" />
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="language"> Language </label>
        <select id="language" className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          <option>English</option> <option>Spanish</option> <option>French</option>
        </select>
      </div>
    </div>
  </div>
);


// --- Tic Tac Toe Game Components ---

// Square Component remains the same
function Square({ value, onSquareClick, isWinning }) {
  const textColor = value === 'X' ? 'text-red-500' : 'text-blue-500';
  const bgColor = isWinning ? 'bg-cyan-300' : 'bg-gray-700 hover:bg-gray-600';
  return (
    <button
      className={`w-20 h-20 border-4 border-gray-500 flex justify-center items-center text-4xl rounded-lg transition duration-200 ${bgColor} ${textColor} font-['Press_Start_2P']`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

// Board Component remains largely the same, but receives onPlay from TicTacToeGame
function Board({ squares, onPlay, winningLine }) {
  function renderSquare(i) {
    const isWinning = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => onPlay(i)} // Call the onPlay prop directly
        isWinning={isWinning}
      />
    );
  }
   const boardRows = [];
   for (let row = 0; row < 3; row++) {
     const rowSquares = [];
     for (let col = 0; col < 3; col++) {
       rowSquares.push(renderSquare(row * 3 + col));
     }
     boardRows.push(<div key={row} className="flex gap-2">{rowSquares}</div>);
   }
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-lg flex flex-col gap-2">
       {boardRows}
    </div>
  );
}

// Tic Tac Toe Game Component - NOW receives state and handlers as props
function TicTacToeGame({ board, isXNext, onPlay, onReset }) {
  // Calculate winner and status based on props
  const { winner, line: winningLine } = calculateWinner(board) || {};

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (board.every(square => square !== null)) {
    status = "Draw!";
  } else {
    status = `Next player: ${isXNext ? 'X' : 'O'}`;
  }

  return (
    <div className="flex flex-col items-center p-4 font-['Press_Start_2P'] text-white">
       {/* Status Display */}
       <div className="mb-4 text-2xl h-8 text-cyan-400" style={{ textShadow: '0 0 5px #00ffdd' }}>
         {status}
       </div>

       {/* Game Board - passes the onPlay prop down */}
       <Board squares={board} onPlay={onPlay} winningLine={winningLine} />

       {/* Reset Button - calls the onReset prop */}
       <button
         onClick={onReset} // Use the passed-in reset handler
         className="mt-6 px-5 py-3 text-lg cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-md transition transform hover:scale-105 active:scale-95 font-['Press_Start_2P']"
       >
         Restart Game
       </button>
     </div>
  );
}

// Helper function to determine the winner (can remain standalone)
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}


// --- Main Content Area Component ---
// NOW needs to accept and pass down Tic Tac Toe state and handlers
const ContentArea = ({
    activeSection,
    tttBoard,      // <-- New prop: Tic Tac Toe board state
    tttIsXNext,    // <-- New prop: Tic Tac Toe next player state
    onTttPlay,     // <-- New prop: Handler for playing a move
    onTttReset     // <-- New prop: Handler for resetting the game
}) => {

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'profile':
        return <ProfileSection />;
      case 'settings':
        return <SettingsSection />;
      case 'tictactoe':
        // Pass the state and handlers down to TicTacToeGame
        return <TicTacToeGame
                  board={tttBoard}
                  isXNext={tttIsXNext}
                  onPlay={onTttPlay}
                  onReset={onTttReset}
               />;
      default:
        return <HomeSection />;
    }
  };

  const title = activeSection === 'tictactoe'
    ? 'Tic Tac Toe'
    : activeSection.charAt(0).toUpperCase() + activeSection.slice(1);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      </header>
      <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${activeSection === 'tictactoe' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {renderSection()}
      </main>
    </div>
  );
};


// --- Main App Component ---
// NOW holds the Tic Tac Toe state and handles authentication
function App() {
  const { isAuthenticated, loading } = useAuth();
  
  // State for active navigation section
  const [activeSection, setActiveSection] = useState('home');

  // --- Lifted Tic Tac Toe State ---
  const [tttBoard, setTttBoard] = useState(Array(9).fill(null));
  const [tttIsXNext, setTttIsXNext] = useState(true);
  // --------------------------------

  // --- Tic Tac Toe Handlers defined in App ---
  function handleTttPlay(index) {
    // Ignore if already won or square filled (check winner based on current board state)
    if (calculateWinner(tttBoard) || tttBoard[index]) {
      return;
    }
    // Create a copy of the board state
    const nextBoard = tttBoard.slice();
    // Place 'X' or 'O'
    nextBoard[index] = tttIsXNext ? 'X' : 'O';
    // Update state in App
    setTttBoard(nextBoard);
    setTttIsXNext(!tttIsXNext);
  }

  function handleTttReset() {
    // Reset state in App
    setTttBoard(Array(9).fill(null));
    setTttIsXNext(true);
  }
  // -----------------------------------------

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication forms if not logged in
  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  // Show main app if authenticated
  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased">
      {/* Sidebar doesn't need game state */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* ContentArea receives game state and handlers */}
      <ContentArea
        activeSection={activeSection}
        tttBoard={tttBoard}
        tttIsXNext={tttIsXNext}
        onTttPlay={handleTttPlay}
        onTttReset={handleTttReset}
      />
    </div>
  );
}

export default App; // Export the main App component
