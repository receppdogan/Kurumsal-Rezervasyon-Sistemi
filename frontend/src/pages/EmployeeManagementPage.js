import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { userAPI, companyAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { UserPlus, Users, Mail, Phone, Building2 } from 'lucide-react';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EmployeeManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'employee',
    company_id: '',
    department: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'manager') {
      window.location.href = '/dashboard';
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, companiesRes] = await Promise.all([
        userAPI.getAll(),
        companyAPI.getAll()
      ]);
      setEmployees(usersRes.data);
      setCompanies(companiesRes.data);
      
      // Set default company for new users
      if (user?.company_id) {
        setFormData(prev => ({ ...prev, company_id: user.company_id }));
      } else if (companiesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, company_id: companiesRes.data[0].id }));
      }
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/auth/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({ title: "Başarılı", description: "Yeni çalışan eklendi" });
      setShowAddDialog(false);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'employee',
        company_id: user?.company_id || companies[0]?.id || '',
        department: ''
      });
      fetchData();
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.detail || 'Çalışan eklenirken hata oluştu',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800' },
      manager: { label: 'Yönetici', className: 'bg-blue-100 text-blue-800' },
      employee: { label: 'Çalışan', className: 'bg-green-100 text-green-800' },
      agency_admin: { label: 'Acenta Admin', className: 'bg-orange-100 text-orange-800' },
      agency_staff: { label: 'Acenta Personel', className: 'bg-gray-100 text-gray-800' }
    };
    const badge = badges[role] || badges.employee;
    return <span className={`text-xs px-2 py-1 rounded ${badge.className}`}>{badge.label}</span>;
  };

  const EmployeeCard = ({ employee }) => {
    const company = companies.find(c => c.id === employee.company_id);
    
    return (
      <Card data-testid={`employee-card-${employee.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{employee.full_name}</CardTitle>
              <CardDescription>{employee.email}</CardDescription>
            </div>
            {getRoleBadge(employee.role)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{employee.phone}</span>
            </div>
          )}
          {company && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>{company.name}</span>
            </div>
          )}
          {employee.department && (
            <div className="text-sm">
              <span className="text-gray-600">Departman: </span>
              <span className="font-medium">{employee.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${
              employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {employee.is_active ? 'Aktif' : 'Pasif'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              employee.gdpr_accepted ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {employee.gdpr_accepted ? 'GDPR Onaylı' : 'GDPR Bekliyor'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && employees.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Filter employees based on role
  const filteredEmployees = user?.role === 'manager'
    ? employees.filter(emp => emp.company_id === user.company_id)
    : employees;

  return (
    <Layout>
      <div className="space-y-6" data-testid="employee-management-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Çalışan Yönetimi</h1>
            <p className="text-gray-600 mt-2">Şirket çalışanlarını yönetin</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} data-testid="add-employee-button">
            <UserPlus className="h-4 w-4 mr-2" />
            Yeni Çalışan Ekle
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">{filteredEmployees.length}</CardTitle>
              <CardDescription>Toplam Çalışan</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl">
                {filteredEmployees.filter(e => e.is_active).length}
              </CardTitle>
              <CardDescription>Aktif Çalışan</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-2xl">
                {filteredEmployees.filter(e => !e.gdpr_accepted).length}
              </CardTitle>
              <CardDescription>GDPR Onayı Bekleyen</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {filteredEmployees.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
              <Users className="h-16 w-16 text-gray-400" />
              <p className="text-gray-500">Henüz çalışan eklenmemiş</p>
              <Button onClick={() => setShowAddDialog(true)}>
                İlk Çalışanı Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl" data-testid="add-employee-dialog">
          <DialogHeader>
            <DialogTitle>Yeni Çalışan Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir çalışan hesabı oluşturun. Çalışan ilk girişte şifresini değiştirecek.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Ad Soyad *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="Ahmet Yılmaz"
                    data-testid="employee-fullname-input"
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
                    placeholder="ahmet@abc-tech.com"
                    data-testid="employee-email-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 532 111 22 33"
                    data-testid="employee-phone-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Geçici Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Minimum 6 karakter"
                    data-testid="employee-password-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger data-testid="employee-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Çalışan</SelectItem>
                      <SelectItem value="manager">Yönetici</SelectItem>
                      {user?.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_id">Şirket *</Label>
                  <Select 
                    value={formData.company_id}
                    onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                    disabled={user?.role === 'manager'}
                  >
                    <SelectTrigger data-testid="employee-company-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departman</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="İnsan Kaynakları"
                  data-testid="employee-department-input"
                />
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Not:</strong> Çalışan ilk giriş yaptığında GDPR/KVKK onayı vermesi ve şifresini değiştirmesi gerekecektir.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading} data-testid="submit-employee-button">
                {loading ? 'Ekleniyor...' : 'Çalışan Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
