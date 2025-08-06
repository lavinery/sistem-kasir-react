#!/usr/bin/env python3
"""
Backend API Testing for POS System
Tests all backend endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime

class POSAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        
    def log(self, message):
        """Log with timestamp"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        self.log(f"   Response: {json.dumps(response_data, indent=2)}")
                except:
                    self.log(f"   Response: {response.text[:200]}...")
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:300]}...")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.RequestException as e:
            self.log(f"❌ FAILED - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test server health"""
        self.log("\n🏥 TESTING SERVER HEALTH")
        success, response = self.run_test("Health Check", "GET", "/health", 200)
        return success

    def test_database_connection(self):
        """Test database connectivity"""
        self.log("\n🗄️ TESTING DATABASE CONNECTION")
        success, response = self.run_test("Database Test", "GET", "/api/test", 200)
        return success

    def test_login(self, email, password):
        """Test login functionality"""
        self.log(f"\n🔐 TESTING LOGIN - {email}")
        success, response = self.run_test(
            f"Login ({email})",
            "POST",
            "/api/auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and isinstance(response, dict) and 'token' in response:
            self.token = response['token']
            self.log(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_pos_init(self):
        """Test POS initialization data"""
        self.log("\n🛒 TESTING POS INITIALIZATION")
        success, response = self.run_test("POS Init Data", "GET", "/api/pos/init", 200)
        return success

    def test_categories(self):
        """Test categories endpoint"""
        self.log("\n📂 TESTING CATEGORIES")
        success, response = self.run_test("Get Categories", "GET", "/api/categories", 200)
        return success

    def test_products(self):
        """Test products endpoint"""
        self.log("\n📦 TESTING PRODUCTS")
        success, response = self.run_test("Get Products", "GET", "/api/products", 200)
        return success

    def test_members(self):
        """Test members endpoint"""
        self.log("\n👥 TESTING MEMBERS")
        success, response = self.run_test("Get Members", "GET", "/api/members", 200)
        return success

    def test_sales(self):
        """Test sales endpoint"""
        self.log("\n💰 TESTING SALES")
        success, response = self.run_test("Get Sales", "GET", "/api/sales", 200)
        return success

    def test_settings(self):
        """Test settings endpoint"""
        self.log("\n⚙️ TESTING SETTINGS")
        success, response = self.run_test("Get Settings", "GET", "/api/settings", 200)
        return success

    def test_favorites(self):
        """Test favorites endpoint"""
        self.log("\n⭐ TESTING FAVORITES")
        success, response = self.run_test("Get Favorites", "GET", "/api/favorites", 200)
        return success

    def test_dashboard(self):
        """Test dashboard endpoint"""
        self.log("\n📊 TESTING DASHBOARD")
        success, response = self.run_test("Get Dashboard", "GET", "/api/dashboard", 200)
        return success

    def test_users(self):
        """Test users endpoint (admin only)"""
        self.log("\n👤 TESTING USERS")
        success, response = self.run_test("Get Users", "GET", "/api/users", 200)
        return success

def main():
    """Main testing function"""
    print("=" * 60)
    print("🧪 POS SYSTEM BACKEND API TESTING")
    print("=" * 60)
    
    tester = POSAPITester()
    
    # Test credentials from the request
    test_accounts = [
        ("admin@kasir.com", "admin123"),
        ("kasir@kasir.com", "kasir123"),
        ("gudang@kasir.com", "gudang123")
    ]
    
    # Basic connectivity tests
    if not tester.test_health_check():
        print("❌ Server health check failed - stopping tests")
        return 1
        
    if not tester.test_database_connection():
        print("❌ Database connection failed - stopping tests")
        return 1

    # Test login with different accounts
    login_success = False
    for email, password in test_accounts:
        if tester.test_login(email, password):
            login_success = True
            break
    
    if not login_success:
        print("❌ All login attempts failed - stopping authenticated tests")
        return 1

    # Test all authenticated endpoints
    tester.test_pos_init()
    tester.test_categories()
    tester.test_products()
    tester.test_members()
    tester.test_sales()
    tester.test_settings()
    tester.test_favorites()
    tester.test_dashboard()
    tester.test_users()

    # Print final results
    print("\n" + "=" * 60)
    print("📊 FINAL TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("⚠️ SOME TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())