import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  GraduationCap,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['admin', 'teacher', 'student'] },
    { name: 'Courses', href: '/courses', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
    { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['admin', 'teacher', 'student'] },
    { name: 'User Management', href: '/users', icon: UserCheck, roles: ['admin'] },
    { name: 'Students', href: '/students', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'teacher'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'teacher', 'student'] },
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AttendanceHub</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;