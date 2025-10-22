#!/usr/bin/env python3
"""
Detailed debugging of specific issues
"""

import requests
import json

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

def login_manager():
    """Login as manager and return token"""
    response = requests.post(f"{BACKEND_URL}/auth/login", json={
        "email": "manager@abc-tech.com",
        "password": "manager123"
    })
    
    if response.status_code == 200:
        data = response.json()
        return data["access_token"], data["user"]
    return None, None

def debug_employee_creation():
    """Debug employee creation issue"""
    print("=== DEBUGGING EMPLOYEE CREATION ===")
    
    admin_token, admin_user = login_admin()
    manager_token, manager_user = login_manager()
    
    if not admin_token or not manager_token:
        print("Failed to login users")
        return
    
    print(f"Admin user: {admin_user['id']} - {admin_user['role']}")
    print(f"Manager user: {manager_user['id']} - {manager_user['role']}")
    
    # Try to create employee with manager as approver
    employee_data = {
        "email": "debug.test@abc-tech.com",
        "password": "test123",
        "full_name": "Debug Test Employee",
        "phone": "+90 532 999 99 99",
        "role": "employee",
        "company_id": admin_user["company_id"],
        "department": "Debug Department",
        "requires_approval": True,
        "approver_id": manager_user["id"]
    }
    
    print(f"Creating employee with data: {json.dumps(employee_data, indent=2)}")
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=employee_data,
                           headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Body: {response.text}")

def debug_service_fees_access():
    """Debug service fees access control"""
    print("\n=== DEBUGGING SERVICE FEES ACCESS ===")
    
    admin_token, admin_user = login_admin()
    
    if not admin_token:
        print("Failed to login admin")
        return
    
    print(f"Admin user role: {admin_user['role']}")
    print(f"Company ID: {admin_user['company_id']}")
    
    # Test GET service fees
    response = requests.get(f"{BACKEND_URL}/companies/{admin_user['company_id']}/service-fees",
                          headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"GET service-fees Status: {response.status_code}")
    print(f"GET service-fees Response: {response.text}")
    
    # Test PUT service fees
    service_fee_data = {
        "service_fees": {
            "hotel": {"type": "fixed", "value": 50.0, "additional_fee": 0.0, "currency": "TRY"}
        }
    }
    
    response = requests.put(f"{BACKEND_URL}/companies/{admin_user['company_id']}/service-fees",
                          json=service_fee_data,
                          headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"PUT service-fees Status: {response.status_code}")
    print(f"PUT service-fees Response: {response.text}")

def debug_auth_requirements():
    """Debug authentication requirements"""
    print("\n=== DEBUGGING AUTH REQUIREMENTS ===")
    
    # Test POST /employees without token
    response = requests.post(f"{BACKEND_URL}/employees", json={"test": "data"})
    print(f"POST /employees without token: {response.status_code} - {response.text}")
    
    # Test GET service-fees without token
    response = requests.get(f"{BACKEND_URL}/companies/test-id/service-fees")
    print(f"GET service-fees without token: {response.status_code} - {response.text}")

def debug_update_validation():
    """Debug employee update validation"""
    print("\n=== DEBUGGING UPDATE VALIDATION ===")
    
    admin_token, admin_user = login_admin()
    
    if not admin_token:
        print("Failed to login admin")
        return
    
    # Get employee ID
    employee_id = admin_user["id"]  # Use admin as test subject
    
    # Try to update with invalid approver
    update_data = {
        "approver_id": "invalid-approver-id-12345"
    }
    
    response = requests.put(f"{BACKEND_URL}/employees/{employee_id}",
                          json=update_data,
                          headers={"Authorization": f"Bearer {admin_token}"})
    
    print(f"Update with invalid approver Status: {response.status_code}")
    print(f"Update with invalid approver Response: {response.text}")

if __name__ == "__main__":
    debug_employee_creation()
    debug_service_fees_access()
    debug_auth_requirements()
    debug_update_validation()