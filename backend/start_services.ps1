# CampusOS AI Services Startup Script

$pythonPath = "C:\Users\HP\AppData\Local\Programs\Python\Python313\python.exe"
$pgData = "d:\Buildathon\pgdata"

Write-Host "=== CampusOS AI Startup Script ===" -ForegroundColor Cyan

# 1. Start PostgreSQL
$portActive = Get-NetTCPConnection -LocalPort 5433 -ErrorAction SilentlyContinue
if ($null -eq $portActive) {
    Write-Host "[+] Starting PostgreSQL on port 5433..." -ForegroundColor Green
    Start-Process -FilePath "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -ArgumentList "start -D `"$pgData`" -o `"-p 5433`"" -NoNewWindow
    Start-Sleep -Seconds 3
} else {
    Write-Host "[*] PostgreSQL is already running on port 5433." -ForegroundColor Yellow
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
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$pythonPath`" -m uvicorn app.main:app --reload --port 8000"

# 4. Start Celery Worker
Write-Host "[+] Launching Celery Worker in a new window..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$pythonPath`" -m celery -A app.workers.celery_app worker --loglevel=info -P solo"

# 5. Start Celery Beat
Write-Host "[+] Launching Celery Beat in a new window..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$pythonPath`" -m celery -A app.workers.celery_app beat --loglevel=info"

Write-Host "=== All services launched! ===" -ForegroundColor Cyan
Write-Host "FastAPI docs are available at: http://localhost:8000/docs" -ForegroundColor Cyan
