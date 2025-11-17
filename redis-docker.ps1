# Redis Docker Setup Script for Expense Tracker API
# This script helps you quickly manage the Redis Docker container

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Expense Tracker API - Redis Docker Manager" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Select an option:" -ForegroundColor Yellow
    Write-Host "1. Start Redis Container" -ForegroundColor Green
    Write-Host "2. Stop Redis Container" -ForegroundColor Red
    Write-Host "3. View Redis Logs" -ForegroundColor Blue
    Write-Host "4. Check Container Status" -ForegroundColor Magenta
    Write-Host "5. Access Redis CLI" -ForegroundColor Cyan
    Write-Host "6. Restart Redis Container" -ForegroundColor Yellow
    Write-Host "7. Exit" -ForegroundColor White
    Write-Host ""
}

function Start-RedisContainer {
    Write-Host "Starting Redis container..." -ForegroundColor Green
    docker-compose up -d
    Write-Host ""
    Write-Host "Redis container started!" -ForegroundColor Green
    Write-Host "Connection details:" -ForegroundColor Yellow
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 6379" -ForegroundColor White
}

function Stop-RedisContainer {
    Write-Host "Stopping Redis container..." -ForegroundColor Red
    docker-compose down
    Write-Host "Redis container stopped!" -ForegroundColor Red
}

function Show-RedisLogs {
    Write-Host "Showing Redis logs (Press Ctrl+C to exit)..." -ForegroundColor Blue
    docker-compose logs -f redis
}

function Show-ContainerStatus {
    Write-Host "Container Status:" -ForegroundColor Magenta
    docker ps -a --filter "name=expense-tracker-redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function Access-RedisCLI {
    Write-Host "Accessing Redis CLI (type 'exit' to quit)..." -ForegroundColor Cyan
    docker exec -it expense-tracker-redis redis-cli
}

function Restart-RedisContainer {
    Write-Host "Restarting Redis container..." -ForegroundColor Yellow
    docker-compose restart redis
    Write-Host "Redis container restarted!" -ForegroundColor Green
}

# Check if Docker is installed
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
} catch {
    Write-Host "ERROR: Docker or Docker Compose is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-7)"
    Write-Host ""
    
    switch ($choice) {
        '1' { Start-RedisContainer }
        '2' { Stop-RedisContainer }
        '3' { Show-RedisLogs }
        '4' { Show-ContainerStatus }
        '5' { Access-RedisCLI }
        '6' { Restart-RedisContainer }
        '7' { 
            Write-Host "Goodbye!" -ForegroundColor Green
            exit 0
        }
        default { Write-Host "Invalid choice. Please try again." -ForegroundColor Red }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Clear-Host
} while ($true)
