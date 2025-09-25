import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AuthNavigationHandler = () => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (!isLoading) {
        if (!isAuthenticated || userRole !== 'admin') {
          navigate('/login', { replace: true });
        }
      }
    };

    checkAuth(); // Check auth on mount
    window.addEventListener('popstate', checkAuth); // Check auth on back/forward navigation

    return () => {
      window.removeEventListener('popstate', checkAuth); // <-- fixed here
    };
  }, [isAuthenticated, userRole, isLoading, navigate]);

  return null;
};

export default AuthNavigationHandler;
