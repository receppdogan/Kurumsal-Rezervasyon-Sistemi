#!/usr/bin/env python3
"""
Simple test to verify string matching
"""

response_text = '{"detail":"Approver not found"}'
print(f"Response text: {response_text}")
print(f"Contains 'Approver not found': {'Approver not found' in response_text}")

response_text2 = '{"detail":"Approver must be a manager or admin"}'
print(f"Response text 2: {response_text2}")
print(f"Contains 'Approver must be a manager or admin': {'Approver must be a manager or admin' in response_text2}")

response_text3 = '{"detail":"Email already registered"}'
print(f"Response text 3: {response_text3}")
print(f"Contains 'Email already registered': {'Email already registered' in response_text3}")

response_text4 = '{"detail":"B2BTravel Admin access required"}'
print(f"Response text 4: {response_text4}")
print(f"Contains 'B2BTravel Admin access required': {'B2BTravel Admin access required' in response_text4}")

response_text5 = '{"detail":"Not authenticated"}'
print(f"Response text 5: {response_text5}")
print(f"Contains 'Not authenticated': {'Not authenticated' in response_text5}")