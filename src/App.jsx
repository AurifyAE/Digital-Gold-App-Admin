// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AuthNavigationHandler from './components/AuthNavigationHandler.jsx';
import Layout from './components/Layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Scheme from './pages/Scheme.jsx';
import Profile from './pages/Profile.jsx';
import Reports from './pages/Reports.jsx';
import Login from './pages/Login.jsx';
import UserProfile from './components/User/UserProfile.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import Payments from './pages/Payments.jsx';
import './App.css';
import KYC from './components/Kyc/kyc.jsx';
import SpotRate from './pages/SpotRate.jsx';
import Products from './pages/Products.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <AuthNavigationHandler /> {/* Add navigation handler */}
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/error" element={<ErrorPage />} />

            {/* Protected routes for admin only */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="spotrate" element={<SpotRate />} />
                <Route path="products" element={<Products />} />
                <Route path="users" element={<Users />} />
                <Route path="kyc" element={<KYC/>} />
                <Route path="scheme" element={<Scheme />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reports" element={<Reports />} />
                <Route path="payments" element={<Payments />} />
                <Route path="users/user-details/:userId" element={<UserProfile />} />
              </Route>
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/error" replace />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;