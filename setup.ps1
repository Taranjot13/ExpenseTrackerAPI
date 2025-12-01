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
    Write-Host "[Success] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[Error] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    pause
    exit
}

# Check npm installation
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "[Success] npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[Error] npm is not installed!" -ForegroundColor Red
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
    Write-Host "[Success] Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "[Error] Failed to install dependencies!" -ForegroundColor Red
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
    Write-Host "[Success] .env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit the .env file with your configuration!" -ForegroundColor Yellow
    Write-Host "Especially set a secure JWT_SECRET" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "[Success] .env file already exists" -ForegroundColor Green
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
        Write-Host "[Success] MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "[Warning] MongoDB is not running or not installed" -ForegroundColor Yellow
        Write-Host "The application requires MongoDB to run." -ForegroundColor Yellow
        Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[Warning] MongoDB check failed - mongosh not found" -ForegroundColor Yellow
    Write-Host "Install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

Write-Host ""

# Check PostgreSQL (optional)
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
try {
    # Check if psql is available
    $psqlVersion = psql --version 2>&1
    if ($psqlVersion -like "*psql*") {
        Write-Host "[Success] PostgreSQL client found: $psqlVersion" -ForegroundColor Green
        Write-Host "  To use PostgreSQL, configure connection in .env file" -ForegroundColor Gray
    } else {
        Write-Host "[Warning] PostgreSQL not found (optional)" -ForegroundColor Yellow
        Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[Warning] PostgreSQL not found (optional, application runs with MongoDB only)" -ForegroundColor Yellow
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
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
