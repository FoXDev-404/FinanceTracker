import requests
import json

def register_and_test_user():
    """Register the user and then test login"""
    base_url = 'http://localhost:8000/api'

    # User's credentials
    user_data = {
        'name': 'kirti',
        'email': 'kirti@example.com',
        'password': 'password123'
    }

    print("🧪 Registering and Testing User Login")
    print("=" * 50)
    print(f"User: {user_data['name']}")
    print(f"Email: {user_data['email']}")
    print()

    # Step 1: Register the user
    print("1️⃣ Registering user...")
    try:
        response = requests.post(f'{base_url}/register/', json=user_data)

        if response.status_code == 201:
            data = response.json()
            print("✅ Registration successful!")
            print(f"   User ID: {data['user']['user_id']}")
            print(f"   Token: {data['token'][:20]}...")
        else:
            print(f"❌ Registration failed: {response.text}")
            return

    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return

    # Step 2: Test login
    print("\n2️⃣ Testing login...")
    login_data = {
        'email': user_data['email'],
        'password': user_data['password']
    }

    try:
        response = requests.post(f'{base_url}/login/', json=login_data)

        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   User: {data['user']['name']} ({data['user']['email']})")
            print(f"   Token: {data['token'][:20]}...")
            print(f"   Message: {data['message']}")
        else:
            print(f"❌ Login failed: {response.text}")

    except Exception as e:
        print(f"❌ Login error: {str(e)}")

if __name__ == '__main__':
    register_and_test_user()
