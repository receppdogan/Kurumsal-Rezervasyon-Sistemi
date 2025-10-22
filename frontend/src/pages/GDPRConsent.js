import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function GDPRConsent() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { acceptGDPR } = useAuth();
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!accepted) {
      setError('Lütfen KVKK/GDPR koşullarını kabul edin');
      return;
    }

    setLoading(true);
    setError('');

    const result = await acceptGDPR();
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl" data-testid="gdpr-consent-card">
        <CardHeader>
          <CardTitle className="text-2xl">KVKK / GDPR Onayı</CardTitle>
          <CardDescription>
            Devam etmek için lütfen kişisel verilerin korunması politikasını okuyun ve kabul edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto space-y-4">
            <h3 className="font-semibold text-lg">Kişisel Verilerin Korunması Politikası</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                Bu metin KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR (Genel Veri Koruma Yönetmeliği) 
                kapsamında kişisel verilerinizin işlenmesi hakkında bilgilendirme amacıyla hazırlanmıştır.
              </p>
              <h4 className="font-semibold text-base text-gray-900">Toplanan Kişisel Veriler</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Kimlik bilgileri (ad, soyad, TC kimlik no)</li>
                <li>İletişim bilgileri (e-posta, telefon)</li>
                <li>Seyahat belgeleri (pasaport bilgileri, vize bilgileri)</li>
                <li>Finansal bilgiler (ödeme ve fatura bilgileri)</li>
                <li>Konum bilgileri (seyahat rotaları)</li>
              </ul>
              <h4 className="font-semibold text-base text-gray-900">Verilerin İşlenme Amacı</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Rezervasyon işlemlerinin gerçekleştirilmesi</li>
                <li>Seyahat hizmetlerinin sunulması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>İletişim ve bilgilendirme</li>
              </ul>
              <h4 className="font-semibold text-base text-gray-900">Haklarınız</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Kişisel verilerinize erişim hakkı</li>
                <li>Verilerin düzeltilmesini isteme hakkı</li>
                <li>Verilerin silinmesini isteme hakkı</li>
                <li>İşleme faaliyetine itiraz etme hakkı</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="gdpr-accept" 
              checked={accepted}
              onCheckedChange={setAccepted}
              data-testid="gdpr-accept-checkbox"
            />
            <label
              htmlFor="gdpr-accept"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              KVKK/GDPR politikasını okudum ve kabul ediyorum
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAccept} 
            disabled={!accepted || loading} 
            className="w-full"
            data-testid="gdpr-accept-button"
          >
            {loading ? 'İşleniyor...' : 'Kabul Et ve Devam Et'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}