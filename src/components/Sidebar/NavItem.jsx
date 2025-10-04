// src/components/Sidebar/NavItem.jsx
import React from 'react';

const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left cursor-pointer transition-colors ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{item.label}</span>
    </button>
  );
};

export default NavItem;