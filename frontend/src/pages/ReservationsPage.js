import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { reservationAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Calendar, User, Building, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';

export default function ReservationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationAPI.getAll();
      setReservations(response.data);
    } catch (err) {
      setError('Rezervasyonlar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen iptal sebebini belirtin",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);

    try {
      await reservationAPI.cancel(selectedReservation.id, cancellationReason);
      toast({
        title: "Başarılı",
        description: "Rezervasyon iptal edildi",
      });
      setShowCancelDialog(false);
      setCancellationReason('');
      fetchReservations();
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.detail || 'İptal işlemi başarısız',
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: 'Onay Bekliyor', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Onaylandı', className: 'bg-blue-100 text-blue-800' },
      confirmed: { label: 'Onaylandı', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Reddedildi', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'İptal Edildi', className: 'bg-gray-100 text-gray-800' },
      completed: { label: 'Tamamlandı', className: 'bg-purple-100 text-purple-800' },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const ReservationCard = ({ reservation }) => (
    <Card data-testid={`reservation-card-${reservation.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{reservation.hotel_name}</CardTitle>
            <CardDescription>{reservation.room_type_name}</CardDescription>
          </div>
          {getStatusBadge(reservation.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Giriş</p>
              <p className="text-gray-600">
                {new Date(reservation.check_in_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">Çıkış</p>
              <p className="text-gray-600">
                {new Date(reservation.check_out_date).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-4">
          <div>
            <span className="text-gray-600">Toplam Tutar</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              ₺{reservation.grand_total?.toLocaleString('tr-TR') || 0}
            </p>
          </div>
        </div>

        {(user?.role === 'manager' || user?.role === 'admin') && reservation.user_name && (
          <div className="flex items-center gap-2 text-sm border-t pt-4">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">{reservation.user_name}</p>
              <p className="text-gray-600 text-xs">{reservation.user_email}</p>
            </div>
          </div>
        )}

        {reservation.rejection_reason && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Red Sebebi:</strong> {reservation.rejection_reason}
            </AlertDescription>
          </Alert>
        )}

        {reservation.cancellation_reason && (
          <Alert>
            <AlertDescription>
              <strong>İptal Sebebi:</strong> {reservation.cancellation_reason}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {reservation.status === 'pending' && user?.id === reservation.user_id && (
          <Button
            variant="destructive"
            onClick={() => {
              setSelectedReservation(reservation);
              setShowCancelDialog(true);
            }}
            data-testid={`cancel-reservation-button-${reservation.id}`}
          >
            İptal Et
          </Button>
        )}
        {reservation.status === 'confirmed' && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedReservation(reservation);
              setShowCancelDialog(true);
            }}
            data-testid={`cancel-confirmed-reservation-button-${reservation.id}`}
          >
            Rezervasyonu İptal Et
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6" data-testid="reservations-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Rezervasyonlarım</h1>
            <p className="text-gray-600 mt-2">Tüm rezervasyonlarınızı görüntüleyin ve yönetin</p>
          </div>
          <Button onClick={() => window.location.href = '/hotels'} data-testid="new-reservation-button">
            Yeni Rezervasyon
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reservations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-gray-500">Henüz rezervasyonunuz yok</p>
              <Button onClick={() => window.location.href = '/hotels'}>
                Otel Aramaya Başla
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent data-testid="cancel-reservation-dialog">
          <DialogHeader>
            <DialogTitle>Rezervasyonu İptal Et</DialogTitle>
            <DialogDescription>
              Bu rezervasyonu iptal etmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">İptal Sebebi</label>
              <Textarea
                placeholder="Lütfen iptal sebebinizi belirtin"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                data-testid="cancellation-reason-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason('');
              }}
              disabled={actionLoading}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={actionLoading}
              data-testid="confirm-cancel-button"
            >
              {actionLoading ? 'İptal ediliyor...' : 'İptal Et'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}