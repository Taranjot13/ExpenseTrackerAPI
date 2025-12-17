# Expense Tracker - Quick Start Script

Write-Host "[Info] Starting Expense Tracker API..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[Info] Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "[Success] .env file created. Please update it with your settings." -ForegroundColor Green
    Write-Host "   Default MongoDB URI: mongodb://localhost:27017/expense_tracker" -ForegroundColor Gray
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[Info] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[Error] Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "[Success] Dependencies installed successfully" -ForegroundColor Green
}

# MongoDB is required for core features.
# This script no longer starts Docker containers.
Write-Host "[Info] MongoDB is required. Ensure it's running locally:" -ForegroundColor Yellow
Write-Host "  - MONGODB_URI defaults to: mongodb://localhost:27017/expense_tracker" -ForegroundColor Gray
Write-Host "  - Start MongoDB (Windows service): net start MongoDB" -ForegroundColor Gray
Write-Host "  - Or start mongod manually: mongod" -ForegroundColor Gray

Write-Host ""
Write-Host "[Success] Everything is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  Development mode: npm run dev" -ForegroundColor White
Write-Host "  Production mode:  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Application will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tip: If the app can't connect, start MongoDB and re-run npm run dev" -ForegroundColor Gray
