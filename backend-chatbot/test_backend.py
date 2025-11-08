#!/usr/bin/env python3
"""
Test script for SehatConnect AI Chatbot Backend
Verifies that all components are working correctly
"""

import sys
import requests
import json
from colorama import init, Fore, Style

init(autoreset=True)

BACKEND_URL = "http://localhost:8000"

def print_header(text):
    print(f"\n{Fore.CYAN}{'=' * 60}")
    print(f"{Fore.CYAN}{text}")
    print(f"{Fore.CYAN}{'=' * 60}\n")

def print_success(text):
    print(f"{Fore.GREEN}✅ {text}")

def print_error(text):
    print(f"{Fore.RED}❌ {text}")

def print_info(text):
    print(f"{Fore.YELLOW}ℹ️  {text}")

def test_server_running():
    """Test if server is running"""
    print_header("Test 1: Server Status")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        if response.status_code == 200:
            print_success("Server is running!")
            data = response.json()
            print_info(f"Service: {data.get('message')}")
            print_info(f"Version: {data.get('version')}")
            return True
        else:
            print_error(f"Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to server. Is it running?")
        print_info("Start with: python chat_api.py")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def test_health_check():
    """Test health check endpoint"""
    print_header("Test 2: Health Check")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Health check passed!")
            print_info(f"Status: {data.get('status')}")
            print_info(f"Service: {data.get('service')}")
            print_info(f"Model loaded: {data.get('model_loaded')}")
            print_info(f"Dataset loaded: {data.get('dataset_loaded')}")
            
            if data.get('model_loaded') and data.get('dataset_loaded'):
                print_success("All components loaded successfully!")
                return True
            else:
                print_error("Some components failed to load")
                return False
        else:
            print_error(f"Health check failed with status: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False

def test_chat_endpoint():
    """Test chat endpoint with sample query"""
    print_header("Test 3: Chat Endpoint")
    
    test_cases = [
        {
            "message": "I have fever and headache",
            "expected_min_confidence": 0.5
        },
        {
            "message": "body pain and cough",
            "expected_min_confidence": 0.5
        },
        {
            "message": "feeling dizzy and nauseous",
            "expected_min_confidence": 0.4
        }
    ]
    
    all_passed = True
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{Fore.MAGENTA}Test Case {i}:")
        print_info(f"Query: '{test_case['message']}'")
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/chat",
                json={"message": test_case['message']},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                confidence = data.get('confidence', 0)
                reply = data.get('reply', '')
                
                print_success(f"Response received!")
                print_info(f"Confidence: {confidence:.2%}")
                print_info(f"Reply preview: {reply[:100]}...")
                
                if confidence >= test_case['expected_min_confidence']:
                    print_success(f"Confidence meets threshold ({confidence:.2%} >= {test_case['expected_min_confidence']:.2%})")
                else:
                    print_error(f"Low confidence ({confidence:.2%})")
                    all_passed = False
            else:
                print_error(f"Request failed with status: {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print_error(f"Request error: {e}")
            all_passed = False
    
    return all_passed

def test_stats_endpoint():
    """Test statistics endpoint"""
    print_header("Test 4: Statistics Endpoint")
    try:
        response = requests.get(f"{BACKEND_URL}/stats", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Statistics retrieved!")
            print_info(f"Total records: {data.get('total_records')}")
            print_info(f"Unique diseases: {data.get('unique_diseases')}")
            print_info(f"Embedding dimensions: {data.get('embedding_dimensions')}")
            print_info(f"Model: {data.get('model_name')}")
            return True
        else:
            print_error(f"Stats request failed with status: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Stats error: {e}")
        return False

def test_edge_cases():
    """Test edge cases and error handling"""
    print_header("Test 5: Edge Cases")
    
    edge_cases = [
        {"message": "", "name": "Empty message"},
        {"message": "a" * 600, "name": "Very long message"},
        {"message": "xyz123", "name": "Random text"},
    ]
    
    all_handled = True
    
    for edge_case in edge_cases:
        print(f"\n{Fore.MAGENTA}Testing: {edge_case['name']}")
        try:
            response = requests.post(
                f"{BACKEND_URL}/chat",
                json={"message": edge_case['message']},
                timeout=5
            )
            
            if response.status_code in [200, 400, 422]:
                data = response.json()
                print_success(f"Handled correctly (status: {response.status_code})")
                if 'reply' in data:
                    print_info(f"Response: {data['reply'][:80]}...")
            else:
                print_error(f"Unexpected status code: {response.status_code}")
                all_handled = False
                
        except Exception as e:
            print_error(f"Error: {e}")
            all_handled = False
    
    return all_handled

def main():
    """Run all tests"""
    print(f"{Fore.CYAN}{Style.BRIGHT}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  SehatConnect AI Chatbot Backend Test Suite               ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(Style.RESET_ALL)
    
    results = []
    
    # Run tests
    results.append(("Server Running", test_server_running()))
    
    if not results[-1][1]:
        print_error("\nCannot continue tests without running server!")
        print_info("Start server with: python chat_api.py")
        sys.exit(1)
    
    results.append(("Health Check", test_health_check()))
    results.append(("Chat Endpoint", test_chat_endpoint()))
    results.append(("Statistics", test_stats_endpoint()))
    results.append(("Edge Cases", test_edge_cases()))
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Fore.GREEN}PASSED" if result else f"{Fore.RED}FAILED"
        print(f"{test_name:.<50} {status}")
    
    print(f"\n{Fore.CYAN}Total: {passed}/{total} tests passed")
    
    if passed == total:
        print(f"\n{Fore.GREEN}{Style.BRIGHT}🎉 All tests passed! Backend is ready to use! 🎉")
        print(f"\n{Fore.YELLOW}Next steps:")
        print(f"{Fore.YELLOW}1. Start React Native app: npx react-native run-android")
        print(f"{Fore.YELLOW}2. Tap 'Ask Sehat' button in the app")
        print(f"{Fore.YELLOW}3. Start chatting with the AI!")
        return 0
    else:
        print(f"\n{Fore.RED}{Style.BRIGHT}❌ Some tests failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n\n{Fore.YELLOW}Tests interrupted by user")
        sys.exit(1)
