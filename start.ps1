# Start script for Kinks Flask App
# This script sets up the environment and starts the Flask application

Write-Host "Starting Kinks Flask Application..." -ForegroundColor Green

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit .env file with your actual credentials" -ForegroundColor Yellow
    pause
}

# Check if Firebase credentials exist
$firebaseCert = Get-Content .env | Select-String "FIREBASE_CERT_PATH" | ForEach-Object { $_.Line.Split('=')[1] }
if (-not (Test-Path $firebaseCert)) {
    Write-Host "Warning: Firebase credentials file not found at $firebaseCert" -ForegroundColor Yellow
    Write-Host "Firebase features will be disabled" -ForegroundColor Yellow
}

# Start the application
Write-Host "Starting Flask application on http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

python app.py
