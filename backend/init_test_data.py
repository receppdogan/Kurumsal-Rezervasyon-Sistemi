"""Initialize test data for the reservation system"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'reservation_system')]


async def create_test_company():
    """Create a test company"""
    company_id = str(uuid.uuid4())
    company = {
        "id": company_id,
        "name": "ABC Teknoloji A.Ş.",
        "tax_number": "1234567890",
        "address": "Maslak Mah. Büyükdere Cad. No:123 Sarıyer/İstanbul",
        "phone": "+90 212 123 45 67",
        "email": "info@abc-tech.com",
        "service_fees": {
            "hotel": {"type": "fixed", "value": 50.0, "additional_fee": 0.0},
            "flight": {"type": "percentage", "value": 5.0, "additional_fee": 25.0},
            "transfer": {"type": "fixed", "value": 25.0, "additional_fee": 0.0},
            "visa": {"type": "fixed", "value": 100.0, "additional_fee": 0.0},
            "insurance": {"type": "percentage", "value": 10.0, "additional_fee": 0.0},
            "car_rental": {"type": "fixed", "value": 40.0, "additional_fee": 15.0}
        },
        "booking_rules": {
            "hotel_max_stars": 5,
            "hotel_max_price_per_night": 5000.0,
            "requires_manager_approval": True,
            "economy_booking_days_before": 0,
            "business_booking_days_before": 7
        },
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    existing = await db.companies.find_one({"email": company["email"]})
    if not existing:
        await db.companies.insert_one(company)
        print(f"✅ Created company: {company['name']}")
        return company_id
    else:
        print(f"ℹ️  Company already exists: {company['name']}")
        return existing['id']


async def create_test_users(company_id):
    """Create test users"""
    users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@abc-tech.com",
            "password_hash": get_password_hash("admin123"),
            "full_name": "Ahmet Yılmaz",
            "phone": "+90 532 111 11 11",
            "role": "admin",
            "company_id": company_id,
            "department": "Yönetim",
            "is_active": True,
            "is_first_login": False,
            "gdpr_accepted": True,
            "gdpr_accepted_date": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "manager@abc-tech.com",
            "password_hash": get_password_hash("manager123"),
            "full_name": "Ayşe Demir",
            "phone": "+90 532 222 22 22",
            "role": "manager",
            "company_id": company_id,
            "department": "İnsan Kaynakları",
            "is_active": True,
            "is_first_login": False,
            "gdpr_accepted": True,
            "gdpr_accepted_date": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "employee@abc-tech.com",
            "password_hash": get_password_hash("employee123"),
            "full_name": "Mehmet Kaya",
            "phone": "+90 532 333 33 33",
            "role": "employee",
            "company_id": company_id,
            "department": "Yazılım Geliştirme",
            "is_active": True,
            "is_first_login": False,
            "gdpr_accepted": True,
            "gdpr_accepted_date": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    ]
    
    for user in users:
        existing = await db.users.find_one({"email": user["email"]})
        if not existing:
            await db.users.insert_one(user)
            print(f"✅ Created user: {user['email']} (Role: {user['role']})")
        else:
            print(f"ℹ️  User already exists: {user['email']}")


async def main():
    print("🚀 Initializing test data...")
    print()
    
    # Create company
    company_id = await create_test_company()
    print()
    
    # Create users
    await create_test_users(company_id)
    print()
    
    print("✨ Test data initialization complete!")
    print()
    print("📝 Test Credentials:")
    print("-" * 50)
    print("Admin:")
    print("  Email: admin@abc-tech.com")
    print("  Password: admin123")
    print()
    print("Manager:")
    print("  Email: manager@abc-tech.com")
    print("  Password: manager123")
    print()
    print("Employee:")
    print("  Email: employee@abc-tech.com")
    print("  Password: employee123")
    print("-" * 50)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
