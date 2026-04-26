from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status

class UserManagerTests(TestCase):
    def test_create_user_with_email_successful(self):
        """Test creating a new user with an email is successful"""
        email = 'test@example.com'
        password = 'password123'
        name = 'Test User'
        user = get_user_model().objects.create_user(
            email=email,
            password=password,
            name=name
        )

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertEqual(user.name, name)
        self.assertTrue(user.is_active)

    def test_new_user_email_normalized(self):
        """Test the email for a new user is normalized"""
        email = 'test@EXAMPLE.COM'
        user = get_user_model().objects.create_user(
            email=email,
            password='password123',
            name='Test User'
        )

        self.assertEqual(user.email, email.lower())

    def test_new_user_invalid_email(self):
        """Test creating user with no email raises error"""
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(
                email=None,
                password='password123',
                name='Test User'
            )

class UserRegistrationTests(APITestCase):
    def test_register_user_success(self):
        """Test registering a new user is successful"""
        url = reverse('api:register')
        data = {
            'name': 'New User',
            'email': 'newuser@example.com',
            'password': 'strongpassword123',
            'password_confirm': 'strongpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        self.assertEqual(response.data['user']['name'], 'New User')
        self.assertEqual(response.data['message'], 'User created successfully')

    def test_register_user_password_mismatch(self):
        """Test registration fails if passwords don't match"""
        url = reverse('api:register')
        data = {
            'name': 'New User',
            'email': 'newuser@example.com',
            'password': 'strongpassword123',
            'password_confirm': 'differentpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_register_user_duplicate_email(self):
        """Test registration fails if email is already in use"""
        # Create user first
        get_user_model().objects.create_user(
            email='existing@example.com',
            password='password123',
            name='Existing User'
        )

        url = reverse('api:register')
        data = {
            'name': 'Another User',
            'email': 'existing@example.com',
            'password': 'strongpassword123',
            'password_confirm': 'strongpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_user_missing_fields(self):
        """Test registration fails if required fields are missing"""
        url = reverse('api:register')
        data = {
            'name': 'Incomplete User'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertIn('password', response.data)
        self.assertIn('password_confirm', response.data)
