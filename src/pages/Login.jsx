import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, X, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginAdmin } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from || '/dashboard';

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setNotification(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setNotification(null);

    try {
      const response = await loginAdmin({
        email: formData.email,
        password: formData.password,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Login failed');
      }

      localStorage.setItem('adminToken', response.data.data.token);
      localStorage.setItem('userId', response.data.data.user.id);
      localStorage.setItem('userName', response.data.data.user.name);
      localStorage.setItem('userEmail', response.data.data.user.email);
      localStorage.setItem('userRole', response.data.data.user.role);

      login(response.data.data.token, response.data.data.user.role);
      showNotification('Logged in successfully', 'success');
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err) {
      console.error('Login error:', err);
      showNotification(err.message || 'Invalid email or password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({ email: '', password: '' });
    setErrors({});
    setNotification(null);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-3 right-3 z-50 px-3 py-1.5 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white text-xs font-medium flex items-center space-x-2`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2"
              aria-label="Dismiss notification"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-white text-lg font-bold">Welcome Back</h1>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign In</h2>
              <p className="text-xs text-gray-600">Enter your credentials to access your account</p>
            </div>
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-xs flex items-center justify-between"
              >
                <span>{errors.form}</span>
                <button
                  onClick={() => setErrors({})}
                  className="text-red-700 hover:text-red-900"
                  aria-label="Dismiss error"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-8 pr-2 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-8 pr-8 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember" className="ml-2 block text-xs text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isLoading}
                  aria-label="Forgot password"
                >
                  Forgot password?
                </button>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-xs ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  } text-white`}
                  disabled={isLoading}
                  aria-label="Sign in"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
                {(formData.email || formData.password) && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearForm}
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                    disabled={isLoading}
                    aria-label="Clear form"
                  >
                    Clear
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
              aria-label="Contact administrator"
            >
              Contact Administrator
            </button>
          </p>
        </div>
    </motion.div>
    </div>
  );
};

export default Login;