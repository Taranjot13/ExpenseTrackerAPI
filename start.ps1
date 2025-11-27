# Expense Tracker - Quick Start Script

Write-Host "🚀 Starting Expense Tracker API..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created. Please update it with your settings." -ForegroundColor Green
    Write-Host "   Default MongoDB URI: mongodb://localhost:27017/expense_tracker" -ForegroundColor Gray
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Start Docker containers
Write-Host "🐳 Starting MongoDB and Redis containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker containers" -ForegroundColor Red
    exit 1
}

# Wait for containers to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check container status
$mongoStatus = docker ps --filter "name=expense-tracker-mongodb" --format "{{.Status}}"
$redisStatus = docker ps --filter "name=expense-tracker-redis" --format "{{.Status}}"

if ($mongoStatus -and $redisStatus) {
    Write-Host "✅ MongoDB: Running" -ForegroundColor Green
    Write-Host "✅ Redis: Running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some containers may not be running properly" -ForegroundColor Yellow
    docker-compose ps
}

Write-Host ""
Write-Host "🎉 Everything is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  Development mode: npm run dev" -ForegroundColor White
Write-Host "  Production mode:  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Application will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop services: docker-compose down" -ForegroundColor Gray
