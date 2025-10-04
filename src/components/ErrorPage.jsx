import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  // Extract error message from location state, if available
  const errorMessage = location.state?.error || 'An unexpected error occurred. Please try again or contact support.';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleNavigation = (path) => {
    showToast(`Redirecting to ${path === '/dashboard' ? 'dashboard' : 'login'}`, 'success');
    setTimeout(() => navigate(path), 500); // Slight delay to show toast
  };

  const handleRetry = () => {
    showToast('Retrying previous page', 'success');
    setTimeout(() => navigate(-1), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white text-xs font-medium flex items-center space-x-2`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center max-w-md w-full"
      >
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h1 className="text-lg font-semibold text-gray-900 mb-3">Something Went Wrong</h1>
        <p className="text-xs text-gray-500 mb-6">{errorMessage}</p>
        <div className="space-y-3">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => handleNavigation('/login')}
            className="w-full py-2 px-4 rounded-lg bg-gray-500 text-white text-xs font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Back to Login
          </button>
          <button
            onClick={handleRetry}
            className="w-full py-2 px-4 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
          >
            Retry
          </button>
          <a
            href="mailto:support@example.com"
            className="block text-xs text-blue-600 hover:underline"
          >
            Contact Support
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;