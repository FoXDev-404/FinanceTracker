@echo off
setlocal enabledelayedexpansion

REM Base URL
set BASE_URL=http://127.0.0.1:8000/api

REM Register a new user
echo Registering user...
curl -X POST "%BASE_URL%/register/" -H "Content-Type: application/json" -d "{\"name\": \"Test User\", \"email\": \"testuser@example.com\", \"password\": \"testpassword123\", \"password_confirm\": \"testpassword123\"}"
echo.

REM Login to get JWT tokens
echo Logging in...
for /f "tokens=*" %%i in ('curl -s -X POST "%BASE_URL%/login/" -H "Content-Type: application/json" -d "{\"email\": \"testuser@example.com\", \"password\": \"testpassword123\"}"') do (
    set "LOGIN_RESPONSE=%%i"
)
echo !LOGIN_RESPONSE!

REM Extract access token using PowerShell
for /f "delims=" %%a in ('powershell -Command "($env:LOGIN_RESPONSE | ConvertFrom-Json).access"') do set ACCESS_TOKEN=%%a
echo Access Token: !ACCESS_TOKEN!
echo.

REM Test Account endpoints
echo Testing Account endpoints...

REM Create Account
curl -X POST "%BASE_URL%/accounts/" -H "Content-Type: application/json" -H "Authorization: Bearer !ACCESS_TOKEN!" -d "{\"account_name\": \"Checking Account\", \"account_type\": \"Checking\", \"balance\": \"1000.00\"}"
echo.

REM List Accounts
curl -X GET "%BASE_URL%/accounts/" -H "Authorization: Bearer !ACCESS_TOKEN!"
echo.

REM Test Category endpoints
echo Testing Category endpoints...

REM Create Category
curl -X POST "%BASE_URL%/categories/" -H "Content-Type: application/json" -H "Authorization: Bearer !ACCESS_TOKEN!" -d "{\"name\": \"Salary\", \"type\": \"Income\"}"
echo.

REM List Categories
curl -X GET "%BASE_URL%/categories/" -H "Authorization: Bearer !ACCESS_TOKEN!"
echo.

REM Test Transaction endpoints
echo Testing Transaction endpoints...

REM Create Transaction
curl -X POST "%BASE_URL%/transactions/" -H "Content-Type: application/json" -H "Authorization: Bearer !ACCESS_TOKEN!" -d "{\"account\": 1, \"category\": 1, \"amount\": \"500.00\", \"transaction_type\": \"Income\", \"date\": \"2025-10-04\", \"note\": \"October salary\"}"
echo.

REM List Transactions
curl -X GET "%BASE_URL%/transactions/" -H "Authorization: Bearer !ACCESS_TOKEN!"
echo.
