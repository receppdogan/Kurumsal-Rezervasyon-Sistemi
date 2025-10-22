"""Create or verify agency admin user"""
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


async def create_or_update_agency_admin():
    """Create or update agency admin user"""
    email = "agency.admin@b2btravel.com"
    
    # Check if user exists
    existing = await db.users.find_one({"email": email})
    
    if existing:
        print(f"✓ Agency admin already exists: {email}")
        print(f"  - ID: {existing.get('id')}")
        print(f"  - Role: {existing.get('role')}")
        print(f"  - GDPR Accepted: {existing.get('gdpr_accepted')}")
        print(f"  - Company ID: {existing.get('company_id')}")
        
        # Update to ensure correct role and GDPR
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "role": "agency_admin",
                "gdpr_accepted": True,
                "gdpr_accepted_date": datetime.utcnow().isoformat(),
                "is_first_login": False,
                "updated_at": datetime.utcnow().isoformat()
            }}
        )
        print("  - Updated: role=agency_admin, gdpr_accepted=True")
    else:
        # Create new agency admin
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": email,
            "password_hash": get_password_hash("agency123"),
            "full_name": "B2BTravel Agency Admin",
            "phone": "+90 212 999 99 99",
            "role": "agency_admin",
            "company_id": None,  # Agency admin doesn't belong to a specific company
            "department": None,
            "is_active": True,
            "requires_approval": False,
            "approver_id": None,
            "is_first_login": False,
            "gdpr_accepted": True,
            "gdpr_accepted_date": datetime.utcnow().isoformat(),
            "passport_number": None,
            "id_number": None,
            "date_of_birth": None,
            "passport_expiry": None,
            "airline_preference": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await db.users.insert_one(user)
        print(f"✓ Created new agency admin: {email}")
        print(f"  - ID: {user_id}")
        print(f"  - Password: agency123")
        print(f"  - Role: agency_admin")


async def main():
    print("=== Agency Admin Setup ===\n")
    await create_or_update_agency_admin()
    print("\n=== Setup Complete ===")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
