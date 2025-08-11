@echo off
echo 🧠 NeuroMesh Extension Launcher
echo ===============================
echo.

echo 📦 Compiling extension...
call npm run compile
if %errorlevel% neq 0 (
    echo ❌ Compilation failed!
    pause
    exit /b 1
)

echo ✅ Compilation successful!
echo.

echo 🚀 Launching VS Code with extension...
echo.
echo Instructions:
echo 1. VS Code will open with the extension loaded
echo 2. Look for the NeuroMesh icon (🧠) in the Activity Bar
echo 3. Click the icon to open the NeuroMesh sidebar
echo 4. Use Ctrl+Shift+P to access NeuroMesh commands
echo.

code --extensionDevelopmentPath="%cd%"

echo.
echo 📖 See DEMO.md for detailed demonstration steps
echo 📋 See TESTING.md for comprehensive testing guide
pause
