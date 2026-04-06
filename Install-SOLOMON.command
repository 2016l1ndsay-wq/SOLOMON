#!/bin/bash

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Installing..."
    brew install node
fi

# Install dependencies
npm install

# Create .env file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
    echo "Please enter your API key:" 
    read API_KEY
    echo "API_KEY=[32m$API_KEY[0m" > .env
fi

# Start backend server
( cd backend && npm start & )

# Start frontend server
( cd frontend && npm start & )

# Open browser to localhost:3000
open http://localhost:3000

echo "All servers are started and browser is opened at http://localhost:3000!"