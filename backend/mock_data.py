"""Mock data for Turkish hotels"""
import uuid

TURKISH_HOTELS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Swissotel The Bosphorus",
        "city": "İstanbul",
        "district": "Beşiktaş",
        "address": "Bayıldım Cad. No:2, 34357 Beşiktaş",
        "stars": 5,
        "description": "Boğaz manzaralı lüks otel, muhteşem spa ve açık havuz imkanları ile.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Spa & Wellness", "icon": "spa"},
            {"name": "Açık Havuz", "icon": "pool"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Restoran", "icon": "restaurant"},
            {"name": "Otopark", "icon": "parking"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Deluxe Room",
                "description": "30 m² oda, şehir veya park manzaralı",
                "capacity": 2,
                "price_per_night": 3500.0,
                "available_rooms": 10
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Bosphorus View Room",
                "description": "35 m² oda, Boğaz manzaralı",
                "capacity": 2,
                "price_per_night": 4500.0,
                "available_rooms": 8
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Executive Suite",
                "description": "65 m² süit, Boğaz manzaralı, oturma alanı",
                "capacity": 3,
                "price_per_night": 7500.0,
                "available_rooms": 5
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
        ],
        "tripadvisor_rating": 4.5,
        "tripadvisor_reviews": 3245,
        "latitude": 41.0426,
        "longitude": 29.0041,
        "phone": "+90 212 326 1100",
        "email": "istanbul@swissotel.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 48 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Four Seasons Sultanahmet",
        "city": "İstanbul",
        "district": "Sultanahmet",
        "address": "Tevkifhane Sok. No:1, Sultanahmet, 34110",
        "stars": 5,
        "description": "Tarihi bir hapishane binasından dönüştürülmüş benzersiz butik otel.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Spa & Wellness", "icon": "spa"},
            {"name": "Restoran", "icon": "restaurant"},
            {"name": "Concierge", "icon": "concierge"},
            {"name": "Oda Servisi", "icon": "room_service"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Deluxe Room",
                "description": "35 m² oda, avlu manzaralı",
                "capacity": 2,
                "price_per_night": 4200.0,
                "available_rooms": 12
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Premium Room",
                "description": "40 m² oda, Ayasofya manzaralı",
                "capacity": 2,
                "price_per_night": 5500.0,
                "available_rooms": 6
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
        ],
        "tripadvisor_rating": 4.8,
        "tripadvisor_reviews": 2890,
        "latitude": 41.0082,
        "longitude": 28.9784,
        "phone": "+90 212 638 8200",
        "email": "sultanahmet@fourseasons.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 72 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Hilton Istanbul Bosphorus",
        "city": "İstanbul",
        "district": "Harbiye",
        "address": "Cumhuriyet Cad. 50, Harbiye, 34367",
        "stars": 5,
        "description": "Boğaz manzaralı, geniş bahçeli lüks otel.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Açık Havuz", "icon": "pool"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Restoran", "icon": "restaurant"},
            {"name": "Bar", "icon": "bar"},
            {"name": "Otopark", "icon": "parking"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Guest Room",
                "description": "28 m² oda, şehir manzaralı",
                "capacity": 2,
                "price_per_night": 2800.0,
                "available_rooms": 15
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Bosphorus Room",
                "description": "32 m² oda, Boğaz manzaralı",
                "capacity": 2,
                "price_per_night": 3800.0,
                "available_rooms": 10
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"
        ],
        "tripadvisor_rating": 4.3,
        "tripadvisor_reviews": 4120,
        "latitude": 41.0461,
        "longitude": 28.9948,
        "phone": "+90 212 315 6000",
        "email": "istanbul@hilton.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 24 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Ramada by Wyndham Ankara",
        "city": "Ankara",
        "district": "Çankaya",
        "address": "İran Cad. No:23, Kavaklıdere, 06700",
        "stars": 4,
        "description": "Şehir merkezinde konforlu iş oteli.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Restoran", "icon": "restaurant"},
            {"name": "Otopark", "icon": "parking"},
            {"name": "Toplantı Odaları", "icon": "meeting"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Standard Room",
                "description": "25 m² oda, şehir manzaralı",
                "capacity": 2,
                "price_per_night": 1500.0,
                "available_rooms": 20
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Deluxe Room",
                "description": "30 m² oda, geniş yatak",
                "capacity": 2,
                "price_per_night": 1900.0,
                "available_rooms": 12
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
        ],
        "tripadvisor_rating": 4.0,
        "tripadvisor_reviews": 1240,
        "latitude": 39.9180,
        "longitude": 32.8540,
        "phone": "+90 312 428 0808",
        "email": "ankara@ramada.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 24 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Rixos Downtown Antalya",
        "city": "Antalya",
        "district": "Merkez",
        "address": "Sakıp Sabancı Bulvarı, 07050",
        "stars": 5,
        "description": "Deniz manzaralı ultra her şey dahil lüks otel.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Her Şey Dahil", "icon": "all_inclusive"},
            {"name": "Spa & Wellness", "icon": "spa"},
            {"name": "Açık Havuz", "icon": "pool"},
            {"name": "Plaj", "icon": "beach"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Çocuk Kulübü", "icon": "kids_club"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Deluxe Room",
                "description": "40 m² oda, deniz manzaralı",
                "capacity": 2,
                "price_per_night": 3200.0,
                "available_rooms": 18
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Family Suite",
                "description": "60 m² süit, 2 yatak odası",
                "capacity": 4,
                "price_per_night": 5500.0,
                "available_rooms": 8
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
        ],
        "tripadvisor_rating": 4.6,
        "tripadvisor_reviews": 5670,
        "latitude": 36.8969,
        "longitude": 30.7133,
        "phone": "+90 242 249 0700",
        "email": "antalya@rixos.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 7 gün öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Swissotel Büyük Efes İzmir",
        "city": "İzmir",
        "district": "Konak",
        "address": "Gaziosmanpaşa Bulvarı No:1, 35210",
        "stars": 5,
        "description": "Körfez manzaralı şehir merkezi otel.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Spa & Wellness", "icon": "spa"},
            {"name": "Açık Havuz", "icon": "pool"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Restoran", "icon": "restaurant"},
            {"name": "Otopark", "icon": "parking"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Swiss Advantage Room",
                "description": "32 m² oda, şehir manzaralı",
                "capacity": 2,
                "price_per_night": 2200.0,
                "available_rooms": 14
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Bay View Room",
                "description": "35 m² oda, körfez manzaralı",
                "capacity": 2,
                "price_per_night": 2800.0,
                "available_rooms": 10
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
        ],
        "tripadvisor_rating": 4.4,
        "tripadvisor_reviews": 2340,
        "latitude": 38.4192,
        "longitude": 27.1287,
        "phone": "+90 232 414 0000",
        "email": "izmir@swissotel.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 48 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "The Marmara Bodrum",
        "city": "Bodrum",
        "district": "Merkez",
        "address": "Yokuşbaşı Mah. Suluhasan Cad. No:18, 48400",
        "stars": 5,
        "description": "Ege denizi manzaralı butik lüks otel.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Spa & Wellness", "icon": "spa"},
            {"name": "Açık Havuz", "icon": "pool"},
            {"name": "Özel Plaj", "icon": "beach"},
            {"name": "Restoran", "icon": "restaurant"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Deluxe Room",
                "description": "35 m² oda, bahçe manzaralı",
                "capacity": 2,
                "price_per_night": 2600.0,
                "available_rooms": 12
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Sea View Room",
                "description": "40 m² oda, deniz manzaralı",
                "capacity": 2,
                "price_per_night": 3400.0,
                "available_rooms": 8
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800"
        ],
        "tripadvisor_rating": 4.5,
        "tripadvisor_reviews": 1890,
        "latitude": 37.0352,
        "longitude": 27.4305,
        "phone": "+90 252 313 8130",
        "email": "bodrum@themarmarahotels.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 72 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Dedeman Palandöken",
        "city": "Erzurum",
        "district": "Palandöken",
        "address": "Palandöken Kayak Merkezi, 25070",
        "stars": 4,
        "description": "Kayak merkezinde dağ evi atmosferi.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Kayak", "icon": "ski"},
            {"name": "Spa & Wellness", "icon": "spa"},
            {"name": "Kapalı Havuz", "icon": "pool"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Restoran", "icon": "restaurant"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Standard Room",
                "description": "28 m² oda, dağ manzaralı",
                "capacity": 2,
                "price_per_night": 1800.0,
                "available_rooms": 20
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Deluxe Room",
                "description": "35 m² oda, pist manzaralı",
                "capacity": 2,
                "price_per_night": 2400.0,
                "available_rooms": 12
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1605346434674-a440ca4dc4c0?w=800"
        ],
        "tripadvisor_rating": 4.2,
        "tripadvisor_reviews": 980,
        "latitude": 39.9043,
        "longitude": 41.2678,
        "phone": "+90 442 317 2414",
        "email": "palandoken@dedeman.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 48 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Divan Suites Istanbul",
        "city": "İstanbul",
        "district": "Şişli",
        "address": "Askerocağı Cad. No:26, Elmadağ, 34367",
        "stars": 4,
        "description": "Taksim'e yakın modern iş oteli.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Restoran", "icon": "restaurant"},
            {"name": "Otopark", "icon": "parking"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Studio Suite",
                "description": "30 m² oda, mutfak köşesi",
                "capacity": 2,
                "price_per_night": 2100.0,
                "available_rooms": 15
            },
            {
                "id": str(uuid.uuid4()),
                "name": "One Bedroom Suite",
                "description": "45 m² süit, ayrı yatak odası",
                "capacity": 3,
                "price_per_night": 3200.0,
                "available_rooms": 8
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"
        ],
        "tripadvisor_rating": 4.1,
        "tripadvisor_reviews": 1560,
        "latitude": 41.0434,
        "longitude": 28.9869,
        "phone": "+90 212 315 5500",
        "email": "sisli@divan.com.tr",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 24 saat öncesine kadar",
        "is_active": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Renaissance Izmir Hotel",
        "city": "İzmir",
        "district": "Çankaya",
        "address": "Şehit Fethi Bey Cad. No:128, 35210",
        "stars": 4,
        "description": "Modern şehir oteli, iş ve tatil için ideal.",
        "amenities": [
            {"name": "Ücretsiz WiFi", "icon": "wifi"},
            {"name": "Açık Havuz", "icon": "pool"},
            {"name": "Fitness Center", "icon": "fitness"},
            {"name": "Restoran", "icon": "restaurant"},
            {"name": "Bar", "icon": "bar"},
        ],
        "room_types": [
            {
                "id": str(uuid.uuid4()),
                "name": "Deluxe Room",
                "description": "30 m² oda, şehir manzaralı",
                "capacity": 2,
                "price_per_night": 1700.0,
                "available_rooms": 18
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Executive Room",
                "description": "35 m² oda, executive lounge erişimi",
                "capacity": 2,
                "price_per_night": 2200.0,
                "available_rooms": 10
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
        ],
        "tripadvisor_rating": 4.0,
        "tripadvisor_reviews": 1120,
        "latitude": 38.4237,
        "longitude": 27.1428,
        "phone": "+90 232 489 0000",
        "email": "izmir@renaissance.com",
        "cancellation_policy": "Ücretsiz iptal: Giriş tarihinden 24 saat öncesine kadar",
        "is_active": True
    }
]


async def init_mock_hotels(db):
    """Initialize mock hotel data in database"""
    existing_count = await db.hotels.count_documents({})
    if existing_count == 0:
        await db.hotels.insert_many(TURKISH_HOTELS)
        print(f"Inserted {len(TURKISH_HOTELS)} mock hotels into database")
    else:
        print(f"Hotels already exist in database ({existing_count} hotels)")
