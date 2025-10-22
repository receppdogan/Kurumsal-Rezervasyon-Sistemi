#!/usr/bin/env python3
"""
Final debugging to check exact response messages
"""

import requests
import json
import uuid

BACKEND_URL = "https://corpreserve.preview.emergentagent.com/api"

def login_admin():
    """Login as admin and return token"""
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "admin@abc-tech.com",
        "password": "admin123"
    })
    
    if response.status_code == 200:
        data = response.json()
        return data["access_token"], data["user"]
    return None, None

def login_employee():
    """Login as employee and return token"""
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "employee@abc-tech.com",
        "password": "employee123"
    })
    
    if response.status_code == 200:
        data = response.json()
        return data["access_token"], data["user"]
    return None, None

def test_all_validations():
    """Test all validation scenarios"""
    admin_token, admin_user = login_admin()
    employee_token, employee_user = login_employee()
    
    if not admin_token or not employee_token:
        print("Failed to login users")
        return
    
    print("=== Testing Invalid Approver Validation ===")
    unique_id = str(uuid.uuid4())[:8]
    employee_data = {
        "email": f"test.invalid.{unique_id}@abc-tech.com",
        "password": "test123",
        "full_name": "Test Invalid Employee",
        "phone": "+90 532 888 88 88",
        "role": "employee",
        "company_id": admin_user["company_id"],
        "department": "Test Department",
        "requires_approval": True,
        "approver_id": "invalid-id-12345"
    }
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=employee_data,
                           headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print(f"Contains 'Approver not found': {'Approver not found' in response.text}")
    
    print("\n=== Testing Employee as Approver Validation ===")
    unique_id2 = str(uuid.uuid4())[:8]
    employee_data2 = {
        "email": f"test.employee.approver.{unique_id2}@abc-tech.com",
        "password": "test123",
        "full_name": "Test Employee Approver",
        "phone": "+90 532 777 77 77",
        "role": "employee",
        "company_id": admin_user["company_id"],
        "department": "Test Department",
        "requires_approval": True,
        "approver_id": employee_user["id"]  # Employee cannot be approver
    }
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=employee_data2,
                           headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print(f"Contains 'Approver must be a manager or admin': {'Approver must be a manager or admin' in response.text}")
    
    print("\n=== Testing Duplicate Email Validation ===")
    # Try to create with existing email
    duplicate_data = {
        "email": "admin@abc-tech.com",  # This email already exists
        "password": "test123",
        "full_name": "Duplicate Admin",
        "phone": "+90 532 999 99 99",
        "role": "employee",
        "company_id": admin_user["company_id"],
        "department": "Test Department",
        "requires_approval": False
    }
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=duplicate_data,
                           headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print(f"Contains 'already registered': {'already registered' in response.text}")
    
    print("\n=== Testing Update Invalid Approver ===")
    update_data = {
        "approver_id": "invalid-approver-id-12345"
    }
    
    response = requests.put(f"{BACKEND_URL}/employees/{employee_user['id']}",
                          json=update_data,
                          headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print(f"Contains 'Approver not found': {'Approver not found' in response.text}")

if __name__ == "__main__":
    test_all_validations()