@echo off
echo Building Inventory Management System Installer...
echo.

npm run build

if %ERRORLEVEL% neq 0 (
  echo Error building React app!
  pause
  exit /b %ERRORLEVEL%
)

echo React build completed successfully.
echo.
echo Packaging Electron app...

npx electron-builder --win --publish never

if %ERRORLEVEL% neq 0 (
  echo Error packaging Electron app!
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo Installer created successfully in the release folder!
echo.

pause