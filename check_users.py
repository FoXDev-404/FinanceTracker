import os
import sys
import django
from datetime import datetime

# Add the project directory to the Python path
sys.path.append('c:/Users/HP/finance_tracker')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_tracker.settings')

# Setup Django
django.setup()

from api.models import User

def check_users():
    print("=== Users in Database ===")
    print(f"Timestamp: {datetime.now()}")
    print("-" * 50)

    try:
        users = User.objects.all()
        print(f"Total users found: {users.count()}")
        print()

        if users.count() == 0:
            print("No users found in the database.")
            return

        for i, user in enumerate(users, 1):
            print(f"User {i}:")
            print(f"  ID: {user.user_id}")
            print(f"  Name: {user.name}")
            print(f"  Email: {user.email}")
            print(f"  Created: {user.created_at}")
            print(f"  Active: {user.is_active}")
            print(f"  Admin: {user.is_admin}")
            print()

    except Exception as e:
        print(f"Error querying users: {e}")

if __name__ == "__main__":
    check_users()
