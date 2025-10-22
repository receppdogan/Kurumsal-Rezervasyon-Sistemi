#!/usr/bin/env python3
"""
Backend API Testing for Corporate Reservation Engine
Tests the newly implemented employee approval and service fees endpoints
"""

import requests
import json
import sys
import os
from datetime import datetime
import uuid

# Configuration
BACKEND_URL = "https://corpreserve.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")

class APITester:
    def __init__(self):
        self.tokens = {}
        self.users = {}
        self.company_id = None
        self.test_results = []
        
    def make_request(self, method, endpoint, data=None, token=None, expected_status=None):
        """Make HTTP request with proper error handling"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            print(f"  {method} {endpoint} -> {response.status_code}")
            
            if expected_status and response.status_code != expected_status:
                print_error(f"Expected status {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"    Response: {response.text}")
                return None
                
            return response
            
        except requests.exceptions.RequestException as e:
            print_error(f"Request failed: {e}")
            return None
    
    def login_user(self, email, password, role_name):
        """Login user and store token"""
        print_info(f"Logging in {role_name}: {email}")
        
        response = self.make_request("POST", "/auth/login", {
            "email": email,
            "password": password
        })
        
        if response and response.status_code == 200:
            data = response.json()
            self.tokens[role_name] = data["access_token"]
            self.users[role_name] = data["user"]
            print_success(f"Logged in {role_name} successfully")
            return True
        else:
            print_error(f"Failed to login {role_name}")
            if response:
                print(f"    Response: {response.text}")
            return False
    
    def setup_test_data(self):
        """Setup test users and get company ID"""
        print_header("SETTING UP TEST DATA")
        
        # First, try to login existing users
        users_to_login = [
            ("admin@abc-tech.com", "admin123", "ADMIN"),
            ("manager@abc-tech.com", "manager123", "MANAGER"),
            ("employee@abc-tech.com", "employee123", "EMPLOYEE")
        ]
        
        for email, password, role in users_to_login:
            if not self.login_user(email, password, role):
                print_error(f"Failed to login {role}. Test data might not be initialized.")
                return False
        
        # Get company ID from admin user
        if "ADMIN" in self.users:
            self.company_id = self.users["ADMIN"]["company_id"]
            print_success(f"Company ID: {self.company_id}")
        
        # Create AGENCY_ADMIN user for service fees testing
        self.create_agency_admin()
        
        return True
    
    def create_agency_admin(self):
        """Create an AGENCY_ADMIN user for testing service fees"""
        print_info("Creating AGENCY_ADMIN user for service fees testing")
        
        agency_admin_data = {
            "email": "agency.admin@b2btravel.com",
            "password": "agency123",
            "full_name": "B2B Travel Admin",
            "phone": "+90 532 999 99 99",
            "role": "agency_admin",
            "company_id": self.company_id
        }
        
        # Try to register the agency admin
        response = self.make_request("POST", "/auth/register", agency_admin_data)
        
        if response and response.status_code == 201:
            print_success("AGENCY_ADMIN user created successfully")
        elif response and response.status_code == 400 and "already registered" in response.text:
            print_info("AGENCY_ADMIN user already exists")
        else:
            print_warning("Could not create AGENCY_ADMIN user, will try to login existing one")
        
        # Login the agency admin
        self.login_user("agency.admin@b2btravel.com", "agency123", "AGENCY_ADMIN")
    
    def test_employee_creation_with_approval(self):
        """Test POST /api/employees with approval settings"""
        print_header("TESTING EMPLOYEE CREATION WITH APPROVAL SETTINGS")
        
        if "ADMIN" not in self.tokens:
            print_error("No admin token available for testing")
            return False
        
        # Test 1: Create employee with approval requirements
        print_info("Test 1: Create employee with requires_approval=true")
        
        # Generate unique email to avoid conflicts
        unique_id = str(uuid.uuid4())[:8]
        employee_data = {
            "email": f"test.employee1.{unique_id}@abc-tech.com",
            "password": "test123",
            "full_name": "Test Employee 1",
            "phone": "+90 532 444 44 44",
            "role": "employee",
            "company_id": self.company_id,
            "department": "Test Department",
            "requires_approval": True,
            "approver_id": self.users["MANAGER"]["id"]
        }
        
        response = self.make_request("POST", "/employees", employee_data, self.tokens["ADMIN"])
        
        if response and response.status_code == 201:
            created_user = response.json()
            print_success("Employee created with approval settings")
            print(f"    Employee ID: {created_user['id']}")
            print(f"    Requires Approval: {created_user.get('requires_approval')}")
            print(f"    Approver ID: {created_user.get('approver_id')}")
            self.test_results.append(("Employee creation with approval", True))
        else:
            print_error("Failed to create employee with approval settings")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Employee creation with approval", False))
            return False
        
        # Test 2: Create employee without approval requirements
        print_info("Test 2: Create employee without approval requirements")
        
        unique_id2 = str(uuid.uuid4())[:8]
        employee_data2 = {
            "email": f"test.employee2.{unique_id2}@abc-tech.com",
            "password": "test123",
            "full_name": "Test Employee 2",
            "phone": "+90 532 555 55 55",
            "role": "employee",
            "company_id": self.company_id,
            "department": "Test Department",
            "requires_approval": False,
            "approver_id": None
        }
        
        response = self.make_request("POST", "/employees", employee_data2, self.tokens["ADMIN"])
        
        if response and response.status_code == 201:
            created_user = response.json()
            print_success("Employee created without approval requirements")
            print(f"    Employee ID: {created_user['id']}")
            print(f"    Requires Approval: {created_user.get('requires_approval')}")
            self.test_results.append(("Employee creation without approval", True))
        else:
            print_error("Failed to create employee without approval requirements")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Employee creation without approval", False))
        
        # Test 3: Test validation - invalid approver_id
        print_info("Test 3: Test validation with invalid approver_id")
        
        unique_id3 = str(uuid.uuid4())[:8]
        employee_data3 = {
            "email": f"test.employee3.{unique_id3}@abc-tech.com",
            "password": "test123",
            "full_name": "Test Employee 3",
            "phone": "+90 532 666 66 66",
            "role": "employee",
            "company_id": self.company_id,
            "department": "Test Department",
            "requires_approval": True,
            "approver_id": "invalid-id-12345"
        }
        
        response = self.make_request("POST", "/employees", employee_data3, self.tokens["ADMIN"])
        
        if response:
            print(f"    Debug - Status: {response.status_code}, Response: {response.text}")
        if response and response.status_code == 400 and "Approver not found" in response.text:
            print_success("Validation correctly rejected invalid approver_id")
            self.test_results.append(("Invalid approver validation", True))
        else:
            print_error("Validation should have rejected invalid approver_id")
            self.test_results.append(("Invalid approver validation", False))
        
        # Test 4: Test validation - approver must be manager or admin
        print_info("Test 4: Test validation - approver must be manager or admin")
        
        unique_id4 = str(uuid.uuid4())[:8]
        employee_data4 = {
            "email": f"test.employee4.{unique_id4}@abc-tech.com",
            "password": "test123",
            "full_name": "Test Employee 4",
            "phone": "+90 532 777 77 77",
            "role": "employee",
            "company_id": self.company_id,
            "department": "Test Department",
            "requires_approval": True,
            "approver_id": self.users["EMPLOYEE"]["id"]  # Employee cannot be approver
        }
        
        response = self.make_request("POST", "/employees", employee_data4, self.tokens["ADMIN"])
        
        if response:
            print(f"    Debug - Status: {response.status_code}, Response: {response.text}")
        if response and response.status_code == 400 and "Approver must be a manager or admin" in response.text:
            print_success("Validation correctly rejected employee as approver")
            self.test_results.append(("Approver role validation", True))
        else:
            print_error("Validation should have rejected employee as approver")
            self.test_results.append(("Approver role validation", False))
        
        # Test 5: Test duplicate email validation
        print_info("Test 5: Test duplicate email validation")
        
        # Use existing admin email to test duplicate validation
        duplicate_employee_data = {
            "email": "admin@abc-tech.com",  # This email already exists
            "password": "test123",
            "full_name": "Duplicate Admin",
            "phone": "+90 532 999 99 99",
            "role": "employee",
            "company_id": self.company_id,
            "department": "Test Department",
            "requires_approval": False
        }
        
        response = self.make_request("POST", "/employees", duplicate_employee_data, self.tokens["ADMIN"])
        
        if response:
            print(f"    Debug - Status: {response.status_code}, Response: {response.text}")
        if response and response.status_code == 400 and "Email already registered" in response.text:
            print_success("Validation correctly rejected duplicate email")
            self.test_results.append(("Duplicate email validation", True))
        else:
            print_error("Validation should have rejected duplicate email")
            self.test_results.append(("Duplicate email validation", False))
        
        return True
    
    def test_employee_update(self):
        """Test PUT /api/employees/{id} for updating approval settings"""
        print_header("TESTING EMPLOYEE UPDATE")
        
        if "ADMIN" not in self.tokens:
            print_error("No admin token available for testing")
            return False
        
        # First, get an employee to update
        employee_id = self.users["EMPLOYEE"]["id"]
        
        # Test 1: Update approval settings
        print_info("Test 1: Update employee approval settings")
        
        update_data = {
            "requires_approval": True,
            "approver_id": self.users["MANAGER"]["id"]
        }
        
        response = self.make_request("PUT", f"/employees/{employee_id}", update_data, self.tokens["ADMIN"])
        
        if response and response.status_code == 200:
            updated_user = response.json()
            print_success("Employee approval settings updated successfully")
            print(f"    Requires Approval: {updated_user.get('requires_approval')}")
            print(f"    Approver ID: {updated_user.get('approver_id')}")
            self.test_results.append(("Employee update approval settings", True))
        else:
            print_error("Failed to update employee approval settings")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Employee update approval settings", False))
        
        # Test 2: Change approver
        print_info("Test 2: Change approver to admin")
        
        update_data2 = {
            "approver_id": self.users["ADMIN"]["id"]
        }
        
        response = self.make_request("PUT", f"/employees/{employee_id}", update_data2, self.tokens["ADMIN"])
        
        if response and response.status_code == 200:
            updated_user = response.json()
            print_success("Employee approver changed successfully")
            print(f"    New Approver ID: {updated_user.get('approver_id')}")
            self.test_results.append(("Employee update approver", True))
        else:
            print_error("Failed to change employee approver")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Employee update approver", False))
        
        # Test 3: Test validation for invalid approver in update
        print_info("Test 3: Test validation for invalid approver in update")
        
        update_data3 = {
            "approver_id": "invalid-approver-id"
        }
        
        response = self.make_request("PUT", f"/employees/{employee_id}", update_data3, self.tokens["ADMIN"])
        
        if response and response.status_code == 400 and "Approver not found" in response.text:
            print_success("Update validation correctly rejected invalid approver")
            self.test_results.append(("Update invalid approver validation", True))
        else:
            print_error("Update validation should have rejected invalid approver")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Update invalid approver validation", False))
        
        return True
    
    def test_service_fees_access_control(self):
        """Test service fees access control - AGENCY_ADMIN only"""
        print_header("TESTING SERVICE FEES ACCESS CONTROL")
        
        if not self.company_id:
            print_error("No company ID available for testing")
            return False
        
        # Test 1: AGENCY_ADMIN should be able to GET service fees
        print_info("Test 1: AGENCY_ADMIN access to GET service fees")
        
        if "AGENCY_ADMIN" in self.tokens:
            response = self.make_request("GET", f"/companies/{self.company_id}/service-fees", 
                                       token=self.tokens["AGENCY_ADMIN"])
            
            if response and response.status_code == 200:
                service_fees = response.json()
                print_success("AGENCY_ADMIN can access service fees")
                print(f"    Service fees retrieved: {len(service_fees.get('service_fees', {}))}")
                self.test_results.append(("AGENCY_ADMIN GET service fees", True))
            else:
                print_error("AGENCY_ADMIN should be able to access service fees")
                if response:
                    print(f"    Response: {response.text}")
                self.test_results.append(("AGENCY_ADMIN GET service fees", False))
        else:
            print_warning("No AGENCY_ADMIN token available")
            self.test_results.append(("AGENCY_ADMIN GET service fees", False))
        
        # Test 2: Company ADMIN should NOT be able to GET service fees
        print_info("Test 2: Company ADMIN should be denied access to GET service fees")
        
        response = self.make_request("GET", f"/companies/{self.company_id}/service-fees", 
                                   token=self.tokens["ADMIN"])
        
        if response and response.status_code == 403 and "B2BTravel Admin access required" in response.text:
            print_success("Company ADMIN correctly denied access to service fees")
            self.test_results.append(("Company ADMIN denied GET service fees", True))
        else:
            print_error("Company ADMIN should be denied access to service fees")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Company ADMIN denied GET service fees", False))
        
        # Test 3: AGENCY_ADMIN should be able to PUT service fees
        print_info("Test 3: AGENCY_ADMIN access to PUT service fees")
        
        if "AGENCY_ADMIN" in self.tokens:
            service_fee_update = {
                "service_fees": {
                    "hotel": {"type": "fixed", "value": 75.0, "additional_fee": 0.0, "currency": "TRY"},
                    "flight": {"type": "percentage", "value": 7.0, "additional_fee": 30.0, "currency": "USD"},
                    "transfer": {"type": "fixed", "value": 30.0, "additional_fee": 0.0, "currency": "TRY"},
                    "visa": {"type": "fixed", "value": 120.0, "additional_fee": 0.0, "currency": "EUR"},
                    "insurance": {"type": "percentage", "value": 12.0, "additional_fee": 0.0, "currency": "TRY"},
                    "car_rental": {"type": "fixed", "value": 50.0, "additional_fee": 20.0, "currency": "USD"}
                }
            }
            
            response = self.make_request("PUT", f"/companies/{self.company_id}/service-fees", 
                                       service_fee_update, self.tokens["AGENCY_ADMIN"])
            
            if response and response.status_code == 200:
                print_success("AGENCY_ADMIN can update service fees")
                result = response.json()
                print(f"    Update message: {result.get('message')}")
                self.test_results.append(("AGENCY_ADMIN PUT service fees", True))
            else:
                print_error("AGENCY_ADMIN should be able to update service fees")
                if response:
                    print(f"    Response: {response.text}")
                self.test_results.append(("AGENCY_ADMIN PUT service fees", False))
        else:
            print_warning("No AGENCY_ADMIN token available")
            self.test_results.append(("AGENCY_ADMIN PUT service fees", False))
        
        # Test 4: Company ADMIN should NOT be able to PUT service fees
        print_info("Test 4: Company ADMIN should be denied access to PUT service fees")
        
        service_fee_update = {
            "service_fees": {
                "hotel": {"type": "fixed", "value": 100.0, "additional_fee": 0.0, "currency": "TRY"}
            }
        }
        
        response = self.make_request("PUT", f"/companies/{self.company_id}/service-fees", 
                                   service_fee_update, self.tokens["ADMIN"])
        
        if response and response.status_code == 403 and "B2BTravel Admin access required" in response.text:
            print_success("Company ADMIN correctly denied access to update service fees")
            self.test_results.append(("Company ADMIN denied PUT service fees", True))
        else:
            print_error("Company ADMIN should be denied access to update service fees")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Company ADMIN denied PUT service fees", False))
        
        return True
    
    def test_company_update_without_service_fees(self):
        """Test that company update doesn't include service fees"""
        print_header("TESTING COMPANY UPDATE WITHOUT SERVICE FEES")
        
        if not self.company_id:
            print_error("No company ID available for testing")
            return False
        
        # Test 1: Company admin should be able to update basic company info
        print_info("Test 1: Company admin updates basic company information")
        
        company_update = {
            "name": "ABC Teknoloji A.Ş. (Updated)",
            "phone": "+90 212 999 88 77",
            "address": "Updated Address, Maslak/İstanbul"
        }
        
        response = self.make_request("PUT", f"/companies/{self.company_id}", 
                                   company_update, self.tokens["ADMIN"])
        
        if response and response.status_code == 200:
            updated_company = response.json()
            print_success("Company basic info updated successfully")
            print(f"    Updated name: {updated_company.get('name')}")
            print(f"    Updated phone: {updated_company.get('phone')}")
            self.test_results.append(("Company basic info update", True))
            
            # Verify service_fees are not affected by this update
            if "AGENCY_ADMIN" in self.tokens:
                fees_response = self.make_request("GET", f"/companies/{self.company_id}/service-fees", 
                                                token=self.tokens["AGENCY_ADMIN"])
                if fees_response and fees_response.status_code == 200:
                    fees_data = fees_response.json()
                    if fees_data.get('service_fees'):
                        print_success("Service fees preserved after company update")
                        self.test_results.append(("Service fees preserved", True))
                    else:
                        print_error("Service fees were lost after company update")
                        self.test_results.append(("Service fees preserved", False))
        else:
            print_error("Failed to update company basic info")
            if response:
                print(f"    Response: {response.text}")
            self.test_results.append(("Company basic info update", False))
        
        return True
    
    def test_authentication_requirements(self):
        """Test that all endpoints require proper authentication"""
        print_header("TESTING AUTHENTICATION REQUIREMENTS")
        
        endpoints_to_test = [
            ("POST", "/employees"),
            ("PUT", f"/employees/{self.users['EMPLOYEE']['id'] if 'EMPLOYEE' in self.users else 'test-id'}"),
            ("GET", f"/companies/{self.company_id}/service-fees"),
            ("PUT", f"/companies/{self.company_id}/service-fees")
        ]
        
        for method, endpoint in endpoints_to_test:
            print_info(f"Testing {method} {endpoint} without authentication")
            
            response = self.make_request(method, endpoint, {"test": "data"})
            
            if response and response.status_code == 403 and "Not authenticated" in response.text:
                print_success(f"{method} {endpoint} correctly requires authentication")
                self.test_results.append((f"Auth required {method} {endpoint}", True))
            else:
                print_error(f"{method} {endpoint} should require authentication")
                if response:
                    print(f"    Response: {response.text}")
                self.test_results.append((f"Auth required {method} {endpoint}", False))
        
        return True
    
    def run_all_tests(self):
        """Run all backend tests"""
        print_header("CORPORATE RESERVATION ENGINE - BACKEND API TESTING")
        print_info(f"Testing against: {BACKEND_URL}")
        
        # Setup test data
        if not self.setup_test_data():
            print_error("Failed to setup test data. Exiting.")
            return False
        
        # Run all test suites
        test_suites = [
            self.test_employee_creation_with_approval,
            self.test_employee_update,
            self.test_service_fees_access_control,
            self.test_company_update_without_service_fees,
            self.test_authentication_requirements
        ]
        
        for test_suite in test_suites:
            try:
                test_suite()
            except Exception as e:
                print_error(f"Test suite failed with exception: {e}")
        
        # Print summary
        self.print_test_summary()
        
        return True
    
    def print_test_summary(self):
        """Print test results summary"""
        print_header("TEST RESULTS SUMMARY")
        
        passed = sum(1 for _, result in self.test_results if result)
        total = len(self.test_results)
        failed = total - passed
        
        print(f"\n{Colors.BOLD}Total Tests: {total}{Colors.ENDC}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.ENDC}")
        print(f"{Colors.RED}Failed: {failed}{Colors.ENDC}")
        
        if failed > 0:
            print(f"\n{Colors.RED}Failed Tests:{Colors.ENDC}")
            for test_name, result in self.test_results:
                if not result:
                    print(f"  {Colors.RED}❌ {test_name}{Colors.ENDC}")
        
        print(f"\n{Colors.BOLD}Detailed Results:{Colors.ENDC}")
        for test_name, result in self.test_results:
            status = f"{Colors.GREEN}✅ PASS" if result else f"{Colors.RED}❌ FAIL"
            print(f"  {status}{Colors.ENDC} {test_name}")
        
        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"\n{Colors.BOLD}Success Rate: {success_rate:.1f}%{Colors.ENDC}")
        
        if success_rate >= 80:
            print(f"{Colors.GREEN}🎉 Overall Status: GOOD{Colors.ENDC}")
        elif success_rate >= 60:
            print(f"{Colors.YELLOW}⚠️  Overall Status: NEEDS ATTENTION{Colors.ENDC}")
        else:
            print(f"{Colors.RED}🚨 Overall Status: CRITICAL ISSUES{Colors.ENDC}")

def main():
    """Main function"""
    print("Starting Corporate Reservation Engine Backend Tests...")
    
    tester = APITester()
    success = tester.run_all_tests()
    
    if success:
        print_success("Testing completed successfully!")
        return 0
    else:
        print_error("Testing failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())