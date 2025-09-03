// src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import CalendarSidebar from '../Calendar/CalendarSidebar';
import { mockData } from '../../data/mockData';

const Layout = () => {
  const location = useLocation();
  
  // Get active navigation from current path
  const activeNav = location.pathname.substring(1) || 'dashboard';
  
  // Determine if calendar should be shown (only on dashboard for now)
  const showCalendar = activeNav === 'dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeNav={activeNav}
        user={mockData.user} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-auto">
          <div className="flex">
            {/* Main Content Area */}
            <div className="flex-1">
              <Outlet />
            </div>
            
            {/* Calendar Sidebar - Show only on specific pages */}
            {showCalendar && (
              <CalendarSidebar events={mockData.calendarEvents} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;