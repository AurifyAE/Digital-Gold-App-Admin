// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, FileText, User, BarChart3, LogOut, Wallet } from 'lucide-react';
import Logo from '../Common/Logo.jsx';
import UserProfile from '../Common/UserProfile.jsx';
import NavItem from './NavItem.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { logoutAdmin } from '../../api/api.js';

const Sidebar = ({ activeNav, user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
    { id: 'users', icon: Users, label: 'Users', path: '/users' },
    { id: 'kyc', icon: User, label: 'KYC', path: '/kyc' },
    { id: 'scheme', icon: FileText, label: 'Scheme', path: '/scheme' },
    { id: 'reports', icon: BarChart3, label: 'Reports', path: '/reports' },
    { id: 'payments', icon: Wallet, label: 'Payments', path: '/payments' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem('userId');
    try {
      await logoutAdmin(userId);
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="w-64 bg-white shadow-sm flex flex-col">
      <div className="p-6">
        <Logo />
      </div>
      <div className="px-6 pb-6">
        <UserProfile user={user} />
      </div>
      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeNav === item.id}
            onClick={() => handleNavigation(item.path)}
          />
        ))}
      </nav>
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex cursor-pointer items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;