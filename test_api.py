#!/usr/bin/env python3
"""
Test script to verify all API endpoints work correctly.
Run after starting the server: uvicorn app.main:app --reload
"""
import requests
import time
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health_check():
    print_section("1. Health Check")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_register():
    print_section("2. Register Lawyer (Phase 1)")
    data = {
        "email": "test.lawyer@example.com",
        "password": "SecurePassword123!"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code in [200, 201, 400]  # 400 if already exists

def test_login():
    print_section("3. Login to Get JWT Token (Phase 1)")
    data = {
        "username": "test.lawyer@example.com",
        "password": "SecurePassword123!"
    }
    response = requests.post(f"{BASE_URL}/auth/token", data=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200:
        token = result.get("access_token")
        print(f"\n✓ JWT Token obtained (first 50 chars): {token[:50]}...")
        return token
    return None

def test_submit_ticket():
    print_section("4. Submit Ticket - Public Endpoint (Phase 2 & 3)")
    data = {
        "client_name": "Jane Smith",
        "client_email": "jane.smith@example.com",
        "client_phone": "555-9876",
        "event_summary": "Workplace discrimination case, need immediate consultation",
        "urgency_level": "Court Date Soon"
    }
    
    print("Submitting ticket...")
    start_time = time.time()
    response = requests.post(f"{BASE_URL}/intake", json=data)
    end_time = time.time()
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print(f"Response time: {end_time - start_time:.2f} seconds")
    print("\n✓ Response returned immediately (background task runs separately)")
    print("  Watch server logs for: '[BACKGROUND TASK] New Client Lead Email Sent!'")
    
    return response.status_code == 201

def test_get_tickets(token):
    print_section("5. Get All Tickets - Protected Endpoint (Phase 3)")
    
    if not token:
        print("❌ No token available, skipping protected endpoint test")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/tickets", headers=headers)
    
    print(f"Status: {response.status_code}")
    tickets = response.json()
    print(f"Response: {json.dumps(tickets, indent=2)}")
    print(f"\n✓ Retrieved {len(tickets)} ticket(s)")
    
    return response.status_code == 200

def test_protected_without_token():
    print_section("6. Test Protected Endpoint Without Token (Security)")
    response = requests.get(f"{BASE_URL}/tickets")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 401:
        print("\n✓ Correctly rejected unauthorized request")
        return True
    return False

def main():
    print("\n" + "="*60)
    print("  LEGAL INTAKE API - COMPREHENSIVE TEST SUITE")
    print("="*60)
    print("\nTesting all three phases:")
    print("  Phase 1: Authentication & Security")
    print("  Phase 2: Database & Ticketing")
    print("  Phase 3: Concurrency & Protected Routes")
    
    results = []
    
    try:
        # Phase 1 Tests
        results.append(("Health Check", test_health_check()))
        results.append(("Register", test_register()))
        token = test_login()
        results.append(("Login", token is not None))
        
        # Phase 2 & 3 Tests
        results.append(("Submit Ticket", test_submit_ticket()))
        results.append(("Get Tickets (Protected)", test_get_tickets(token)))
        results.append(("Security Test", test_protected_without_token()))
        
        # Summary
        print_section("TEST SUMMARY")
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✓ PASS" if result else "✗ FAIL"
            print(f"{status}: {test_name}")
        
        print(f"\n{passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 All tests passed! API is working correctly.")
        else:
            print("\n⚠️  Some tests failed. Check server logs for details.")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server")
        print("Make sure the server is running:")
        print("  uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    main()
