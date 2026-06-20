# CampusOS AI Services Startup Script

$pythonPath = "C:\Users\HP\AppData\Local\Programs\Python\Python313\python.exe"

Write-Host "=== CampusOS AI Startup Script ===" -ForegroundColor Cyan

# 1. Check PostgreSQL Windows Service (port 5432)
$pgService = Get-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue
if ($null -ne $pgService -and $pgService.Status -eq "Running") {
    Write-Host "[*] PostgreSQL Windows Service is already running on port 5432." -ForegroundColor Yellow
} else {
    Write-Host "[+] Starting PostgreSQL Windows Service..." -ForegroundColor Green
    Start-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "[*] PostgreSQL started." -ForegroundColor Yellow
}

# 2. Start Redis
$redisActive = Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue
if ($null -eq $redisActive) {
    Write-Host "[+] Starting Redis inside WSL..." -ForegroundColor Green
    wsl -u root service redis-server start
    Start-Sleep -Seconds 2
} else {
    Write-Host "[*] Redis is already running on port 6379." -ForegroundColor Yellow
}

# 3. Start FastAPI Server
Write-Host "[+] Launching FastAPI Web Server (Uvicorn) in a new window..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d d:\Buildathon\backend && `"$pythonPath`" -m uvicorn app.main:app --reload --port 8000" -WorkingDirectory "d:\Buildathon\backend"

# 4. Start Celery Worker
Write-Host "[+] Launching Celery Worker in a new window..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d d:\Buildathon\backend && `"$pythonPath`" -m celery -A app.workers.celery_app worker --loglevel=info -P solo" -WorkingDirectory "d:\Buildathon\backend"

# 5. Start Celery Beat
Write-Host "[+] Launching Celery Beat in a new window..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d d:\Buildathon\backend && `"$pythonPath`" -m celery -A app.workers.celery_app beat --loglevel=info" -WorkingDirectory "d:\Buildathon\backend"

Write-Host "=== All services launched! ===" -ForegroundColor Cyan
Write-Host "FastAPI docs are available at: http://localhost:8000/docs" -ForegroundColor Cyan
