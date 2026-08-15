# backend/check_urls.py
import requests
from urllib.parse import urljoin

base_urls = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

endpoints = [
    "/",
    "/api/health",
    "/apidocs/",
    "/docs/",
    "/swagger/",
    "/swagger-ui/",
]

print("\n" + "="*60)
print("Testing IJTD URLs")
print("="*60)

for base in base_urls:
    print(f"\n📡 Testing {base}")
    print("-" * 40)
    
    for endpoint in endpoints:
        url = urljoin(base, endpoint)
        try:
            response = requests.get(url, timeout=3)
            print(f"  ✓ {endpoint} -> Status: {response.status_code}")
            if response.status_code == 200 and endpoint == "/":
                print(f"    Response: {response.json().get('name', 'API is running')}")
        except requests.ConnectionError:
            print(f"  ✗ {endpoint} -> Connection failed")
        except Exception as e:
            print(f"  ✗ {endpoint} -> Error: {str(e)[:50]}")

print("\n" + "="*60)
print("If nothing works, make sure your backend is running:")
print("1. cd C:\\Users\\grace\\Desktop\\PROJECT\\backend")
print("2. venv\\Scripts\\activate")
print("3. python run.py")
print("="*60)