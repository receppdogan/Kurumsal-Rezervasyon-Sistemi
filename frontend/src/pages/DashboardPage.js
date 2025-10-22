import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api/api';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Hotel, Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('İstatistikler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6" data-testid="dashboard-page">
        <div>
          <h1 className="text-3xl font-bold">Hoş Geldiniz, {user?.full_name}</h1>
          <p className="text-gray-600 mt-2">
            Rol: {user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Yönetici' : 'Çalışan'}
          </p>
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
        ) : stats ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Toplam Rezervasyon"
                value={stats.total_reservations}
                icon={Calendar}
                color="text-blue-600"
              />
              {(user?.role === 'manager' || user?.role === 'admin') && (
                <StatCard
                  title="Onay Bekleyen"
                  value={stats.pending_approvals}
                  icon={Hotel}
                  color="text-orange-600"
                />
              )}
              <StatCard
                title="Onaylandı"
                value={stats.confirmed_reservations}
                icon={CheckCircle}
                color="text-green-600"
              />
              <StatCard
                title="İptal Edildi"
                value={stats.cancelled_reservations}
                icon={XCircle}
                color="text-red-600"
              />
              <StatCard
                title="Toplam Harcama"
                value={`₺${stats.total_spent.toLocaleString('tr-TR')}`}
                icon={TrendingUp}
                color="text-purple-600"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href="/hotels"
                    className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    data-testid="quick-action-search-hotels"
                  >
                    <h3 className="font-semibold text-blue-900">Otel Ara</h3>
                    <p className="text-sm text-blue-700">Yeni rezervasyon oluştur</p>
                  </a>
                  <a
                    href="/reservations"
                    className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    data-testid="quick-action-view-reservations"
                  >
                    <h3 className="font-semibold text-green-900">Rezervasyonlarım</h3>
                    <p className="text-sm text-green-700">Mevcut rezervasyonları görüntüle</p>
                  </a>
                  {(user?.role === 'manager' || user?.role === 'admin') && (
                    <a
                      href="/approvals"
                      className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                      data-testid="quick-action-pending-approvals"
                    >
                      <h3 className="font-semibold text-orange-900">Onay Bekleyenler</h3>
                      <p className="text-sm text-orange-700">{stats.pending_approvals} rezervasyon bekliyor</p>
                    </a>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sistem Bilgisi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hesap Durumu</span>
                    <span className="text-sm font-semibold text-green-600">Aktif</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Şirket</span>
                    <span className="text-sm font-semibold">{user?.company_id || 'Atanmamış'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Departman</span>
                    <span className="text-sm font-semibold">{user?.department || 'Atanmamış'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="flex justify-center items-center h-64">
              <p className="text-gray-500">Veri bulunamadı</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}