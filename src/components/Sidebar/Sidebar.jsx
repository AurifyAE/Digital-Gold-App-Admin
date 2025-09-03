// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, FileText, User, BarChart3, LogOut } from 'lucide-react';
import Logo from '../Common/Logo';
import UserProfile from '../Common/UserProfile';
import NavItem from './NavItem';

const Sidebar = ({ activeNav, user }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
    { id: 'users', icon: Users, label: 'Users', path: '/users' },
    { id: 'scheme', icon: FileText, label: 'Scheme', path: '/scheme' },
    { id: 'reports', icon: BarChart3, label: 'Reports', path: '/reports' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logout clicked');
    // Example: Clear user session, redirect to login, etc.
    // navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-sm flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Logo />
      </div>

      {/* User Profile */}
      <div className="px-6 pb-6">
        <UserProfile user={user} />
      </div>

      {/* Navigation */}
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

      {/* Logout Button */}
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