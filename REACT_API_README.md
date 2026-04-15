# 🚀 React JS API Integration Guide

## 📋 Complete Setup Instructions

### Step 1: Start Your Django Server
Make sure your Django backend is running:
```bash
cd c:/Users/HP/finance_tracker
python manage.py runserver 8000
```

### Step 2: Start Your React Frontend
Open a new terminal and start your Next.js frontend:
```bash
cd c:/Users/HP/finance_tracker/finance-tracker-frontend
npm run dev
```

### Step 3: Test Your APIs
Open your browser and go to: **http://localhost:3000**

You should see the API testing interface with forms for all endpoints.

---

## 🎯 How to Use Each API

### **1. User Registration**
- Fill in the registration form:
  - **Name**: Your full name
  - **Email**: Your email address
  - **Password**: Choose a password (min 8 characters)
  - **Confirm Password**: Repeat the same password
- Click **"Register"**
- ✅ Success message will appear
- User will be created in your database

### **2. User Login**
- Fill in the login form:
  - **Email**: The email you registered with
  - **Password**: The password you chose
- Click **"Login"**
- ✅ Success message will appear
- JWT tokens will be stored automatically
- User info will be displayed

### **3. Get User Profile** (Protected)
- First, make sure you're logged in (step 2)
- Click **"Get Profile"**
- ✅ Your user information will be displayed
- This endpoint requires authentication

### **4. User Logout** (Protected)
- First, make sure you're logged in (step 2)
- Click **"Logout"**
- ✅ Success message will appear
- JWT tokens will be cleared
- You'll be logged out

---

## 📁 Files Created for You

### **1. API Service** (`src/app/api-test.js`)
Contains all the fetch functions:
```javascript
import { apiService } from './api-test';

// Register user
await apiService.register(userData);

// Login user
await apiService.login(credentials);

// Get profile (protected)
await apiService.getProfile();

// Logout user (protected)
await apiService.logout();
```

### **2. React Component** (`src/app/AuthTest.js`)
The UI component you see on the page with all the forms and buttons.

### **3. Home Page** (`src/app/page.js`)
The main page that displays the API testing interface.

---

## 🔐 How Authentication Works

1. **Register/Login** → Get JWT tokens
2. **Tokens stored** in browser's localStorage
3. **Protected APIs** automatically include `Authorization: Bearer <token>` header
4. **Token expires** → Automatic refresh (if refresh token available)
5. **Logout** → Tokens cleared from localStorage

---

## 🧪 Testing Examples

### **Test Registration:**
```javascript
const result = await apiService.register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    passwordConfirm: 'password123'
});
console.log(result); // {user: {...}, message: 'User created successfully'}
```

### **Test Login:**
```javascript
const result = await apiService.login({
    email: 'john@example.com',
    password: 'password123'
});
console.log(result); // {access: 'jwt_token...', refresh: 'refresh_token...', name: 'John Doe', ...}
```

### **Test Protected Route:**
```javascript
const profile = await apiService.getProfile();
console.log(profile); // {user_id: 1, name: 'John Doe', email: 'john@example.com', ...}
```

---

## 🛠️ Troubleshooting

### **"Registration Failed"**
- Check if email is already registered
- Ensure password is at least 8 characters
- Verify passwords match

### **"Login Failed"**
- Check email and password are correct
- Ensure user is registered first
- Check Django server is running

### **"Get Profile Failed"**
- Make sure you're logged in first
- Check if JWT token is valid
- Verify Django server is running

### **CORS Errors**
- Make sure Django CORS settings allow your frontend origin
- Check `finance_tracker/settings.py` CORS configuration

---

## 📊 API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/register/` | POST | Create new user | ❌ No |
| `/api/login/` | POST | Login user | ❌ No |
| `/api/profile/` | GET | Get user profile | ✅ Yes |
| `/api/logout/` | POST | Logout user | ✅ Yes |
| `/swagger/` | GET | API documentation | ❌ No |

---

## 🎉 You're All Set!

Your React JS application now has complete API integration with:
- ✅ User registration and login
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Error handling
- ✅ Token management
- ✅ Interactive testing interface

**Just open http://localhost:3000 and start testing your APIs!**
