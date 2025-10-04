import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useMarketData from '../components/MarketData';
import { addCurrencyConfig, getCurrency, updateCurrency } from '../api/api';

const SpotRate = () => {
    const [prevBidRate, setPrevBidRate] = useState(null);
    const [prevAskRate, setPrevAskRate] = useState(null);
    const [toast, setToast] = useState(null);
    const [currencyRate, setCurrencyRate] = useState(null);
    const [currencyId, setCurrencyId] = useState(null);
    const [currencyKey, setCurrencyKey] = useState('');
    const [isEditingRate, setIsEditingRate] = useState(false);
    const [newRate, setNewRate] = useState('');
    const [loadingCurrency, setLoadingCurrency] = useState(false);

    const { marketData, loading, error } = useMarketData();

    // Get gold data from market data
    const goldData = marketData;

    const bidRate = goldData?.bid;
    const askRate = goldData?.offer;
    const high = goldData?.high;
    const low = goldData?.low;
    const marketStatus = goldData?.marketStatus;
    const nextMarketOpen = goldData?.nextMarketOpen;
    const lastUpdated = goldData?.timestamp;
    const highLowHistory = goldData?.highLowChanges || [];

    // Update previous rates when new data comes in
    useEffect(() => {
        if (bidRate && askRate) {
            if (prevBidRate !== bidRate || prevAskRate !== askRate) {
                setPrevBidRate(bidRate);
                setPrevAskRate(askRate);
            }
        }
    }, [bidRate, askRate, prevBidRate, prevAskRate]);

    // Fetch currency rate on component mount
    useEffect(() => {
        fetchCurrencyRate();
    }, []);

    const fetchCurrencyRate = async () => {
        setLoadingCurrency(true);
        try {
            const response = await getCurrency('usd_to_aed_gold_rate');
            console.log('Currency fetch response:', response);
            if (!response.success) {
                setCurrencyRate(response.data.data.value);
                setCurrencyId(response.data.data._id);
            }
        } catch (err) {
            console.error('Failed to fetch currency rate:', err);
            // If currency doesn't exist, it will be created when user adds it
        } finally {
            setLoadingCurrency(false);
        }
    };

    const handleAddCurrency = async () => {
        if (!currencyKey.trim()) {
            showToast('Please enter a currency key', 'error');
            return;
        }

        if (!newRate || isNaN(newRate) || parseFloat(newRate) <= 0) {
            showToast('Please enter a valid rate', 'error');
            return;
        }

        setLoadingCurrency(true);
        try {
            const response = await addCurrencyConfig({
                key: currencyKey.trim(),
                value: parseFloat(newRate)
            });
            console.log('Add currency response:', response);

            if (!response.success) {
                setCurrencyRate(parseFloat(newRate));
                setCurrencyId(response.id);
                setNewRate('');
                setCurrencyKey('');
                setIsEditingRate(false);
                showToast('Currency rate added successfully', 'success');
            }
        } catch (err) {
            showToast('Failed to add currency rate', 'error');
            console.error(err);
        } finally {
            setLoadingCurrency(false);
        }
    };

    const handleUpdateCurrency = async () => {
        if (!newRate || isNaN(newRate) || parseFloat(newRate) <= 0) {
            showToast('Please enter a valid rate', 'error');
            return;
        }

        if (!currencyId) {
            showToast('Currency ID not found', 'error');
            return;
        }

        setLoadingCurrency(true);
        try {
            await updateCurrency({
                id: currencyId,
                value: parseFloat(newRate)
            });

            setCurrencyRate(parseFloat(newRate));
            setNewRate('');
            setIsEditingRate(false);
            showToast('Currency rate updated successfully', 'success');
        } catch (err) {
            showToast('Failed to update currency rate', 'error');
            console.error(err);
        } finally {
            setLoadingCurrency(false);
        }
    };

    const handleCurrencyAction = () => {
        if (currencyId) {
            handleUpdateCurrency();
        } else {
            handleAddCurrency();
        }
    };

    const calculateAEDPrice = (usdPrice) => {
        if (!usdPrice || !currencyRate) return null;
        return (usdPrice * currencyRate).toFixed(2);
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleRefresh = () => {
        showToast('Refreshing spot rates', 'success');
        window.location.reload();
    };

    const getRateBackground = (current, previous) => {
        if (previous === null || previous === undefined) return 'bg-gray-100';
        if (current > previous) return 'bg-green-100';
        if (current < previous) return 'bg-red-100';
        return 'bg-gray-100';
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
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
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Spot Rate</h1>
                            <p className="text-xs text-gray-500 mt-1">Live Gold Price</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-2 text-gray-500 focus:outline-none cursor-pointer"
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
                    className="bg-white rounded-lg border border-gray-200 p-4"
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
                    {bidRate && askRate && !loading && (
                        <div className="space-y-4">
                            {/* Market Status Banner */}
                            {marketStatus && (
                                <div className={`p-3 rounded-lg flex items-center justify-between ${marketStatus === 'OPEN' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <Clock className={`w-4 h-4 ${marketStatus === 'OPEN' ? 'text-green-600' : 'text-orange-600'}`} />
                                        <span className={`text-xs font-medium ${marketStatus === 'OPEN' ? 'text-green-700' : 'text-orange-700'}`}>
                                            Market {marketStatus}
                                        </span>
                                    </div>
                                    {marketStatus === 'CLOSED' && nextMarketOpen && (
                                        <span className="text-xs text-orange-600">
                                            Opens: {formatDateTime(nextMarketOpen)}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Currency Rate Card */}
                            <div className="flex justify-end">
                                <div className="w-full max-w-xl bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-0">
                                        <div>
                                            <p className="text-xs text-gray-600 font-medium">USD to AED Conversion Rate</p>
                                            {currencyRate ? (
                                                <p className="text-sm font-bold text-blue-900 mt-1">1 USD = {currencyRate} AED</p>
                                            ) : (
                                                <p className="text-xs text-gray-500 mt-1">No rate configured</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsEditingRate(!isEditingRate);
                                                setNewRate(currencyRate?.toString() || '');
                                                if (!currencyRate) {
                                                    setCurrencyKey('usd_to_aed_gold_rate');
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                        >
                                            {currencyRate ? 'Edit' : 'Add Rate'}
                                        </button>
                                    </div>

                                    {isEditingRate && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3 mt-3"
                                        >
                                            {!currencyRate && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Currency Key</label>
                                                    <input
                                                        type="text"
                                                        value={currencyKey}
                                                        onChange={(e) => setCurrencyKey(e.target.value)}
                                                        placeholder="e.g., usd_to_aed_gold_rate"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Conversion Rate</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={newRate}
                                                        onChange={(e) => setNewRate(e.target.value)}
                                                        placeholder="e.g., 3.674"
                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        onClick={handleCurrencyAction}
                                                        disabled={loadingCurrency}
                                                        className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                                    >
                                                        {loadingCurrency ? 'Saving...' : currencyRate ? 'Update' : 'Add'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingRate(false);
                                                            setNewRate('');
                                                            setCurrencyKey('');
                                                        }}
                                                        className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Bid and Ask Rates */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <motion.div
                                    key={bidRate}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 0.3 }}
                                    className={`p-4 rounded-lg ${getRateBackground(bidRate, prevBidRate)} border border-gray-200`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500">Bid (USD)</p>
                                            <p className="text-sm font-bold text-gray-900">${bidRate.toLocaleString()}</p>
                                        </div>
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
                                            <p className="text-xs text-gray-500">Ask (USD)</p>
                                            <p className="text-sm font-bold text-gray-900">${askRate.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <TrendingDown className="w-3 h-3" />
                                                Low
                                            </p>
                                            <p className="text-sm font-bold text-red-600">${low?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                High
                                            </p>
                                            <p className="text-sm font-bold text-green-600">${high?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* High/Low History */}
                            {highLowHistory.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-semibold text-gray-700 mb-2">High/Low Change History</h3>
                                    <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                            {highLowHistory.map((change, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                                                    <div className="flex items-center gap-2">
                                                        {change.type === 'high' ? (
                                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3 text-red-600" />
                                                        )}
                                                        <span className="font-medium capitalize">{change.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-500">${change.oldValue} → ${change.newValue}</span>
                                                        <span className={`font-medium ${change.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {change.percentageChange >= 0 ? '+' : ''}{change.percentageChange.toFixed(2)}%
                                                        </span>
                                                        <span className="text-gray-400">{formatDateTime(change.timestamp)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default SpotRate;