from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    AGENCY_ADMIN = "agency_admin"
    AGENCY_STAFF = "agency_staff"


class ReservationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class ServiceType(str, Enum):
    HOTEL = "hotel"
    FLIGHT = "flight"
    TRANSFER = "transfer"
    VISA = "visa"
    INSURANCE = "insurance"
    CAR_RENTAL = "car_rental"


# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.EMPLOYEE
    company_id: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    passport_number: Optional[str] = None
    id_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    passport_expiry: Optional[date] = None
    airline_preference: Optional[str] = None
    gdpr_accepted: Optional[bool] = None
    gdpr_accepted_date: Optional[datetime] = None


class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    password_hash: str
    is_first_login: bool = True
    gdpr_accepted: bool = False
    gdpr_accepted_date: Optional[datetime] = None
    passport_number: Optional[str] = None
    id_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    passport_expiry: Optional[date] = None
    airline_preference: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_first_login: bool
    gdpr_accepted: bool


# Company Models
class ServiceFeeType(str, Enum):
    FIXED = "fixed"  # Sabit tutar
    PERCENTAGE = "percentage"  # Yüzdesel


class Currency(str, Enum):
    TRY = "TRY"  # Türk Lirası
    USD = "USD"  # Amerikan Doları
    EUR = "EUR"  # Euro
    GBP = "GBP"  # İngiliz Sterlini


class ServiceFeeItem(BaseModel):
    type: ServiceFeeType = ServiceFeeType.FIXED
    value: float = 0.0
    additional_fee: float = 0.0  # Ekstra özel servis bedeli
    currency: Currency = Currency.TRY  # Döviz cinsi


class ServiceFee(BaseModel):
    hotel: ServiceFeeItem = Field(default_factory=ServiceFeeItem)
    flight: ServiceFeeItem = Field(default_factory=ServiceFeeItem)
    transfer: ServiceFeeItem = Field(default_factory=ServiceFeeItem)
    visa: ServiceFeeItem = Field(default_factory=ServiceFeeItem)
    insurance: ServiceFeeItem = Field(default_factory=ServiceFeeItem)
    car_rental: ServiceFeeItem = Field(default_factory=ServiceFeeItem)


class BookingRules(BaseModel):
    hotel_max_stars: int = 5
    hotel_max_price_per_night: Optional[float] = None
    requires_manager_approval: bool = True
    economy_booking_days_before: int = 0
    business_booking_days_before: Optional[int] = None


class CompanyBase(BaseModel):
    name: str
    tax_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class CompanyCreate(CompanyBase):
    service_fees: Optional[ServiceFee] = Field(default_factory=ServiceFee)
    booking_rules: Optional[BookingRules] = Field(default_factory=BookingRules)


class Company(CompanyBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    service_fees: ServiceFee = Field(default_factory=ServiceFee)
    booking_rules: BookingRules = Field(default_factory=BookingRules)
    is_active: bool = True


# Hotel Models
class HotelAmenity(BaseModel):
    name: str
    icon: Optional[str] = None


class RoomType(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    capacity: int
    price_per_night: float
    available_rooms: int = 10


class Hotel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    city: str
    district: Optional[str] = None
    address: str
    stars: int = Field(ge=1, le=5)
    description: Optional[str] = None
    amenities: List[HotelAmenity] = []
    room_types: List[RoomType] = []
    images: List[str] = []
    tripadvisor_rating: Optional[float] = None
    tripadvisor_reviews: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    cancellation_policy: str = "Ücretsiz iptal: Giriş tarihinden 48 saat öncesine kadar"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HotelSearchRequest(BaseModel):
    city: Optional[str] = None
    check_in_date: date
    check_out_date: date
    guests: int = 1
    min_stars: Optional[int] = None
    max_stars: Optional[int] = None
    max_price: Optional[float] = None


# Reservation Models
class ReservationBase(BaseModel):
    service_type: ServiceType
    user_id: str
    company_id: str


class HotelReservationCreate(ReservationBase):
    hotel_id: str
    room_type_id: str
    check_in_date: date
    check_out_date: date
    guests: int
    special_requests: Optional[str] = None


class Reservation(ReservationBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: ReservationStatus = ReservationStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Hotel specific fields
    hotel_id: Optional[str] = None
    hotel_name: Optional[str] = None
    room_type_id: Optional[str] = None
    room_type_name: Optional[str] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    guests: Optional[int] = None
    nights: Optional[int] = None
    price_per_night: Optional[float] = None
    total_price: Optional[float] = None
    service_fee: Optional[float] = None
    grand_total: Optional[float] = None
    special_requests: Optional[str] = None
    
    # Approval workflow
    requires_approval: bool = False
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Cancellation
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None


class ReservationUpdate(BaseModel):
    status: Optional[ReservationStatus] = None
    rejection_reason: Optional[str] = None
    cancellation_reason: Optional[str] = None


class ReservationResponse(Reservation):
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    company_name: Optional[str] = None


# Dashboard Models
class DashboardStats(BaseModel):
    total_reservations: int = 0
    pending_approvals: int = 0
    confirmed_reservations: int = 0
    cancelled_reservations: int = 0
    total_spent: float = 0.0
    monthly_budget: Optional[float] = None
    budget_used_percentage: Optional[float] = None


# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
