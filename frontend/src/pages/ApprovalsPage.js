import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { reservationAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Calendar, User, CheckCircle, XCircle } from 'lucide-react';
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

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'manager' && user?.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    fetchPendingReservations();
  }, [user]);

  const fetchPendingReservations = async () => {
    try {
      const response = await reservationAPI.getAll('pending');
      setReservations(response.data);
    } catch (err) {
      setError('Rezervasyonlar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reservationId) => {
    setActionLoading(true);

    try {
      await reservationAPI.approve(reservationId);
      toast({
        title: "Başarılı",
        description: "Rezervasyon onaylandı",
      });
      fetchPendingReservations();
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.detail || 'Onaylama işlemi başarısız',
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen red sebebini belirtin",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);

    try {
      await reservationAPI.reject(selectedReservation.id, rejectionReason);
      toast({
        title: "Başarılı",
        description: "Rezervasyon reddedildi",
      });
      setShowRejectDialog(false);
      setRejectionReason('');
      fetchPendingReservations();
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.detail || 'Red işlemi başarısız',
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const ReservationCard = ({ reservation }) => (
    <Card data-testid={`approval-card-${reservation.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{reservation.hotel_name}</CardTitle>
            <CardDescription>{reservation.room_type_name}</CardDescription>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">Onay Bekliyor</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
          <User className="h-4 w-4 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">{reservation.user_name}</p>
            <p className="text-blue-700 text-xs">{reservation.user_email}</p>
          </div>
        </div>

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

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Oda Fiyatı</span>
            <span className="font-semibold">₺{reservation.price_per_night?.toLocaleString('tr-TR')}/gece</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Gece Sayısı</span>
            <span className="font-semibold">{reservation.nights} gece</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Ara Toplam</span>
            <span className="font-semibold">₺{reservation.total_price?.toLocaleString('tr-TR')}</span>
          </div>
          {reservation.service_fee > 0 && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Servis Ücreti</span>
              <span className="font-semibold">₺{reservation.service_fee?.toLocaleString('tr-TR')}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <span className="font-bold">Toplam</span>
            <span className="text-2xl font-bold text-blue-600">
              ₺{reservation.grand_total?.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>

        {reservation.special_requests && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Özel İstekler:</p>
            <p className="text-sm text-gray-600">{reservation.special_requests}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={() => handleApprove(reservation.id)}
          disabled={actionLoading}
          className="flex-1 bg-green-600 hover:bg-green-700"
          data-testid={`approve-button-${reservation.id}`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Onayla
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            setSelectedReservation(reservation);
            setShowRejectDialog(true);
          }}
          disabled={actionLoading}
          className="flex-1"
          data-testid={`reject-button-${reservation.id}`}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reddet
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6" data-testid="approvals-page">
        <div>
          <h1 className="text-3xl font-bold">Onay Bekleyen Rezervasyonlar</h1>
          <p className="text-gray-600 mt-2">Çalışanlarınızın rezervasyonlarını inceleyin ve onaylayın</p>
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
              <CheckCircle className="h-16 w-16 text-green-600" />
              <p className="text-gray-500 text-lg">Tüm rezervasyonlar işlendi!</p>
              <p className="text-gray-400 text-sm">Onay bekleyen rezervasyon bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent data-testid="reject-dialog">
          <DialogHeader>
            <DialogTitle>Rezervasyonu Reddet</DialogTitle>
            <DialogDescription>
              Bu rezervasyonu reddetmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Red Sebebi *</label>
              <Textarea
                placeholder="Lütfen red sebebinizi belirtin (zorunlu)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                data-testid="rejection-reason-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              disabled={actionLoading}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading}
              data-testid="confirm-reject-button"
            >
              {actionLoading ? 'Reddediliyor...' : 'Reddet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}