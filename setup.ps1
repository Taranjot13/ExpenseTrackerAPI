# Expense Tracker API - Setup & Run Script
# This script will help you set up and run the project

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Expense Tracker API Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    pause
    exit
}

# Check npm installation
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    pause
    exit
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Installing Dependencies" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Installing npm packages (this may take a few minutes)..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    pause
    exit
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Environment Configuration" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host ".env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit the .env file with your configuration!" -ForegroundColor Yellow
    Write-Host "Especially set a secure JWT_SECRET" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Database Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.version()" --quiet 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB is not running or not installed" -ForegroundColor Yellow
        Write-Host "The application requires MongoDB to run." -ForegroundColor Yellow
        Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ MongoDB check failed - mongosh not found" -ForegroundColor Yellow
    Write-Host "Install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

Write-Host ""

# Check Redis (optional)
Write-Host "Checking Redis connection..." -ForegroundColor Yellow
try {
    # Try checking Docker container first
    $dockerRedis = docker ps --filter "name=expense-tracker-redis" --format "{{.Status}}" 2>$null
    if ($dockerRedis -like "*Up*") {
        Write-Host "✓ Redis is running via Docker (caching enabled)" -ForegroundColor Green
    } else {
        # Check if Redis CLI is available locally
        $redisTest = redis-cli ping 2>&1
        if ($redisTest -eq "PONG") {
            Write-Host "✓ Redis is running locally (caching enabled)" -ForegroundColor Green
        } else {
            Write-Host "⚠ Redis is not running (optional)" -ForegroundColor Yellow
            Write-Host "  To start Redis with Docker: docker-compose up -d" -ForegroundColor Yellow
            Write-Host "  Or use the management script: .\redis-docker.ps1" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠ Redis not found (optional, application will run without caching)" -ForegroundColor Yellow
    Write-Host "  To set up Redis: docker-compose up -d" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Edit .env file if needed (set JWT_SECRET, database URLs)" -ForegroundColor White
Write-Host "3. Run: npm run dev (development) or npm start (production)" -ForegroundColor White
Write-Host ""

Write-Host "Do you want to start the server now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Setup complete! Run 'npm run dev' when you're ready to start the server." -ForegroundColor Green
}
