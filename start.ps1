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

# Start Docker containers
Write-Host "[Docker] Starting MongoDB container..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[Error] Failed to start Docker containers" -ForegroundColor Red
    exit 1
}

# Wait for containers to be ready
Write-Host "[Info] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check container status
$mongoStatus = docker ps --filter "name=expense-tracker-mongodb" --format "{{.Status}}"

if ($mongoStatus) {
    Write-Host "[Success] MongoDB: Running" -ForegroundColor Green
} else {
    Write-Host "[Warning] MongoDB container may not be running properly" -ForegroundColor Yellow
    docker-compose ps
}

Write-Host ""
Write-Host "[Success] Everything is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  Development mode: npm run dev" -ForegroundColor White
Write-Host "  Production mode:  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Application will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop services: docker-compose down" -ForegroundColor Gray
