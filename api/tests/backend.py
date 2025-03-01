import unittest
import random
import string
import requests

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class TestAPI(unittest.TestCase):
    BASE_URL = 'http://localhost:8000'  # Adjust this if your server runs on a different port

    def test_register_and_login(self):
        self.username = username = random_string()
        response = requests.post(f'{self.BASE_URL}/users/register/', json={'username': username, 'password': 'password123'})
        self.assertEqual(response.status_code, 200)

        response = requests.post(f'{self.BASE_URL}/users/login', json={'username': username, 'password': 'password123'})
        self.assertEqual(response.status_code, 200)

        token = response.json()['token']
        self.assertIsNotNone(token)
        self.token = token

        response = requests.post(f'{self.BASE_URL}/users/login', json={'username': username, 'password': 'wrongpassword'})
        self.assertEqual(response.status_code, 401)

        response = requests.post(f'{self.BASE_URL}/users/register/', json={'username': username, 'password': 'password123'})
        self.assertEqual(response.status_code, 409)




if __name__ == '__main__':
    unittest.main() 