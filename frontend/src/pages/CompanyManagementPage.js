import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { companyAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { Building, DollarSign, Settings } from 'lucide-react';

export default function CompanyManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    tax_number: '',
    address: '',
    phone: '',
    email: '',
  });
  const [serviceFees, setServiceFees] = useState({
    hotel: { type: 'fixed', value: 50, additional_fee: 0 },
    flight: { type: 'fixed', value: 75, additional_fee: 0 },
    transfer: { type: 'fixed', value: 25, additional_fee: 0 },
    visa: { type: 'fixed', value: 100, additional_fee: 0 },
    insurance: { type: 'fixed', value: 30, additional_fee: 0 },
    car_rental: { type: 'fixed', value: 40, additional_fee: 0 }
  });
  const [bookingRules, setBookingRules] = useState({
    hotel_max_stars: 5,
    hotel_max_price_per_night: 5000,
    requires_manager_approval: true,
    economy_booking_days_before: 0,
    business_booking_days_before: 7
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchCompanies();
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data);
      if (response.data.length > 0) {
        const company = response.data[0];
        setSelectedCompany(company);
        setFormData({
          name: company.name || '',
          tax_number: company.tax_number || '',
          address: company.address || '',
          phone: company.phone || '',
          email: company.email || ''
        });
        setServiceFees(company.service_fees || serviceFees);
        setBookingRules(company.booking_rules || bookingRules);
      }
    } catch (err) {
      setError('Şirketler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        service_fees: serviceFees,
        booking_rules: bookingRules
      };

      if (selectedCompany) {
        await companyAPI.update(selectedCompany.id, data);
        toast({ title: "Başarılı", description: "Şirket bilgileri güncellendi" });
      } else {
        await companyAPI.create(data);
        toast({ title: "Başarılı", description: "Yeni şirket oluşturuldu" });
      }
      fetchCompanies();
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.detail || 'İşlem başarısız',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', tax_number: '', address: '', phone: '', email: '' });
    setServiceFees({
      hotel: { type: 'fixed', value: 50, additional_fee: 0 },
      flight: { type: 'fixed', value: 75, additional_fee: 0 },
      transfer: { type: 'fixed', value: 25, additional_fee: 0 },
      visa: { type: 'fixed', value: 100, additional_fee: 0 },
      insurance: { type: 'fixed', value: 30, additional_fee: 0 },
      car_rental: { type: 'fixed', value: 40, additional_fee: 0 }
    });
    setBookingRules({ hotel_max_stars: 5, hotel_max_price_per_night: 5000, requires_manager_approval: true, economy_booking_days_before: 0, business_booking_days_before: 7 });
    setSelectedCompany(null);
  };

  if (loading && companies.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="company-management-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Şirket Yönetimi</h1>
            <p className="text-gray-600 mt-2">Şirket bilgilerini ve ayarlarını yönetin</p>
          </div>
          {selectedCompany && (
            <Button onClick={handleReset} variant="outline" data-testid="new-company-button">
              <Building className="h-4 w-4 mr-2" />
              Yeni Şirket Ekle
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Şirket Bilgileri</TabsTrigger>
            <TabsTrigger value="fees">Servis Ücretleri</TabsTrigger>
            <TabsTrigger value="rules">Rezervasyon Kuralları</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Şirket Bilgileri</CardTitle>
                <CardDescription>
                  {selectedCompany ? 'Mevcut şirket bilgilerini düzenleyin' : 'Yeni şirket bilgilerini girin'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Şirket Adı *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="ABC Teknoloji A.Ş."
                        data-testid="company-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_number">Vergi Numarası</Label>
                      <Input
                        id="tax_number"
                        value={formData.tax_number}
                        onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                        placeholder="1234567890"
                        data-testid="tax-number-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Maslak Mah. Büyükdere Cad. No:123"
                      data-testid="address-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+90 212 123 45 67"
                        data-testid="phone-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="info@abc-tech.com"
                        data-testid="email-input"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Temizle
                  </Button>
                  <Button type="submit" disabled={loading} data-testid="save-company-button">
                    {loading ? 'Kaydediliyor...' : selectedCompany ? 'Güncelle' : 'Şirket Oluştur'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Servis Ücretleri
                </CardTitle>
                <CardDescription>Her servis için uygulanacak ücretleri belirleyin (TL)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee_hotel">Otel</Label>
                    <Input
                      id="fee_hotel"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceFees.hotel}
                      onChange={(e) => setServiceFees({ ...serviceFees, hotel: parseFloat(e.target.value) })}
                      data-testid="fee-hotel-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_flight">Uçuş</Label>
                    <Input
                      id="fee_flight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceFees.flight}
                      onChange={(e) => setServiceFees({ ...serviceFees, flight: parseFloat(e.target.value) })}
                      data-testid="fee-flight-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_transfer">Transfer</Label>
                    <Input
                      id="fee_transfer"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceFees.transfer}
                      onChange={(e) => setServiceFees({ ...serviceFees, transfer: parseFloat(e.target.value) })}
                      data-testid="fee-transfer-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_visa">Vize</Label>
                    <Input
                      id="fee_visa"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceFees.visa}
                      onChange={(e) => setServiceFees({ ...serviceFees, visa: parseFloat(e.target.value) })}
                      data-testid="fee-visa-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_insurance">Sigorta</Label>
                    <Input
                      id="fee_insurance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceFees.insurance}
                      onChange={(e) => setServiceFees({ ...serviceFees, insurance: parseFloat(e.target.value) })}
                      data-testid="fee-insurance-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_car_rental">Araç Kiralama</Label>
                    <Input
                      id="fee_car_rental"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceFees.car_rental}
                      onChange={(e) => setServiceFees({ ...serviceFees, car_rental: parseFloat(e.target.value) })}
                      data-testid="fee-car-rental-input"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} disabled={loading} data-testid="save-fees-button">
                  {loading ? 'Kaydediliyor...' : 'Ücretleri Kaydet'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Rezervasyon Kuralları ve Limitleri
                </CardTitle>
                <CardDescription>Çalışanların rezervasyon yapma kurallarını belirleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Otel Rezervasyon Limitleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_stars">Maksimum Yıldız</Label>
                      <Input
                        id="max_stars"
                        type="number"
                        min="1"
                        max="5"
                        value={bookingRules.hotel_max_stars}
                        onChange={(e) => setBookingRules({ ...bookingRules, hotel_max_stars: parseInt(e.target.value) })}
                        data-testid="max-stars-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_price">Maksimum Gecelik Fiyat (TL)</Label>
                      <Input
                        id="max_price"
                        type="number"
                        min="0"
                        value={bookingRules.hotel_max_price_per_night || ''}
                        onChange={(e) => setBookingRules({ ...bookingRules, hotel_max_price_per_night: parseFloat(e.target.value) || null })}
                        placeholder="Limitsiz için boş bırakın"
                        data-testid="max-price-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Onay Kuralları</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requires_approval"
                      checked={bookingRules.requires_manager_approval}
                      onChange={(e) => setBookingRules({ ...bookingRules, requires_manager_approval: e.target.checked })}
                      className="h-4 w-4"
                      data-testid="requires-approval-checkbox"
                    />
                    <Label htmlFor="requires_approval" className="font-normal">
                      Rezervasyonlar manager onayı gerektirsin
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Uçuş Rezervasyon Kuralları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="economy_days">Economy - Minimum Gün Öncesi</Label>
                      <Input
                        id="economy_days"
                        type="number"
                        min="0"
                        value={bookingRules.economy_booking_days_before}
                        onChange={(e) => setBookingRules({ ...bookingRules, economy_booking_days_before: parseInt(e.target.value) })}
                        data-testid="economy-days-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_days">Business - Minimum Gün Öncesi</Label>
                      <Input
                        id="business_days"
                        type="number"
                        min="0"
                        value={bookingRules.business_booking_days_before || ''}
                        onChange={(e) => setBookingRules({ ...bookingRules, business_booking_days_before: parseInt(e.target.value) || null })}
                        placeholder="Limitsiz için boş bırakın"
                        data-testid="business-days-input"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} disabled={loading} data-testid="save-rules-button">
                  {loading ? 'Kaydediliyor...' : 'Kuralları Kaydet'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {companies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kayıtlı Şirketler</CardTitle>
              <CardDescription>Sistemdeki tüm şirketler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedCompany?.id === company.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedCompany(company);
                      setFormData({
                        name: company.name || '',
                        tax_number: company.tax_number || '',
                        address: company.address || '',
                        phone: company.phone || '',
                        email: company.email || ''
                      });
                      setServiceFees(company.service_fees || serviceFees);
                      setBookingRules(company.booking_rules || bookingRules);
                    }}
                    data-testid={`company-item-${company.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-sm text-gray-600">{company.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        company.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}