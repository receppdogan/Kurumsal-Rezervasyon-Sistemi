#!/usr/bin/env python3
"""
Comprehensive test with detailed output
"""

import requests
import json
import uuid

BACKEND_URL = "https://corpreserve.preview.emergentagent.com/api"

def login_users():
    """Login all users and return tokens"""
    users = {}
    
    # Login admin
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "admin@abc-tech.com",
        "password": "admin123"
    })
    if response.status_code == 200:
        data = response.json()
        users["admin"] = {"token": data["access_token"], "user": data["user"]}
    
    # Login manager
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "manager@abc-tech.com",
        "password": "manager123"
    })
    if response.status_code == 200:
        data = response.json()
        users["manager"] = {"token": data["access_token"], "user": data["user"]}
    
    # Login employee
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "employee@abc-tech.com",
        "password": "employee123"
    })
    if response.status_code == 200:
        data = response.json()
        users["employee"] = {"token": data["access_token"], "user": data["user"]}
    
    # Login agency admin
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "agency.admin@b2btravel.com",
        "password": "agency123"
    })
    if response.status_code == 200:
        data = response.json()
        users["agency_admin"] = {"token": data["access_token"], "user": data["user"]}
    
    return users

def test_all_scenarios():
    """Test all scenarios comprehensively"""
    users = login_users()
    
    if not users.get("admin"):
        print("Failed to login admin")
        return
    
    admin_token = users["admin"]["token"]
    admin_user = users["admin"]["user"]
    company_id = admin_user["company_id"]
    
    print("=== COMPREHENSIVE BACKEND API TESTING ===")
    print(f"Company ID: {company_id}")
    print(f"Admin ID: {admin_user['id']}")
    print(f"Manager ID: {users['manager']['user']['id'] if 'manager' in users else 'N/A'}")
    print(f"Employee ID: {users['employee']['user']['id'] if 'employee' in users else 'N/A'}")
    
    results = []
    
    # Test 1: Valid employee creation
    print("\n1. Testing valid employee creation...")
    unique_id = str(uuid.uuid4())[:8]
    employee_data = {
        "email": f"test.valid.{unique_id}@abc-tech.com",
        "password": "test123",
        "full_name": "Test Valid Employee",
        "phone": "+90 532 111 11 11",
        "role": "employee",
        "company_id": company_id,
        "department": "Test Department",
        "requires_approval": True,
        "approver_id": users["manager"]["user"]["id"] if "manager" in users else admin_user["id"]
    }
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=employee_data,
                           headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("✅ PASS - Valid employee creation")
        results.append(("Valid employee creation", True))
    else:
        print(f"❌ FAIL - Valid employee creation: {response.text}")
        results.append(("Valid employee creation", False))
    
    # Test 2: Invalid approver validation
    print("\n2. Testing invalid approver validation...")
    unique_id = str(uuid.uuid4())[:8]
    employee_data = {
        "email": f"test.invalid.{unique_id}@abc-tech.com",
        "password": "test123",
        "full_name": "Test Invalid Employee",
        "phone": "+90 532 222 22 22",
        "role": "employee",
        "company_id": company_id,
        "department": "Test Department",
        "requires_approval": True,
        "approver_id": "invalid-id-12345"
    }
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=employee_data,
                           headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 400 and "Approver not found" in response.text:
        print("✅ PASS - Invalid approver validation")
        results.append(("Invalid approver validation", True))
    else:
        print("❌ FAIL - Invalid approver validation")
        results.append(("Invalid approver validation", False))
    
    # Test 3: Employee as approver validation
    print("\n3. Testing employee as approver validation...")
    if "employee" in users:
        unique_id = str(uuid.uuid4())[:8]
        employee_data = {
            "email": f"test.employee.approver.{unique_id}@abc-tech.com",
            "password": "test123",
            "full_name": "Test Employee Approver",
            "phone": "+90 532 333 33 33",
            "role": "employee",
            "company_id": company_id,
            "department": "Test Department",
            "requires_approval": True,
            "approver_id": users["employee"]["user"]["id"]
        }
        
        response = requests.post(f"{BACKEND_URL}/employees", 
                               json=employee_data,
                               headers={"Authorization": f"Bearer {admin_token}"})
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        if response.status_code == 400 and "Approver must be a manager or admin" in response.text:
            print("✅ PASS - Employee as approver validation")
            results.append(("Employee as approver validation", True))
        else:
            print("❌ FAIL - Employee as approver validation")
            results.append(("Employee as approver validation", False))
    
    # Test 4: Duplicate email validation
    print("\n4. Testing duplicate email validation...")
    duplicate_data = {
        "email": "admin@abc-tech.com",  # Existing email
        "password": "test123",
        "full_name": "Duplicate Admin",
        "phone": "+90 532 444 44 44",
        "role": "employee",
        "company_id": company_id,
        "department": "Test Department",
        "requires_approval": False
    }
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=duplicate_data,
                           headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 400 and "Email already registered" in response.text:
        print("✅ PASS - Duplicate email validation")
        results.append(("Duplicate email validation", True))
    else:
        print("❌ FAIL - Duplicate email validation")
        results.append(("Duplicate email validation", False))
    
    # Test 5: Service fees access control
    print("\n5. Testing service fees access control...")
    
    # Test with company admin (should fail)
    response = requests.get(f"{BACKEND_URL}/companies/{company_id}/service-fees",
                          headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Company ADMIN GET Status: {response.status_code}")
    print(f"Company ADMIN GET Response: {response.text}")
    if response.status_code == 403 and "B2BTravel Admin access required" in response.text:
        print("✅ PASS - Company admin denied service fees access")
        results.append(("Company admin denied service fees", True))
    else:
        print("❌ FAIL - Company admin should be denied service fees access")
        results.append(("Company admin denied service fees", False))
    
    # Test with agency admin (should succeed)
    if "agency_admin" in users:
        response = requests.get(f"{BACKEND_URL}/companies/{company_id}/service-fees",
                              headers={"Authorization": f"Bearer {users['agency_admin']['token']}"})
        
        print(f"Agency ADMIN GET Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ PASS - Agency admin can access service fees")
            results.append(("Agency admin access service fees", True))
        else:
            print(f"❌ FAIL - Agency admin should access service fees: {response.text}")
            results.append(("Agency admin access service fees", False))
    
    # Test 6: Authentication requirements
    print("\n6. Testing authentication requirements...")
    response = requests.post(f"{BACKEND_URL}/employees", json={"test": "data"})
    
    print(f"No auth Status: {response.status_code}")
    print(f"No auth Response: {response.text}")
    if response.status_code == 403 and "Not authenticated" in response.text:
        print("✅ PASS - Authentication required")
        results.append(("Authentication required", True))
    else:
        print("❌ FAIL - Authentication should be required")
        results.append(("Authentication required", False))
    
    # Summary
    print("\n=== SUMMARY ===")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")

if __name__ == "__main__":
    test_all_scenarios()