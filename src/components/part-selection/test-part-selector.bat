@echo off
echo Running tests for PartSelector component...

rem Navigate to the project root
cd ..\..\..

rem Run the test for the part selector
npx jest src/components/part-selection/part-selector.test.tsx --verbose

rem Check if tests passed
if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Tests passed successfully!
  echo The rebuilt PartSelector component is working correctly.
) else (
  echo.
  echo ❌ Tests failed. Please fix the issues and try again.
)

pause 