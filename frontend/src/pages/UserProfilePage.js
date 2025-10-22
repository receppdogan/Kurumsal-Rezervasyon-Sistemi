import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';
import { User, Plane, FileText, Shield } from 'lucide-react';

export default function UserProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });
  const [travelInfo, setTravelInfo] = useState({
    passport_number: user?.passport_number || '',
    id_number: user?.id_number || '',
    date_of_birth: user?.date_of_birth || '',
    passport_expiry: user?.passport_expiry || '',
    airline_preference: user?.airline_preference || ''
  });

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUser(personalInfo);
      if (result.success) {
        toast({ title: "Başarılı", description: "Kişisel bilgiler güncellendi" });
      } else {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTravel = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUser(travelInfo);
      if (result.success) {
        toast({ title: "Başarılı", description: "Seyahat bilgileri güncellendi" });
      } else {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="user-profile-page">
        <div>
          <h1 className="text-3xl font-bold">Profilim</h1>
          <p className="text-gray-600 mt-2">Kişisel bilgilerinizi ve seyahat bilgilerinizi yönetin</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hesap Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm ${
                  user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.is_active ? 'Aktif' : 'Pasif'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">GDPR Onayı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm ${
                user?.gdpr_accepted ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.gdpr_accepted ? 'Onaylandı' : 'Bekliyor'}
              </div>
              {user?.gdpr_accepted_date && (
                <p className="text-xs text-gray-600 mt-2">
                  {new Date(user.gdpr_accepted_date).toLocaleDateString('tr-TR')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="inline-flex px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                {user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Yönetici' : 'Çalışan'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Kişisel Bilgiler
            </TabsTrigger>
            <TabsTrigger value="travel" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Seyahat Bilgileri
            </TabsTrigger>
            <TabsTrigger value="gdpr" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              GDPR/KVKK
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>Temel iletişim bilgilerinizi güncelleyin</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePersonal}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Ad Soyad</Label>
                    <Input
                      id="full_name"
                      value={personalInfo.full_name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })}
                      data-testid="profile-fullname-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">E-posta adresi değiştirilemez</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      placeholder="+90 532 111 22 33"
                      data-testid="profile-phone-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Departman</Label>
                    <Input
                      id="department"
                      value={personalInfo.department}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, department: e.target.value })}
                      placeholder="Yazılım Geliştirme"
                      data-testid="profile-department-input"
                    />
                  </div>

                  <Button type="submit" disabled={loading} data-testid="save-personal-button">
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="travel">
            <Card>
              <CardHeader>
                <CardTitle>Seyahat Bilgileri</CardTitle>
                <CardDescription>Rezervasyonlar için gerekli bilgilerinizi girin</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateTravel}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passport_number">Pasaport Numarası</Label>
                      <Input
                        id="passport_number"
                        value={travelInfo.passport_number}
                        onChange={(e) => setTravelInfo({ ...travelInfo, passport_number: e.target.value })}
                        placeholder="U12345678"
                        data-testid="passport-number-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_number">TC Kimlik No</Label>
                      <Input
                        id="id_number"
                        value={travelInfo.id_number}
                        onChange={(e) => setTravelInfo({ ...travelInfo, id_number: e.target.value })}
                        placeholder="12345678901"
                        maxLength={11}
                        data-testid="id-number-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Doğum Tarihi</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={travelInfo.date_of_birth}
                        onChange={(e) => setTravelInfo({ ...travelInfo, date_of_birth: e.target.value })}
                        data-testid="birthdate-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passport_expiry">Pasaport Son Geçerlilik</Label>
                      <Input
                        id="passport_expiry"
                        type="date"
                        value={travelInfo.passport_expiry}
                        onChange={(e) => setTravelInfo({ ...travelInfo, passport_expiry: e.target.value })}
                        data-testid="passport-expiry-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airline_preference">Tercih Edilen Havayolu</Label>
                    <Input
                      id="airline_preference"
                      value={travelInfo.airline_preference}
                      onChange={(e) => setTravelInfo({ ...travelInfo, airline_preference: e.target.value })}
                      placeholder="Turkish Airlines, Pegasus, vb."
                      data-testid="airline-preference-input"
                    />
                  </div>

                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Not:</strong> Bu bilgiler rezervasyon süreçlerinde kullanılacaktır. Doğruluğundan emin olun.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" disabled={loading} data-testid="save-travel-button">
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="gdpr">
            <Card>
              <CardHeader>
                <CardTitle>GDPR/KVKK Bilgilendirme</CardTitle>
                <CardDescription>Kişisel verilerinizin işlenmesi hakkında</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Onay Durumunuz</h3>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      user?.gdpr_accepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.gdpr_accepted ? '✓ Onaylandı' : 'Onay Bekliyor'}
                    </div>
                    {user?.gdpr_accepted_date && (
                      <span className="text-sm text-gray-600">
                        {new Date(user.gdpr_accepted_date).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Toplanan Kişisel Veriler</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Kimlik bilgileri (ad, soyad, TC kimlik no)</li>
                    <li>İletişim bilgileri (e-posta, telefon)</li>
                    <li>Seyahat belgeleri (pasaport bilgileri)</li>
                    <li>Rezervasyon ve seyahat bilgileri</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Haklarınız</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Kişisel verilerinize erişim hakkı</li>
                    <li>Verilerin düzeltilmesini isteme hakkı</li>
                    <li>Verilerin silinmesini isteme hakkı</li>
                    <li>İşleme faaliyetine itiraz etme hakkı</li>
                  </ul>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Kişisel verileriniz KVKK ve GDPR kapsamında güvenli şekilde işlenmektedir.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
