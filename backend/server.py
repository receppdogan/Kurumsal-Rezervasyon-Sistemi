from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, date, timedelta

# Import models and auth
from models import (
    User, UserCreate, UserLogin, UserUpdate, UserResponse,
    Company, CompanyCreate,
    Hotel, HotelSearchRequest,
    Reservation, HotelReservationCreate, ReservationUpdate, ReservationResponse,
    ReservationStatus, UserRole, ServiceType,
    Token, DashboardStats
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_role
)
from mock_data import init_mock_hotels

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'reservation_system')]

# Create the main app
app = FastAPI(title="Corporate Reservation System API")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Dependency to get database
async def get_db():
    return db


# Dependency to get current user with db
async def get_current_user_dep(credentials = Depends(security)):
    return await get_current_user(credentials, db)


# Role-based dependencies
async def require_admin(current_user: dict = Depends(get_current_user_dep)):
    if current_user.get("role") not in [UserRole.ADMIN, UserRole.AGENCY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def require_manager_or_admin(current_user: dict = Depends(get_current_user_dep)):
    if current_user.get("role") not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager or Admin access required"
        )
    return current_user


# ==================== AUTHENTICATION ENDPOINTS ====================

@api_router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, database = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = await database.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        **user_data.model_dump(exclude={'password'}),
        password_hash=get_password_hash(user_data.password)
    )
    
    # Convert to dict for MongoDB
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['updated_at'] = user_dict['updated_at'].isoformat()
    if user_dict.get('date_of_birth'):
        user_dict['date_of_birth'] = user_dict['date_of_birth'].isoformat()
    if user_dict.get('passport_expiry'):
        user_dict['passport_expiry'] = user_dict['passport_expiry'].isoformat()
    if user_dict.get('gdpr_accepted_date'):
        user_dict['gdpr_accepted_date'] = user_dict['gdpr_accepted_date'].isoformat()
    
    await database.users.insert_one(user_dict)
    
    return UserResponse(**user.model_dump())


@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin, database = Depends(get_db)):
    """Login user and return access token"""
    # Find user
    user = await database.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user['id']})
    
    return Token(
        access_token=access_token,
        user=UserResponse(**user)
    )


@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user_dep)):
    """Get current user information"""
    return UserResponse(**current_user)


