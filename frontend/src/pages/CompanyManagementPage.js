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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
    hotel: { type: 'fixed', value: 50, additional_fee: 0, currency: 'TRY' },
    flight: { type: 'fixed', value: 75, additional_fee: 0, currency: 'TRY' },
    transfer: { type: 'fixed', value: 25, additional_fee: 0, currency: 'TRY' },
    visa: { type: 'fixed', value: 100, additional_fee: 0, currency: 'TRY' },
    insurance: { type: 'fixed', value: 30, additional_fee: 0, currency: 'TRY' },
    car_rental: { type: 'fixed', value: 40, additional_fee: 0, currency: 'TRY' }
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
      hotel: { type: 'fixed', value: 50, additional_fee: 0, currency: 'TRY' },
      flight: { type: 'fixed', value: 75, additional_fee: 0, currency: 'TRY' },
      transfer: { type: 'fixed', value: 25, additional_fee: 0, currency: 'TRY' },
      visa: { type: 'fixed', value: 100, additional_fee: 0, currency: 'TRY' },
      insurance: { type: 'fixed', value: 30, additional_fee: 0, currency: 'TRY' },
      car_rental: { type: 'fixed', value: 40, additional_fee: 0, currency: 'TRY' }
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
                <CardDescription>Her servis için uygulanacak ücretleri belirleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hotel Fees */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Otel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotel_type">Ücret Tipi</Label>
                      <Select
                        value={serviceFees.hotel.type}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          hotel: { ...serviceFees.hotel, type: value }
                        })}
                      >
                        <SelectTrigger data-testid="hotel-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Sabit Tutar</SelectItem>
                          <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel_currency">Döviz</Label>
                      <Select
                        value={serviceFees.hotel.currency}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          hotel: { ...serviceFees.hotel, currency: value }
                        })}
                      >
                        <SelectTrigger data-testid="hotel-currency-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">₺ TRY (Türk Lirası)</SelectItem>
                          <SelectItem value="USD">$ USD (Dolar)</SelectItem>
                          <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">£ GBP (Sterlin)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel_value">
                        {serviceFees.hotel.type === 'percentage' ? 'Yüzde (%)' : `Tutar (${serviceFees.hotel.currency})`}
                      </Label>
                      <Input
                        id="hotel_value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.hotel.value}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          hotel: { ...serviceFees.hotel, value: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="hotel-value-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel_additional">Ek Özel Ücret ({serviceFees.hotel.currency})</Label>
                      <Input
                        id="hotel_additional"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.hotel.additional_fee}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          hotel: { ...serviceFees.hotel, additional_fee: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="hotel-additional-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Flight Fees */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Uçuş</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flight_type">Ücret Tipi</Label>
                      <Select
                        value={serviceFees.flight.type}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          flight: { ...serviceFees.flight, type: value }
                        })}
                      >
                        <SelectTrigger data-testid="flight-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                          <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flight_currency">Döviz</Label>
                      <Select
                        value={serviceFees.flight.currency}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          flight: { ...serviceFees.flight, currency: value }
                        })}
                      >
                        <SelectTrigger data-testid="flight-currency-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">₺ TRY</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                          <SelectItem value="GBP">£ GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flight_value">
                        {serviceFees.flight.type === 'percentage' ? 'Yüzde (%)' : `Tutar (${serviceFees.flight.currency})`}
                      </Label>
                      <Input
                        id="flight_value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.flight.value}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          flight: { ...serviceFees.flight, value: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="flight-value-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flight_additional">Ek Özel Ücret ({serviceFees.flight.currency})</Label>
                      <Input
                        id="flight_additional"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.flight.additional_fee}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          flight: { ...serviceFees.flight, additional_fee: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="flight-additional-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Transfer Fees */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Transfer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transfer_type">Ücret Tipi</Label>
                      <Select
                        value={serviceFees.transfer.type}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          transfer: { ...serviceFees.transfer, type: value }
                        })}
                      >
                        <SelectTrigger data-testid="transfer-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                          <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer_currency">Döviz</Label>
                      <Select
                        value={serviceFees.transfer.currency}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          transfer: { ...serviceFees.transfer, currency: value }
                        })}
                      >
                        <SelectTrigger data-testid="transfer-currency-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">₺ TRY</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                          <SelectItem value="GBP">£ GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer_value">
                        {serviceFees.transfer.type === 'percentage' ? 'Yüzde (%)' : `Tutar (${serviceFees.transfer.currency})`}
                      </Label>
                      <Input
                        id="transfer_value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.transfer.value}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          transfer: { ...serviceFees.transfer, value: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="transfer-value-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer_additional">Ek Özel Ücret ({serviceFees.transfer.currency})</Label>
                      <Input
                        id="transfer_additional"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.transfer.additional_fee}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          transfer: { ...serviceFees.transfer, additional_fee: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="transfer-additional-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Visa Fees */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Vize</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visa_type">Ücret Tipi</Label>
                      <Select
                        value={serviceFees.visa.type}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          visa: { ...serviceFees.visa, type: value }
                        })}
                      >
                        <SelectTrigger data-testid="visa-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                          <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visa_value">
                        {serviceFees.visa.type === 'percentage' ? 'Yüzde (%)' : 'Tutar (₺)'}
                      </Label>
                      <Input
                        id="visa_value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.visa.value}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          visa: { ...serviceFees.visa, value: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="visa-value-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visa_additional">Ek Özel Ücret (₺)</Label>
                      <Input
                        id="visa_additional"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.visa.additional_fee}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          visa: { ...serviceFees.visa, additional_fee: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="visa-additional-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Fees */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Sigorta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_type">Ücret Tipi</Label>
                      <Select
                        value={serviceFees.insurance.type}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          insurance: { ...serviceFees.insurance, type: value }
                        })}
                      >
                        <SelectTrigger data-testid="insurance-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                          <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance_value">
                        {serviceFees.insurance.type === 'percentage' ? 'Yüzde (%)' : 'Tutar (₺)'}
                      </Label>
                      <Input
                        id="insurance_value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.insurance.value}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          insurance: { ...serviceFees.insurance, value: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="insurance-value-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance_additional">Ek Özel Ücret (₺)</Label>
                      <Input
                        id="insurance_additional"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.insurance.additional_fee}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          insurance: { ...serviceFees.insurance, additional_fee: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="insurance-additional-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Car Rental Fees */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Araç Kiralama</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="car_rental_type">Ücret Tipi</Label>
                      <Select
                        value={serviceFees.car_rental.type}
                        onValueChange={(value) => setServiceFees({ 
                          ...serviceFees, 
                          car_rental: { ...serviceFees.car_rental, type: value }
                        })}
                      >
                        <SelectTrigger data-testid="car-rental-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                          <SelectItem value="percentage">Yüzde (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="car_rental_value">
                        {serviceFees.car_rental.type === 'percentage' ? 'Yüzde (%)' : 'Tutar (₺)'}
                      </Label>
                      <Input
                        id="car_rental_value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.car_rental.value}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          car_rental: { ...serviceFees.car_rental, value: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="car-rental-value-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="car_rental_additional">Ek Özel Ücret (₺)</Label>
                      <Input
                        id="car_rental_additional"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFees.car_rental.additional_fee}
                        onChange={(e) => setServiceFees({ 
                          ...serviceFees, 
                          car_rental: { ...serviceFees.car_rental, additional_fee: parseFloat(e.target.value) || 0 }
                        })}
                        data-testid="car-rental-additional-input"
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Not:</strong> Yüzde seçeneğinde, hizmet tutarının belirtilen yüzdesi + ek özel ücret uygulanır. 
                    Sabit tutar seçeneğinde ise belirtilen tutar + ek özel ücret uygulanır.
                  </AlertDescription>
                </Alert>
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