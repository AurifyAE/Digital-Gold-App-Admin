import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock function to simulate fetching gold spot rates
const fetchSpotRates = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  if (Math.random() < 0.1) {
    throw new Error('Failed to fetch gold spot rates');
  }
  const bidRate = (1800 + Math.random() * 100).toFixed(2);
  const askRate = (parseFloat(bidRate) + 2 + Math.random() * 3).toFixed(2);
  return { bidRate: parseFloat(bidRate), askRate: parseFloat(askRate) };
};

const SpotRate = () => {
  const navigate = useNavigate();
  const [bidRate, setBidRate] = useState(null);
  const [askRate, setAskRate] = useState(null);
  const [prevBidRate, setPrevBidRate] = useState(null);
  const [prevAskRate, setPrevAskRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const loadSpotRates = async () => {
    setLoading(true);
    try {
      const { bidRate, askRate } = await fetchSpotRates();
      setPrevBidRate(bidRate);
      setPrevAskRate(askRate);
      setBidRate(bidRate);
      setAskRate(askRate);
      setLastUpdated(new Date());
      setError(null);
      showToast('Spot rates updated successfully', 'success');
    } catch (err) {
      let errorMessage = err.message || 'Failed to fetch gold spot rates';
      if (err.response?.data && typeof err.response.data === 'string' && err.response.data.includes('<pre>')) {
        const match = err.response.data.match(/<pre>(.*?)(?:<br>|$)/);
        errorMessage = match ? match[1] : errorMessage;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpotRates();
    const interval = setInterval(loadSpotRates, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    showToast('Refreshing spot rates', 'success');
    loadSpotRates();
  };

  const handleBack = () => {
    showToast('Returning to dashboard', 'success');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  const getRateBackground = (current, previous) => {
    if (previous === null) return 'bg-gray-100';
    if (current > previous) return 'bg-green-100';
    if (current < previous) return 'bg-red-100';
    return 'bg-gray-100';
  };

  const getRateChange = (current, previous) => {
    if (previous === null) return 'N/A';
    const change = ((current - previous) / previous * 100).toFixed(2);
    return change > 0 ? `+${change}%` : `${change}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-base font-semibold text-gray-900">Gold Spot Rates</h1>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer w-fit text-xs"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="Refresh spot rates"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4"
        >
          {/* Loading State */}
          {loading && (
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 mx-auto"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Loading spot rates...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && !bidRate && (
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
              <p className="text-xs text-gray-500">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 inline-flex py-2 px-4 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Rates Display */}
          {bidRate && askRate && !loading && !error && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.div
                  key={bidRate}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg ${getRateBackground(bidRate, prevBidRate)} border border-gray-200`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Bid Rate</p>
                      <p className="text-sm font-bold text-gray-900">${bidRate.toLocaleString()}</p>
                    </div>
                    <p className={`text-xs font-medium ${bidRate > prevBidRate ? 'text-green-600' : bidRate < prevBidRate ? 'text-red-600' : 'text-gray-600'}`}>
                      {getRateChange(bidRate, prevBidRate)}
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  key={askRate}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg ${getRateBackground(askRate, prevAskRate)} border border-gray-200`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Ask Rate</p>
                      <p className="text-sm font-bold text-gray-900">${askRate.toLocaleString()}</p>
                    </div>
                    <p className={`text-xs font-medium ${askRate > prevAskRate ? 'text-green-600' : askRate < prevAskRate ? 'text-red-600' : 'text-gray-600'}`}>
                      {getRateChange(askRate, prevAskRate)}
                    </p>
                  </div>
                </motion.div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SpotRate;