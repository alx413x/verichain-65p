#!/bin/bash

# Setup script to copy contract artifacts to public folder

echo "📦 Copying contract artifacts to public folder..."

# Create public/abis directory if it doesn't exist
mkdir -p public/abis

# Copy deployed.json
if [ -f "contractsLogic/doc/deployed.json" ]; then
  cp contractsLogic/doc/deployed.json public/deployed.json
  echo "✅ Copied deployed.json"
else
  echo "⚠️  Warning: contractsLogic/doc/deployed.json not found"
fi

# Copy all ABIs
if [ -d "contractsLogic/doc/abis" ]; then
  cp contractsLogic/doc/abis/*.json public/abis/ 2>/dev/null
  echo "✅ Copied ABIs to public/abis/"
else
  echo "⚠️  Warning: contractsLogic/doc/abis/ not found"
fi

echo "✨ Setup complete!"
