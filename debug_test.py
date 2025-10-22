#!/usr/bin/env python3
"""
Debug specific issues found in backend testing
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

def test_invalid_approver():
    """Test validation with invalid approver_id"""
    token, user = login_admin()
    if not token:
        print("Failed to login")
        return
    
    print("Testing invalid approver validation...")
    
    employee_data = {
        "email": "test.debug@abc-tech.com",
        "password": "test123",
        "full_name": "Test Debug Employee",
        "phone": "+90 532 888 88 88",
        "role": "employee",
        "company_id": user["company_id"],
        "department": "Test Department",
        "requires_approval": True,
        "approver_id": "invalid-id-12345"
    }
    
    response = requests.post(f"{BACKEND_URL}/employees", 
                           json=employee_data,
                           headers={"Authorization": f"Bearer {token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

def test_service_fees_access():
    """Test service fees access control"""
    token, user = login_admin()
    if not token:
        print("Failed to login")
        return
    
    print(f"Testing service fees access with ADMIN role...")
    print(f"User role: {user.get('role')}")
    
    response = requests.get(f"{BACKEND_URL}/companies/{user['company_id']}/service-fees",
                          headers={"Authorization": f"Bearer {token}"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

def test_auth_without_token():
    """Test authentication without token"""
    print("Testing POST /employees without token...")
    
    response = requests.post(f"{BACKEND_URL}/employees", json={"test": "data"})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_invalid_approver()
    print("\n" + "="*50 + "\n")
    test_service_fees_access()
    print("\n" + "="*50 + "\n")
    test_auth_without_token()