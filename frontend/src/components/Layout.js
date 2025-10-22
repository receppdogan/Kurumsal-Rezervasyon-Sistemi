import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { 
  Home, 
  Hotel, 
  Calendar, 
  CheckCircle, 
  User, 
  LogOut,
  Building,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'employee'] },
    { icon: Hotel, label: 'Otel Ara', path: '/hotels', roles: ['admin', 'manager', 'employee'] },
    { icon: Calendar, label: 'Rezervasyonlarım', path: '/reservations', roles: ['admin', 'manager', 'employee'] },
    { icon: CheckCircle, label: 'Onay Bekleyenler', path: '/approvals', roles: ['admin', 'manager'] },
    { icon: Building, label: 'Şirket Yönetimi', path: '/company', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          navigate(item.path);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        data-testid={`nav-item-${item.path.substring(1)}`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-blue-600">Rezervasyon Sistemi</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            data-testid="mobile-menu-button"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-40 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">Rezervasyon</h1>
            <p className="text-sm text-gray-600">Kurumsal Sistem</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}