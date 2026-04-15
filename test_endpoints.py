import requests
import json

def test_all_endpoints():
    base_url = 'http://127.0.0.1:8000/api'

    print("🧪 Testing Finance Tracker API Endpoints")
    print("=" * 50)

    # Test 1: API Status
    print("\n1. Testing API Status...")
    try:
        response = requests.get(f'{base_url}/status/')
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Test 2: User Registration
    print("\n2. Testing User Registration...")
    register_data = {
        'name': 'testuser',
        'email': 'testuser@example.com',
        'password': 'testpass123'
    }
    try:
        response = requests.post(f'{base_url}/register/', json=register_data)
        print(f"   ✅ Register Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"   📄 User ID: {data['user']['user_id']}")
            print(f"   🔑 Token: {data['token'][:20]}...")
            user_id = data['user']['user_id']
            token = data['token']
        else:
            print(f"   📄 Response: {response.text}")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return

    # Test 3: User Login
    print("\n3. Testing User Login...")
    login_data = {
        'email': 'testuser@example.com',
        'password': 'testpass123'
    }
    try:
        response = requests.post(f'{base_url}/login/', json=login_data)
        print(f"   ✅ Login Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   📄 Message: {data['message']}")
            print(f"   🔑 Token: {data['token'][:20]}...")
        else:
            print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Test 4: Get User Details
    print("\n4. Testing Get User Details...")
    try:
        response = requests.get(f'{base_url}/users/{user_id}/')
        print(f"   ✅ Get User Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   📄 User Name: {data['name']}")
            print(f"   📄 User Email: {data['email']}")
        else:
            print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Test 5: Update User
    print("\n5. Testing Update User...")
    update_data = {
        'name': 'updateduser',
        'email': 'testuser@example.com'
    }
    try:
        response = requests.put(f'{base_url}/users/{user_id}/', json=update_data)
        print(f"   ✅ Update Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   📄 Updated Name: {data['name']}")
        else:
            print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Test 6: Delete User
    print("\n6. Testing Delete User...")
    try:
        response = requests.delete(f'{base_url}/users/{user_id}/')
        print(f"   ✅ Delete Status: {response.status_code}")
        print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    print("\n" + "=" * 50)
    print("🎉 All endpoint tests completed!")

if __name__ == '__main__':
    test_all_endpoints()
