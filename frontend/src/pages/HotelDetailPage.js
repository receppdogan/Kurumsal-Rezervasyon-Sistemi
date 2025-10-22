import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { hotelAPI, reservationAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { Star, MapPin, Phone, Mail, Check } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export default function HotelDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [booking, setBooking] = useState(false);
  const [serviceFee, setServiceFee] = useState(0);

  const searchParams = location.state?.searchParams || {};

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      const response = await hotelAPI.getById(id);
      setHotel(response.data);
    } catch (err) {
      setError('Otel bilgileri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!searchParams.check_in_date || !searchParams.check_out_date) return 0;
    const checkIn = new Date(searchParams.check_in_date);
    const checkOut = new Date(searchParams.check_out_date);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const handleBooking = async () => {
    if (!selectedRoom) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir oda tipi seçin",
        variant: "destructive"
      });
      return;
    }

    if (!searchParams.check_in_date || !searchParams.check_out_date) {
      toast({
        title: "Uyarı",
        description: "Giriş ve çıkış tarihleri gerekli",
        variant: "destructive"
      });
      return;
    }

    if (!user?.company_id) {
      toast({
        title: "Uyarı",
        description: "Rezervasyon yapabilmek için bir şirkete bağlı olmalısınız",
        variant: "destructive"
      });
      return;
    }

    setBooking(true);

    try {
      const reservationData = {
        service_type: 'hotel',
        user_id: user.id,
        company_id: user.company_id,
        hotel_id: hotel.id,
        room_type_id: selectedRoom.id,
        check_in_date: searchParams.check_in_date,
        check_out_date: searchParams.check_out_date,
        guests: searchParams.guests || 1,
        special_requests: specialRequests,
      };

      await reservationAPI.create(reservationData);
      
      toast({
        title: "Başarılı!",
        description: "Rezervasyonunuz oluşturuldu. Onay sürecine gönderildi.",
      });

      setTimeout(() => {
        navigate('/reservations');
      }, 1500);
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.detail || 'Rezervasyon oluşturulurken bir hata oluştu',
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !hotel) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Otel bulunamadı'}</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  const nights = calculateNights();

  return (
    <Layout>
      <div className="space-y-6" data-testid="hotel-detail-page">
        <Button 
          variant="outline" 
          onClick={() => navigate('/hotels')}
          data-testid="back-to-hotels-button"
        >
          ← Otellere Dön
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{hotel.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2 text-base">
                      <MapPin className="h-5 w-5" />
                      {hotel.address}, {hotel.city}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {hotel.images && hotel.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {hotel.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${hotel.name} - ${idx + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2">Açıklama</h3>
                  <p className="text-gray-600">{hotel.description}</p>
                </div>

                {hotel.tripadvisor_rating && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Değerlendirmeler</h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 text-white px-3 py-2 rounded font-bold text-xl">
                        {hotel.tripadvisor_rating.toFixed(1)}
                      </div>
                      <div>
                        <p className="font-semibold">Mükemmel</p>
                        <p className="text-sm text-gray-600">{hotel.tripadvisor_reviews} TripAdvisor yorumu</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-3">Olanaklar</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hotel.amenities?.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">İletişim Bilgileri</h3>
                  <div className="space-y-2">
                    {hotel.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        <span>{hotel.phone}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>{hotel.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">İptal Politikası</h4>
                  <p className="text-sm text-yellow-800">{hotel.cancellation_policy}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {nights > 0 && (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Rezervasyon Detayları</CardTitle>
                  <CardDescription>
                    {new Date(searchParams.check_in_date).toLocaleDateString('tr-TR')} - {new Date(searchParams.check_out_date).toLocaleDateString('tr-TR')}
                    <br />
                    {nights} gece, {searchParams.guests} misafir
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Oda Tipi Seçin</h4>
                    <div className="space-y-2">
                      {hotel.room_types?.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`w-full text-left p-4 border rounded-lg transition-all ${
                            selectedRoom?.id === room.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`room-type-${room.id}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold">{room.name}</h5>
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">
                                ₺{room.price_per_night.toLocaleString('tr-TR')}
                              </p>
                              <p className="text-xs text-gray-600">/gece</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{room.description}</p>
                          <p className="text-xs text-gray-500">Kapasite: {room.capacity} kişi</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedRoom && (
                    <>
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>₺{selectedRoom.price_per_night.toLocaleString('tr-TR')} x {nights} gece</span>
                          <span>₺{(selectedRoom.price_per_night * nights).toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Toplam</span>
                          <span className="text-blue-600">
                            ₺{(selectedRoom.price_per_night * nights).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Özel İstekler (Opsiyonel)</label>
                        <Textarea
                          placeholder="Ekstra yatak, erken giriş, vb."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={3}
                          data-testid="special-requests-input"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleBooking} 
                    disabled={!selectedRoom || booking}
                    className="w-full"
                    data-testid="create-reservation-button"
                  >
                    {booking ? 'Rezervasyon Oluşturuluyor...' : 'Rezervasyon Yap'}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}