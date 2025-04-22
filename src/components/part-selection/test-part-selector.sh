#!/bin/bash

# Navigate to the project root (assuming this script is executed from the part-selection directory)
cd ../../..

# Run the test for the part selector
echo "Running tests for PartSelector component..."
npx jest src/components/part-selection/part-selector.test.tsx --verbose

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ Tests passed successfully!"
  echo "The rebuilt PartSelector component is working correctly."
else
  echo "❌ Tests failed. Please fix the issues and try again."
fi 