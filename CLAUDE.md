# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This repository contains two main components:

1. **Root Level**: GitHub Pages site with Hyper-V setup utilities
2. **syferlynx-applications/**: React application with authentication system

### Core Application (`syferlynx-applications/`)

A React application featuring:
- Authentication system with mock users (admin/admin123, user/user123)
- Multi-section dashboard (Home, Profile, Settings, Tic Tac Toe game)
- Context-based authentication state management
- Comprehensive test suite with 80%+ coverage requirements

## Common Development Commands

### React Application (`syferlynx-applications/`)

```bash
# Development
cd syferlynx-applications
npm start                    # Start development server (localhost:3000)
npm run build               # Build for production
npm run eject               # Eject from Create React App (one-way operation)

# Testing
npm test                    # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report
npm run test:ci            # Run tests for CI/CD (no watch)
npm run test:watch         # Run tests in watch mode (explicit)
npm run test:debug         # Run tests with debugger

# Specific test commands
npm test App.test.js                              # Run specific test file
npm test -- --testNamePattern="login"            # Run tests matching pattern
npm test -- --testPathPattern="AuthContext"      # Run tests for specific component
```

### Docker Operations

```bash
# Production
docker-compose up --build                        # Build and run production
docker build -t syferlynx-app .                 # Build production image
docker run -p 3000:80 syferlynx-app             # Run production container

# Development
docker-compose --profile dev up --build syferlynx-dev  # Run development with hot reload
docker build -f Dockerfile.dev -t syferlynx-app-dev . # Build development image

# Management
docker-compose down                              # Stop containers
docker-compose logs                              # View logs
docker-compose exec syferlynx-app sh           # Execute shell in container
```

## Architecture Overview

### Authentication System

The application uses React Context for authentication state management:

- **AuthContext** (`src/AuthContext.js`): Manages authentication state, login/register/logout functions
- **AuthWrapper** (`src/AuthWrapper.js`): Handles authentication form display
- **LoginForm/RegisterForm**: Separate components for authentication flows

Mock users are defined in AuthContext with localStorage persistence.

### Application State Management

- **Main App** (`src/App.js`): Holds top-level state including:
  - Active navigation section
  - Tic-tac-toe game state (board, current player)
  - Authentication loading state
- **Context Pattern**: Authentication state lifted to context for global access
- **Local State**: Component-specific state (forms, toggles) managed locally

### Component Hierarchy

```
App
├── AuthWrapper (when not authenticated)
│   ├── LoginForm
│   └── RegisterForm
└── Main Dashboard (when authenticated)
    ├── Sidebar (navigation)
    └── ContentArea
        ├── HomeSection
        ├── ProfileSection
        ├── SettingsSection
        └── TicTacToeGame
```

### Key Architectural Decisions

1. **Game State Lifting**: Tic-tac-toe state is managed in the main App component and passed down as props
2. **Authentication Context**: Global authentication state using React Context API
3. **Component Composition**: Sidebar and ContentArea are separate components for better separation of concerns
4. **Mock Authentication**: Uses localStorage for session persistence with mock user database

## Testing Strategy

### Coverage Requirements

- Global: 80% minimum (branches, functions, lines, statements)  
- App.js: 85% minimum
- AuthContext.js: 90% minimum (security-critical)
- Form components: 85% minimum

### Test Commands for Development

```bash
# Run tests for specific component while developing
npm test -- --watch --testPathPattern="App"
npm test -- --watch --testPathPattern="AuthContext"

# Debug failing tests
npm run test:debug

# Check coverage for specific files
npm run test:coverage -- --collectCoverageFrom="src/App.js"
```

### Test Structure

Tests are organized by component with comprehensive coverage:
- Unit tests for individual functions
- Integration tests for component interactions  
- Form validation and error handling
- Loading states and async operations
- Accessibility testing with ARIA attributes
- User interaction simulation with `@testing-library/user-event`

## Development Workflow

### Working on New Features

1. Start development server: `npm start`
2. Run tests in watch mode: `npm run test:watch`
3. Work on implementation
4. Ensure tests pass and coverage meets thresholds
5. Build for production to verify: `npm run build`

### Working with Authentication

Mock users for testing:
- Admin: username=`admin`, password=`admin123`
- User: username=`user`, password=`user123`

Authentication state persists in localStorage and survives page reloads.

### Docker Development

For containerized development with hot reloading:
```bash
docker-compose --profile dev up --build syferlynx-dev
```
This runs the development server on port 3001 with volume mounting for live updates.

## Important Files

- `syferlynx-applications/src/App.js`: Main application component with game logic
- `syferlynx-applications/src/AuthContext.js`: Authentication context and mock user database
- `syferlynx-applications/jest.config.js`: Jest configuration with coverage thresholds
- `syferlynx-applications/Dockerfile`: Multi-stage production build
- `syferlynx-applications/docker-compose.yml`: Container orchestration for dev/prod