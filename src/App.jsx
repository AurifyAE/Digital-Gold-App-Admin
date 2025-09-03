import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Scheme from './pages/Scheme';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Login from './pages/Login';
import UserProfile from '../src/components/User/UserProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route without Layout */}
        <Route path="/login" element={<Login />} />
        
        {/* Other routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="scheme" element={<Scheme />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users/user-details/:userId" element={<UserProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;