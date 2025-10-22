# Kurumsal Rezervasyon Motoru - Faz 1 (MVP)

## 🎯 Proje Özeti

Bu proje, seyahat acentaları için kurumsal müşterilerinin rezervasyonlarını yönetmek amacıyla geliştirilmiş kapsamlı bir B2B rezervasyon sistemidir.

**Faz 1 Kapsamı:** Otel rezervasyon sistemi ile MVP tamamlandı.

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler (Faz 1)

#### 1. Kimlik Doğrulama ve Kullanıcı Yönetimi
- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Üç kullanıcı rolü: Admin, Manager, Employee
- ✅ GDPR/KVKK onay mekanizması
- ✅ Kullanıcı profil yönetimi

#### 2. Şirket Yönetimi
- ✅ Şirket oluşturma ve yapılandırma
- ✅ Servis ücretleri tanımlama
- ✅ Rezervasyon kuralları ve limitleri
- ✅ Departman yönetimi

#### 3. Otel Rezervasyon Sistemi ⭐
- ✅ Gelişmiş otel arama (şehir, tarih, misafir sayısı)
- ✅ Otel listesi ve filtreleme
- ✅ Detaylı otel bilgileri
- ✅ Oda tipi seçimi ve fiyatlandırma
- ✅ Rezervasyon oluşturma
- ✅ Manager onay iş akışı
- ✅ Rezervasyon durumları (Pending, Approved, Rejected, Confirmed, Cancelled)
- ✅ İptal ve değişiklik işlemleri
- ✅ Mock TripAdvisor puanları

#### 4. Dashboard ve Raporlama
- ✅ Rol bazlı dashboard
- ✅ İstatistikler ve özet kartlar
- ✅ Rezervasyon durumu takibi
- ✅ Harcama özeti

#### 5. Mock Data
- ✅ 10 Türkiye oteli (İstanbul, Ankara, İzmir, Antalya, Bodrum, Erzurum)
- ✅ Gerçekçi otel bilgileri ve fiyatlandırma
- ✅ Oda tipleri ve olanaklar

## 🛠️ Teknoloji Stack'i

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB (Motor - Async driver)
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt (passlib)
- **Validation:** Pydantic v2

### Frontend
- **Framework:** React 19
- **Routing:** React Router v7
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Form Handling:** React Hook Form + Zod

## 📁 Proje Yapısı

```
/app/
├── backend/
│   ├── server.py              # Ana FastAPI uygulaması
│   ├── models.py              # Pydantic modelleri
│   ├── auth.py                # Kimlik doğrulama
│   ├── mock_data.py           # Mock otel verileri
│   ├── init_test_data.py      # Test verisi oluşturma script'i
│   ├── requirements.txt       # Python bağımlılıkları
│   └── .env                   # Çevre değişkenleri
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # Sayfa componentleri
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── GDPRConsent.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── HotelsPage.js
│   │   │   ├── HotelDetailPage.js
│   │   │   ├── ReservationsPage.js
│   │   │   └── ApprovalsPage.js
│   │   ├── components/       # Yeniden kullanılabilir componentler
│   │   │   ├── Layout.js
│   │   │   └── ui/           # Radix UI componentleri
│   │   ├── context/          # React Context
│   │   │   └── AuthContext.js
│   │   ├── api/              # API çağrıları
│   │   │   └── api.js
│   │   └── App.js            # Ana uygulama
│   ├── package.json
│   └── .env                  # Frontend çevre değişkenleri
│
└── PROJECT_README.md         # Bu dosya
```

## 🔑 Test Kullanıcıları

Sistemde 3 adet test kullanıcısı oluşturulmuştur:

### Admin
- **Email:** admin@abc-tech.com
- **Şifre:** admin123
- **Yetkileri:** Tüm sistem yetkisi, şirket yönetimi, tüm rezervasyonları görme

### Manager
- **Email:** manager@abc-tech.com
- **Şifre:** manager123
- **Yetkileri:** Rezervasyon onaylama/reddetme, şirket rezervasyonlarını görme

### Employee
- **Email:** employee@abc-tech.com
- **Şifre:** employee123
- **Yetkileri:** Rezervasyon oluşturma, kendi rezervasyonlarını görme

**Şirket:** ABC Teknoloji A.Ş.

## 🚀 Sistem Başlatma

### Backend
```bash
cd /app/backend
sudo supervisorctl restart backend
```

### Frontend
```bash
cd /app/frontend
sudo supervisorctl restart frontend
```

### Tüm Servisleri Yeniden Başlatma
```bash
sudo supervisorctl restart all
```

