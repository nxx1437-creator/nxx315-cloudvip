@echo off
REM 🤖 NXX315 CloudVIP - Dual AI Setup Script (Windows)

setlocal enabledelayedexpansion

echo.
echo 🚀 NXX315 CloudVIP - Dual AI Integration Setup (Windows)
echo ========================================================
echo.

REM Check Python
echo 📍 Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.11+ from python.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✅ Found: !PYTHON_VERSION!
)

REM Check Node
echo 📍 Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ from nodejs.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Found: !NODE_VERSION!
)

REM Install Aider
echo.
echo 🤖 Installing Aider...
pip install aider-chat
echo ✅ Aider installed

REM Check .env.local
echo.
echo 🔑 Checking API Keys...
if exist ".env.local" (
    echo ✅ Found .env.local
) else (
    echo ⚠️  .env.local not found
    if exist ".env.example" (
        echo 📝 Creating from .env.example...
        copy .env.example .env.local
        echo ⚠️  Please edit .env.local and add:
        echo    OPENAI_API_KEY=sk-proj-xxxxx
        echo    GITHUB_TOKEN=ghp_xxxxx
    )
)

REM Create .aiderignore
echo.
echo 📋 Setting up Aider configuration...
if exist ".aiderignore" (
    echo ✅ .aiderignore exists
) else (
    echo 📝 Creating .aiderignore...
    (
        echo node_modules/
        echo dist/
        echo build/
        echo .env*
        echo *.log
        echo .git/
    ) > .aiderignore
    echo ✅ .aiderignore created
)

REM Install NPM dependencies
echo.
echo 📦 Checking NPM dependencies...
if exist "node_modules" (
    echo ✅ node_modules exists
) else (
    echo 📥 Installing dependencies...
    npm install
)

REM Summary
echo.
echo ================================
echo ✅ Setup Complete!
echo ================================
echo.
echo 📚 What's Next?
echo.
echo 1️⃣  Setup Aider locally:
echo    cd nxx315-cloudvip
echo    aider
echo.
echo 2️⃣  Or use GitHub Actions (automatic):
echo    - Label an issue with 'ai-fix'
echo    - GitHub Actions will auto-run Aider
echo.
echo 3️⃣  Install Continue extension in VS Code:
echo    - Open VS Code
echo    - Go to Extensions (Ctrl+Shift+X)
echo    - Search 'Continue'
echo    - Click Install
echo.
echo 4️⃣  Configure environment variables:
echo    - Edit .env.local
echo    - Add OPENAI_API_KEY
echo    - Add GITHUB_TOKEN (optional)
echo.
echo 📖 Documentation:
echo    - Aider: https://aider.chat
echo    - Continue: https://continue.dev
echo.
echo Happy coding! 🚀
echo.
pause
