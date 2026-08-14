from fastapi.testclient import TestClient
from main import app, get_current_user
from models import Kullanici

# Mock the dependency to bypass auth
app.dependency_overrides[get_current_user] = lambda: Kullanici(akademi_adi="Test1")

client = TestClient(app)
response = client.get("/ogrenciler/")
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