### Servis Durumunu Kontrol Etme
```bash
sudo supervisorctl status
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi
- `PUT /api/auth/me` - Kullanıcı bilgisi güncelleme
- `POST /api/auth/accept-gdpr` - GDPR onayı

### Companies
- `POST /api/companies` - Şirket oluşturma (Admin)
- `GET /api/companies` - Tüm şirketleri listeleme
- `GET /api/companies/{id}` - Şirket detayı
- `PUT /api/companies/{id}` - Şirket güncelleme (Admin)

### Hotels
- `POST /api/hotels/search` - Otel arama
- `GET /api/hotels/{id}` - Otel detayı

### Reservations
- `POST /api/reservations` - Rezervasyon oluşturma
- `GET /api/reservations` - Rezervasyon listesi (rol bazlı)
- `GET /api/reservations/{id}` - Rezervasyon detayı
- `PUT /api/reservations/{id}` - Rezervasyon güncelleme (onay/red/iptal)

### Dashboard
- `GET /api/dashboard/stats` - Dashboard istatistikleri

### Users
- `GET /api/users` - Kullanıcı listesi (Admin/Manager)

### Health Check
- `GET /api/health` - Sistem sağlık kontrolü

## 🧪 Test Senaryoları

### 1. Kullanıcı Kaydı ve Giriş
1. Kayıt sayfasına git (`/register`)
2. Bilgileri doldur ve kayıt ol
3. GDPR/KVKK politikasını kabul et
4. Dashboard'a yönlendirildiğini kontrol et

### 2. Otel Arama ve Rezervasyon (Employee)
1. Employee olarak giriş yap
2. "Otel Ara" menüsüne git
3. Şehir, tarih ve misafir sayısı gir
4. Arama yap
5. Bir otel seç ve detaylarını görüntüle
6. Oda tipi seç
7. Rezervasyon yap
8. "Rezervasyonlarım" sayfasında göründüğünü kontrol et

### 3. Rezervasyon Onaylama (Manager)
1. Manager olarak giriş yap
2. "Onay Bekleyenler" menüsüne git
3. Bekleyen rezervasyonu görüntüle
4. Onay veya reddet

### 4. Dashboard Görüntüleme
1. Herhangi bir kullanıcı olarak giriş yap
2. Dashboard'da istatistikleri görüntüle
3. Hızlı işlemleri kullan

## 📋 İş Akışları

### Rezervasyon İş Akışı
```
Employee                Manager                 System
   |                       |                       |
   |-- Rezervasyon Oluştur -->                    |
   |                       |                       |
   |                       |<-- Onay Talebi -------|
   |                       |                       |
   |                       |-- Onayla/Reddet -->   |
   |                       |                       |
   |<----- Bildirim -------|<----- Güncelle -------|
   |                       |                       |
```

### Onay Kuralları
- Şirketin `booking_rules.requires_manager_approval` ayarı `true` ise rezervasyon onay bekler
- Manager veya Admin rezervasyonu onaylayabilir/reddedebilir
- Onaylanan rezervasyonlar otomatik olarak "Confirmed" durumuna geçer
- Reddedilen rezervasyonlar için sebep belirtilmesi zorunludur

## 🎨 Kullanıcı Arayüzü

### Tema
- Modern, minimal ve kullanıcı dostu arayüz
- Responsive tasarım (mobil, tablet, desktop)
- Tailwind CSS ile özelleştirilebilir
- Radix UI ile erişilebilir componentler

### Renkler
- **Primary:** Mavi (#3B82F6)
- **Success:** Yeşil (#10B981)
- **Warning:** Turuncu (#F59E0B)
- **Danger:** Kırmızı (#EF4444)

## 🔐 Güvenlik

- JWT tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- CORS koruması
- Role-based access control (RBAC)
- GDPR/KVKK uyumlu veri işleme

## 📈 Sonraki Fazlar

### Faz 2: Vize İşlemleri
- Vize başvuru sistemi
- Doküman yönetimi
- Randevu takibi
- Vize durumu takibi

### Faz 3: Transfer Hizmetleri
- Transfer rezervasyonu
- Araç seçimi
- Rota planlama

### Faz 4: Uçuş Rezervasyonları
- NDC entegrasyonu
- Uçuş arama ve rezervasyon
- Otomatik yeniden fiyatlandırma
- Bilet yönetimi

### Faz 5: Sigorta
- Seyahat sağlık sigortası
- Sigorta poliçesi yönetimi

### Faz 6: B2C Modülü
- Bireysel müşteriler için portal
- Ödeme entegrasyonu
- E-fatura

### Faz 7: Entegrasyonlar
- ArkmanNext Bilet (uçuş faturaları)
- ArkmanNext Coper (diğer servisler)
- E-fatura sistemi
- Ön muhasebe entegrasyonu
- Gerçek otel API'leri

## 🐛 Bilinen Sınırlamalar

1. **Mock Data:** Şu anda tüm otel verileri mock (sahte) verilerdir
2. **Ödeme:** Ödeme entegrasyonu henüz yok
3. **Email:** Email bildirimleri mock olarak loglanıyor
4. **Resim Upload:** Kullanıcı doküman yükleme henüz yok
5. **Çoklu Dil:** Sadece Türkçe dil desteği var

## 📞 Destek

Herhangi bir sorun veya soru için:
- Backend logları: `/var/log/supervisor/backend.err.log`
- Frontend logları: `/var/log/supervisor/frontend.err.log`

## 📄 Lisans

Bu proje Emergent AI tarafından geliştirilmiştir.

---

**Son Güncelleme:** 22 Ekim 2025  
**Versiyon:** 1.0.0 (Faz 1 - MVP)  
**Durum:** ✅ Tamamlandı ve Test Edildi
