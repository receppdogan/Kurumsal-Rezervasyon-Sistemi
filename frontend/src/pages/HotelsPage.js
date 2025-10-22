import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { hotelAPI } from '../api/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Star, MapPin, Wifi, Coffee } from 'lucide-react';

export default function HotelsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    city: '',
    check_in_date: '',
    check_out_date: '',
    guests: 1,
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await hotelAPI.search(searchParams);
      setHotels(response.data);
      setSearched(true);
    } catch (err) {
      setError('Oteller aranırken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const HotelCard = ({ hotel }) => (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`hotel-card-${hotel.id}`}>
      <CardHeader>
        {hotel.images && hotel.images.length > 0 && (
          <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{hotel.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {hotel.city}, {hotel.district}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(hotel.stars)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{hotel.description}</p>
        {hotel.tripadvisor_rating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-600 text-white px-2 py-1 rounded font-semibold text-sm">
              {hotel.tripadvisor_rating.toFixed(1)}
            </div>
            <span className="text-sm text-gray-600">
              {hotel.tripadvisor_reviews} değerlendirme
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
              {amenity.icon === 'wifi' && <Wifi className="h-3 w-3" />}
              {amenity.icon === 'restaurant' && <Coffee className="h-3 w-3" />}
              <span>{amenity.name}</span>
            </div>
          ))}
        </div>
        {hotel.room_types && hotel.room_types.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-2">Başlangıç Fiyatı:</p>
            <p className="text-2xl font-bold text-blue-600">
              ₺{Math.min(...hotel.room_types.map(r => r.price_per_night)).toLocaleString('tr-TR')}
              <span className="text-sm font-normal text-gray-600">/gece</span>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate(`/hotels/${hotel.id}`, { state: { searchParams } })}
          className="w-full"
          data-testid={`view-hotel-button-${hotel.id}`}
        >
          Detayları Gör ve Rezervasyon Yap
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6" data-testid="hotels-page">
        <div>
          <h1 className="text-3xl font-bold">Otel Ara</h1>
          <p className="text-gray-600 mt-2">Size uygun oteli bulun ve rezervasyon yapın</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Arama Kriterleri</CardTitle>
          </CardHeader>
          <form onSubmit={handleSearch}>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    placeholder="Örn: İstanbul"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                    data-testid="search-city-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_in">Giriş Tarihi</Label>
                  <Input
                    id="check_in"
                    type="date"
                    value={searchParams.check_in_date}
                    onChange={(e) => setSearchParams({ ...searchParams, check_in_date: e.target.value })}
                    required
                    data-testid="search-checkin-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out">Çıkış Tarihi</Label>
                  <Input
                    id="check_out"
                    type="date"
                    value={searchParams.check_out_date}
                    onChange={(e) => setSearchParams({ ...searchParams, check_out_date: e.target.value })}
                    required
                    data-testid="search-checkout-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guests">Misafir Sayısı</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
                    required
                    data-testid="search-guests-input"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full" data-testid="search-hotels-button">
                {loading ? 'Aranıyor...' : 'Otel Ara'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {searched && !loading && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {hotels.length} Otel Bulundu
            </h2>
            {hotels.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex justify-center items-center h-32">
                  <p className="text-gray-500">Arama kriterlerinize uygun otel bulunamadı</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}