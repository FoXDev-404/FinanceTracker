#!/bin/bash

# Base URL
BASE_URL="http://127.0.0.1:8000/api"

# Register a new user
echo "Registering user..."
curl -X POST "$BASE_URL/register/" -H "Content-Type: application/json" -d '{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "testpassword123",
  "password_confirm": "testpassword123"
}'
echo -e "\n"

# Login to get JWT tokens
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login/" -H "Content-Type: application/json" -d '{
  "email": "testuser@example.com",
  "password": "testpassword123"
}')
echo "$LOGIN_RESPONSE"
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access')
echo -e "\nAccess Token: $ACCESS_TOKEN\n"

# Test Account endpoints
echo "Testing Account endpoints..."

# Create Account
curl -X POST "$BASE_URL/accounts/" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
  "account_name": "Checking Account",
  "account_type": "Checking",
  "balance": "1000.00"
}'
echo -e "\n"

# List Accounts
curl -X GET "$BASE_URL/accounts/" -H "Authorization: Bearer $ACCESS_TOKEN"
echo -e "\n"

# Test Category endpoints
echo "Testing Category endpoints..."

# Create Category
curl -X POST "$BASE_URL/categories/" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
  "name": "Salary",
  "type": "Income"
}'
echo -e "\n"

# List Categories
curl -X GET "$BASE_URL/categories/" -H "Authorization: Bearer $ACCESS_TOKEN"
echo -e "\n"

# Test Transaction endpoints
echo "Testing Transaction endpoints..."

# Create Transaction
curl -X POST "$BASE_URL/transactions/" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d '{
  "account": 1,
  "category": 1,
  "amount": "500.00",
  "transaction_type": "Income",
  "date": "2025-10-04",
  "note": "October salary"
}'
echo -e "\n"

# List Transactions
curl -X GET "$BASE_URL/transactions/" -H "Authorization: Bearer $ACCESS_TOKEN"
echo -e "\n"
