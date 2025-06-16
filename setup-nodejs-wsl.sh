#!/bin/bash

echo "========================================="
echo "    Node.js Setup for WSL"
echo "========================================="
echo

# Update package list
echo "Updating package list..."
sudo apt update

# Install curl if not present
if ! command -v curl &> /dev/null; then
    echo "Installing curl..."
    sudo apt install -y curl
fi

# Install Node.js using NodeSource repository
echo "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo
echo "Verifying installation..."
node_version=$(node --version)
npm_version=$(npm --version)

echo "Node.js version: $node_version"
echo "npm version: $npm_version"

# Navigate to project directory
echo
echo "Navigating to project directory..."
cd /mnt/c/Users/david/Documents/GitHub/syferlynx.github.io/syferlynx-applications

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing project dependencies..."
    npm install
fi

echo
echo "Setup complete! You can now run the application with:"
echo "npm start"
echo
echo "Starting the application..."
npm start 