@api_router.put("/auth/me", response_model=UserResponse)
async def update_me(
    updates: UserUpdate,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Update current user information"""
    update_data = updates.model_dump(exclude_unset=True)
    
    if update_data:
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        # Convert date fields
        if 'date_of_birth' in update_data and update_data['date_of_birth']:
            update_data['date_of_birth'] = update_data['date_of_birth'].isoformat()
        if 'passport_expiry' in update_data and update_data['passport_expiry']:
            update_data['passport_expiry'] = update_data['passport_expiry'].isoformat()
        if 'gdpr_accepted_date' in update_data and update_data['gdpr_accepted_date']:
            update_data['gdpr_accepted_date'] = update_data['gdpr_accepted_date'].isoformat()
        
        await database.users.update_one(
            {"id": current_user['id']},
            {"$set": update_data}
        )
    
    updated_user = await database.users.find_one({"id": current_user['id']}, {"_id": 0})
    return UserResponse(**updated_user)


@api_router.post("/auth/accept-gdpr")
async def accept_gdpr(
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Accept GDPR/KVKK policy"""
    await database.users.update_one(
        {"id": current_user['id']},
        {"$set": {
            "gdpr_accepted": True,
            "gdpr_accepted_date": datetime.utcnow().isoformat(),
            "is_first_login": False,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    return {"message": "GDPR policy accepted successfully"}


# ==================== COMPANY ENDPOINTS ====================

@api_router.post("/companies", response_model=Company, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    current_user: dict = Depends(require_admin),
    database = Depends(get_db)
):
    """Create a new company (Admin only)"""
    company = Company(**company_data.model_dump())
    
    company_dict = company.model_dump()
    company_dict['created_at'] = company_dict['created_at'].isoformat()
    company_dict['updated_at'] = company_dict['updated_at'].isoformat()
    
    await database.companies.insert_one(company_dict)
    return company


@api_router.get("/companies", response_model=List[Company])
async def get_companies(
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Get all companies"""
    companies = await database.companies.find({}, {"_id": 0}).to_list(1000)
    
    for company in companies:
        if isinstance(company.get('created_at'), str):
            company['created_at'] = datetime.fromisoformat(company['created_at'])
        if isinstance(company.get('updated_at'), str):
            company['updated_at'] = datetime.fromisoformat(company['updated_at'])
    
    return companies


@api_router.get("/companies/{company_id}", response_model=Company)
async def get_company(
    company_id: str,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Get company by ID"""
    company = await database.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if isinstance(company.get('created_at'), str):
        company['created_at'] = datetime.fromisoformat(company['created_at'])
    if isinstance(company.get('updated_at'), str):
        company['updated_at'] = datetime.fromisoformat(company['updated_at'])
    
    return Company(**company)


@api_router.put("/companies/{company_id}", response_model=Company)
async def update_company(
    company_id: str,
    company_data: CompanyCreate,
    current_user: dict = Depends(require_admin),
    database = Depends(get_db)
):
    """Update company (Admin only)"""
    existing = await database.companies.find_one({"id": company_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_data.model_dump()
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    await database.companies.update_one(
        {"id": company_id},
        {"$set": update_data}
    )
    
    updated = await database.companies.find_one({"id": company_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return Company(**updated)


# ==================== HOTEL ENDPOINTS ====================

@api_router.post("/hotels/search", response_model=List[Hotel])
async def search_hotels(
    search: HotelSearchRequest,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Search hotels based on criteria"""
    query = {"is_active": True}
    
    if search.city:
        query["city"] = {"$regex": search.city, "$options": "i"}
    
    if search.min_stars:
        query["stars"] = {"$gte": search.min_stars}
    
    if search.max_stars:
        if "stars" in query:
            query["stars"]["$lte"] = search.max_stars
        else:
            query["stars"] = {"$lte": search.max_stars}
    
    hotels = await database.hotels.find(query, {"_id": 0}).to_list(1000)
    
    # Filter by price if specified
    if search.max_price:
        filtered_hotels = []
        for hotel in hotels:
            has_affordable_room = any(
                room['price_per_night'] <= search.max_price
                for room in hotel.get('room_types', [])
            )
            if has_affordable_room:
                filtered_hotels.append(hotel)
        hotels = filtered_hotels
    
    for hotel in hotels:
        if isinstance(hotel.get('created_at'), str):
            hotel['created_at'] = datetime.fromisoformat(hotel['created_at'])
    
    return hotels


@api_router.get("/hotels/{hotel_id}", response_model=Hotel)
async def get_hotel(
    hotel_id: str,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Get hotel details by ID"""
    hotel = await database.hotels.find_one({"id": hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    if isinstance(hotel.get('created_at'), str):
        hotel['created_at'] = datetime.fromisoformat(hotel['created_at'])
    
    return Hotel(**hotel)


# ==================== RESERVATION ENDPOINTS ====================

@api_router.post("/reservations", response_model=Reservation, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    reservation_data: HotelReservationCreate,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Create a new hotel reservation"""
    # Get hotel and room details
    hotel = await database.hotels.find_one({"id": reservation_data.hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    room_type = next((r for r in hotel['room_types'] if r['id'] == reservation_data.room_type_id), None)
    if not room_type:
        raise HTTPException(status_code=404, detail="Room type not found")
    
    # Calculate nights and total price
    nights = (reservation_data.check_out_date - reservation_data.check_in_date).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Invalid date range")
    
    price_per_night = room_type['price_per_night']
    total_price = price_per_night * nights
    
    # Get company and service fee
    company = await database.companies.find_one({"id": current_user['company_id']}, {"_id": 0})
    service_fee = 0.0
    requires_approval = True
    
    if company:
        # Calculate service fee based on type (fixed or percentage)
        hotel_fee_config = company.get('service_fees', {}).get('hotel', {})
        
        # Handle both old format (float) and new format (dict)
        if isinstance(hotel_fee_config, dict):
            fee_type = hotel_fee_config.get('type', 'fixed')
            fee_value = hotel_fee_config.get('value', 0.0)
            additional_fee = hotel_fee_config.get('additional_fee', 0.0)
            
            if fee_type == 'percentage':
                service_fee = (total_price * fee_value / 100) + additional_fee
            else:  # fixed
                service_fee = fee_value + additional_fee
        else:
            # Backward compatibility for old float format
            service_fee = float(hotel_fee_config) if hotel_fee_config else 0.0
        
        requires_approval = company.get('booking_rules', {}).get('requires_manager_approval', True)
    
    grand_total = total_price + service_fee
    
    # Create reservation
    reservation = Reservation(
        **reservation_data.model_dump(),
        hotel_name=hotel['name'],
        room_type_name=room_type['name'],
        nights=nights,
        price_per_night=price_per_night,
        total_price=total_price,
        service_fee=service_fee,
        grand_total=grand_total,
        requires_approval=requires_approval,
        status=ReservationStatus.PENDING if requires_approval else ReservationStatus.CONFIRMED
    )
    
    reservation_dict = reservation.model_dump()
    reservation_dict['created_at'] = reservation_dict['created_at'].isoformat()
    reservation_dict['updated_at'] = reservation_dict['updated_at'].isoformat()
    reservation_dict['check_in_date'] = reservation_dict['check_in_date'].isoformat()
    reservation_dict['check_out_date'] = reservation_dict['check_out_date'].isoformat()
    
    await database.reservations.insert_one(reservation_dict)
    return reservation


@api_router.get("/reservations", response_model=List[ReservationResponse])
async def get_reservations(
    status: Optional[ReservationStatus] = None,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Get reservations based on user role"""
    query = {}
    
    # Filter based on role
    if current_user['role'] == UserRole.EMPLOYEE:
        query['user_id'] = current_user['id']
    elif current_user['role'] == UserRole.MANAGER:
        query['company_id'] = current_user['company_id']
    # Admin sees all
    
    if status:
        query['status'] = status
    
    reservations = await database.reservations.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with user and company information
    for res in reservations:
        # Convert date strings to datetime/date objects
        if isinstance(res.get('created_at'), str):
            res['created_at'] = datetime.fromisoformat(res['created_at'])
        if isinstance(res.get('updated_at'), str):
            res['updated_at'] = datetime.fromisoformat(res['updated_at'])
        if isinstance(res.get('check_in_date'), str):
            res['check_in_date'] = date.fromisoformat(res['check_in_date'])
        if isinstance(res.get('check_out_date'), str):
            res['check_out_date'] = date.fromisoformat(res['check_out_date'])
        if isinstance(res.get('approved_at'), str):
            res['approved_at'] = datetime.fromisoformat(res['approved_at'])
        if isinstance(res.get('cancelled_at'), str):
            res['cancelled_at'] = datetime.fromisoformat(res['cancelled_at'])
        
        user = await database.users.find_one({"id": res['user_id']}, {"_id": 0})
        if user:
            res['user_name'] = user.get('full_name')
            res['user_email'] = user.get('email')
        
        if res.get('company_id'):
            company = await database.companies.find_one({"id": res['company_id']}, {"_id": 0})
            if company:
                res['company_name'] = company.get('name')
    
    return reservations


@api_router.get("/reservations/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: str,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Get reservation by ID"""
    reservation = await database.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Check permission
    if current_user['role'] == UserRole.EMPLOYEE and reservation['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Convert dates
    if isinstance(reservation.get('created_at'), str):
        reservation['created_at'] = datetime.fromisoformat(reservation['created_at'])
    if isinstance(reservation.get('updated_at'), str):
        reservation['updated_at'] = datetime.fromisoformat(reservation['updated_at'])
    if isinstance(reservation.get('check_in_date'), str):
        reservation['check_in_date'] = date.fromisoformat(reservation['check_in_date'])
    if isinstance(reservation.get('check_out_date'), str):
        reservation['check_out_date'] = date.fromisoformat(reservation['check_out_date'])
    if isinstance(reservation.get('approved_at'), str):
        reservation['approved_at'] = datetime.fromisoformat(reservation['approved_at'])
    if isinstance(reservation.get('cancelled_at'), str):
        reservation['cancelled_at'] = datetime.fromisoformat(reservation['cancelled_at'])
    
    # Enrich with user and company information
    user = await database.users.find_one({"id": reservation['user_id']}, {"_id": 0})
    if user:
        reservation['user_name'] = user.get('full_name')
        reservation['user_email'] = user.get('email')
    
    if reservation.get('company_id'):
        company = await database.companies.find_one({"id": reservation['company_id']}, {"_id": 0})
        if company:
            reservation['company_name'] = company.get('name')
    
    return ReservationResponse(**reservation)


@api_router.put("/reservations/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: str,
    updates: ReservationUpdate,
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Update reservation status (approve, reject, cancel)"""
    reservation = await database.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    update_data = updates.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.utcnow().isoformat()
    
    # Handle status changes
    if updates.status == ReservationStatus.APPROVED:
        if current_user['role'] not in [UserRole.ADMIN, UserRole.MANAGER]:
            raise HTTPException(status_code=403, detail="Only managers and admins can approve reservations")
        update_data['approved_by'] = current_user['id']
        update_data['approved_at'] = datetime.utcnow().isoformat()
        update_data['status'] = ReservationStatus.CONFIRMED
    
    elif updates.status == ReservationStatus.REJECTED:
        if current_user['role'] not in [UserRole.ADMIN, UserRole.MANAGER]:
            raise HTTPException(status_code=403, detail="Only managers and admins can reject reservations")
    
    elif updates.status == ReservationStatus.CANCELLED:
        update_data['cancelled_at'] = datetime.utcnow().isoformat()
    
    await database.reservations.update_one(
        {"id": reservation_id},
        {"$set": update_data}
    )
    
    return await get_reservation(reservation_id, current_user, database)


# ==================== DASHBOARD ENDPOINTS ====================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user_dep),
    database = Depends(get_db)
):
    """Get dashboard statistics based on user role"""
    query = {}
    
    # Filter based on role
    if current_user['role'] == UserRole.EMPLOYEE:
        query['user_id'] = current_user['id']
    elif current_user['role'] == UserRole.MANAGER:
        query['company_id'] = current_user['company_id']
    # Admin sees all
    
    # Get counts
    total_reservations = await database.reservations.count_documents(query)
    
    pending_query = {**query, 'status': ReservationStatus.PENDING}
    pending_approvals = await database.reservations.count_documents(pending_query)
    
    confirmed_query = {**query, 'status': ReservationStatus.CONFIRMED}
    confirmed_reservations = await database.reservations.count_documents(confirmed_query)
    
    cancelled_query = {**query, 'status': ReservationStatus.CANCELLED}
    cancelled_reservations = await database.reservations.count_documents(cancelled_query)
    
    # Calculate total spent
    reservations = await database.reservations.find(query, {"_id": 0}).to_list(10000)
    total_spent = sum(
        res.get('grand_total', 0)
        for res in reservations
        if res.get('status') in [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED]
    )
    
    return DashboardStats(
        total_reservations=total_reservations,
        pending_approvals=pending_approvals,
        confirmed_reservations=confirmed_reservations,
        cancelled_reservations=cancelled_reservations,
        total_spent=total_spent
    )


# ==================== USER MANAGEMENT ENDPOINTS ====================

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(
    current_user: dict = Depends(require_manager_or_admin),
    database = Depends(get_db)
):
    """Get all users (Admin and Manager only)"""
    query = {}
    if current_user['role'] == UserRole.MANAGER:
        query['company_id'] = current_user['company_id']
    
    users = await database.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**user) for user in users]


# ==================== ROOT ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {
        "message": "Corporate Reservation System API",
        "version": "1.0.0",
        "status": "operational"
    }


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")


# Include router in main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting Corporate Reservation System API...")
    
    # Initialize mock hotel data
    await init_mock_hotels(db)
    
    logger.info("Application started successfully")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    client.close()
    logger.info("Application shutdown complete")
