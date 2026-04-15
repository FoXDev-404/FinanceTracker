#!/usr/bin/env python
"""
Database connection test script for Finance Tracker
Tests SQL Server connection with Windows Authentication
"""

import os
import sys
import django
from django.db import connection
from django.db.utils import OperationalError

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_tracker.settings')
django.setup()

def test_database_connection():
    """Test database connection and perform basic operations"""
    print("🔍 Testing database connection...")
    print("=" * 50)

    try:
        # Test basic connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 as test")
            result = cursor.fetchone()
            print("✅ Database connection successful!")
            print(f"   Test query result: {result}")

        # Test connection details
        print("\n📊 Connection Details:")
        print(f"   Database Engine: {connection.vendor}")
        print(f"   Database Name: {connection.settings_dict.get('NAME', 'N/A')}")
        print(f"   Host: {connection.settings_dict.get('HOST', 'N/A')}")
        print(f"   Driver: {connection.settings_dict.get('OPTIONS', {}).get('driver', 'N/A')}")

        # Test User model operations
        print("\n👤 Testing User model operations...")
        from api.models import User

        # Count existing users
        user_count = User.objects.count()
        print(f"   Current user count: {user_count}")

        # Create a test user if none exist
        if user_count == 0:
            print("   Creating a test user...")
            test_user = User.objects.create_user(
                email='test@example.com',
                name='Test User',
                password='testpass123'
            )
            print(f"   ✅ Test user created with ID: {test_user.user_id}")

            # Verify user was created
            user_count = User.objects.count()
            print(f"   Updated user count: {user_count}")

        # List all users
        print("\n📋 Current users in database:")
        users = User.objects.all()
        for user in users:
            print(f"   - ID: {user.user_id}, Name: {user.name}, Email: {user.email}, Active: {user.is_active}")

        print("\n✅ All database tests passed!")
        return True

    except OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        print("\n🔧 Troubleshooting suggestions:")
        print("   1. Ensure SQL Server is running")
        print("   2. Verify the database 'Finance' exists")
        print("   3. Check if ODBC Driver 17 for SQL Server is installed")
        print("   4. Verify Windows Authentication is enabled")
        print("   5. Try adjusting the HOST setting in settings.py")
        return False

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def check_database_settings():
    """Check database configuration"""
    print("⚙️  Database Configuration Check:")
    print("=" * 50)

    settings = connection.settings_dict
    print(f"   Engine: {settings.get('ENGINE', 'N/A')}")
    print(f"   Name: {settings.get('NAME', 'N/A')}")
    print(f"   Host: {settings.get('HOST', 'N/A')}")
    print(f"   Driver: {settings.get('OPTIONS', {}).get('driver', 'N/A')}")
    print(f"   Trusted Connection: {'yes' if 'Trusted_Connection=yes' in settings.get('OPTIONS', {}).get('extra_params', '') else 'no'}")

if __name__ == '__main__':
    print("🚀 Finance Tracker Database Connection Test")
    print("=" * 50)

    check_database_settings()
    print()

    success = test_database_connection()

    if success:
        print("\n🎉 Database connection test completed successfully!")
        print("   Your SQL Server with Windows Authentication is working correctly.")
    else:
        print("\n💥 Database connection test failed!")
        print("   Please check the troubleshooting suggestions above.")

    sys.exit(0 if success else 1)
