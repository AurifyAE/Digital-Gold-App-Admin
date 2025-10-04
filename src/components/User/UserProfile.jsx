import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, AlertCircle, User, CreditCard, History, Target, Wallet, CheckCircle } from 'lucide-react';
import { getUserById } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    useEffect(() => {
        const loadUser = async () => {
            if (!userId) {
                setError('Invalid user ID');
                showToast('Invalid user ID', 'error');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await getUserById(userId);
                console.log('API Response:', response.data.data[0]); // Debug log

                if (!response.success) {
                    const userData = response.data.data[0];
                    setUser(userData);
                    setError(null);
                    showToast('User data loaded successfully', 'success');
                } else {
                    let errorMessage = 'Failed to fetch user data or user not found';
                    if (typeof response.data === 'string' && response.data.includes('<pre>')) {
                        const match = response.data.match(/<pre>(.*?)(?:<br>|$)/);
                        errorMessage = match ? match[1] : errorMessage;
                    } else if (response.data?.message) {
                        errorMessage = response.data.message;
                    }
                    setError(errorMessage);
                    showToast(errorMessage, 'error');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                let errorMessage = 'Failed to fetch user data';
                if (err.response?.data) {
                    if (typeof err.response.data === 'string' && err.response.data.includes('<pre>')) {
                        const match = err.response.data.match(/<pre>(.*?)(?:<br>|$)/);
                        errorMessage = match ? match[1] : 'Network error. Please check your connection and try again.';
                    } else if (err.response.data.message) {
                        errorMessage = err.response.data.message;
                    }
                }
                setError(errorMessage);
                showToast(errorMessage, 'error');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [userId]);

    const handleBack = () => {
        navigate('/users');
    };

    const getStatusBadge = (isActive) => {
        return isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getPaymentStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'active':
            case 'accepted':
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Details', icon: User },
        { id: 'scheme', label: 'Selected Schemes', icon: CreditCard },
        { id: 'aim', label: 'Aims', icon: Target },
        { id: 'payment', label: 'Payment History', icon: History },
        { id: 'wallet', label: 'Wallet', icon: Wallet },
    ];

    const renderBasicDetails = () => {
        if (!user) return null;
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            First Name
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{user.first_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Last Name
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{user.last_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Email
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg break-all">{user.email || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Gender
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{user.gender || 'N/A'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            DOB
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{user.date_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Status
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.is_active)}`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Mobile Number
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{user.mobile_no || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Join Date
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderSelectedScheme = () => {
        if (!user || !user.selected_schemes) return null;

        return (
            <div className="space-y-4">
                {user.selected_schemes && user.selected_schemes.length > 0 ? (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">{user.selected_schemes.length}</div>
                                <div className="text-xs text-blue-100">Total Schemes</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    {user.selected_schemes.filter(s => s.status === 'active').length}
                                </div>
                                <div className="text-xs text-green-100">Active Schemes</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    ₹{user.selected_schemes.reduce((sum, s) => sum + (parseFloat(s.scheme?.amount || 0)), 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-purple-100">Total Investment</div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    ₹{user.selected_schemes.reduce((sum, s) => sum + (parseFloat(s.balance_payout || 0)), 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-orange-100">Total Balance</div>
                            </div>
                        </div>

                        {/* Scheme Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {user.selected_schemes.map((selectedScheme, index) => (
                                <div key={selectedScheme._id || index} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    {/* Card Header */}
                                    <div className="p-3 border-b border-gray-100">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="text-sm font-bold text-gray-900 truncate flex-1">
                                                {selectedScheme.scheme?.name || `Scheme #${index + 1}`}
                                            </h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPaymentStatusBadge(selectedScheme.status)}`}>
                                                {selectedScheme.status || 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-mono">
                                            ID: {selectedScheme.scheme_id?.slice(-8) || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-3">
                                        {/* Key Metrics */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="text-center p-2 bg-blue-50 rounded">
                                                <div className="text-sm font-bold text-blue-600">
                                                    ₹{selectedScheme.scheme?.amount ? parseFloat(selectedScheme.scheme.amount).toLocaleString() : '0'}
                                                </div>
                                                <div className="text-xs text-blue-700">Total</div>
                                            </div>
                                            <div className="text-center p-2 bg-green-50 rounded">
                                                <div className="text-sm font-bold text-green-600">
                                                    ₹{selectedScheme.balance_payout ? parseFloat(selectedScheme.balance_payout).toLocaleString() : '0'}
                                                </div>
                                                <div className="text-xs text-green-700">Balance</div>
                                            </div>
                                        </div>

                                        {/* Compact Details */}
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-medium">{selectedScheme.scheme?.months || 'N/A'}m</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Monthly:</span>
                                                <span className="font-medium text-green-600">
                                                    ₹{selectedScheme.scheme?.monthly_pay ? parseFloat(selectedScheme.scheme.monthly_pay).toFixed(0) : '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Bonus:</span>
                                                <span className="font-medium text-purple-600">
                                                    ₹{selectedScheme.scheme?.bonus ? parseFloat(selectedScheme.scheme.bonus).toFixed(0) : '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payments:</span>
                                                <span className="font-medium">
                                                    {selectedScheme.payment_history ? selectedScheme.payment_history.length : 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {selectedScheme.scheme?.months && selectedScheme.payment_history && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Progress</span>
                                                    <span>{selectedScheme.payment_history.length}/{selectedScheme.scheme.months}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${Math.min((selectedScheme.payment_history.length / selectedScheme.scheme.months) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="mt-3 pt-2 border-t border-gray-100">
                                            <div className="text-xs text-gray-500">
                                                {selectedScheme.createdAt ? new Date(selectedScheme.createdAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-1">No schemes selected</h3>
                        <p className="text-xs text-gray-500">This user hasn't selected any schemes yet.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderAims = () => {
        if (!user || !user.aims) return null;

        return (
            <div className="space-y-4">
                {user.aims && user.aims.length > 0 ? (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">{user.aims.length}</div>
                                <div className="text-xs text-blue-100">Total Aims</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    {user.aims.filter(a => a.status === 'active').length}
                                </div>
                                <div className="text-xs text-green-100">Active Aims</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    ₹{user.aims.reduce((sum, a) => sum + (parseFloat(a.amount || 0)), 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-purple-100">Total Goal Amount</div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    ₹{user.aims.reduce((sum, a) => sum + (parseFloat(a.current_saved || 0)), 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-orange-100">Total Saved</div>
                            </div>
                        </div>

                        {/* Aim Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {user.aims.map((aim, index) => (
                                <div key={aim._id || index} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    {/* Card Header */}
                                    <div className="p-3 border-b border-gray-100">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="text-sm font-bold text-gray-900 truncate flex-1">
                                                {aim.name || `Aim #${index + 1}`}
                                            </h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPaymentStatusBadge(aim.status)}`}>
                                                {aim.status || 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-mono">
                                            ID: {aim._id?.slice(-8) || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-3">
                                        {/* Key Metrics */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="text-center p-2 bg-blue-50 rounded">
                                                <div className="text-sm font-bold text-blue-600">
                                                    ₹{aim.amount ? parseFloat(aim.amount).toLocaleString() : '0'}
                                                </div>
                                                <div className="text-xs text-blue-700">Goal</div>
                                            </div>
                                            <div className="text-center p-2 bg-green-50 rounded">
                                                <div className="text-sm font-bold text-green-600">
                                                    ₹{aim.current_saved ? parseFloat(aim.current_saved).toLocaleString() : '0'}
                                                </div>
                                                <div className="text-xs text-green-700">Saved</div>
                                            </div>
                                        </div>

                                        {/* Compact Details */}
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-medium">{aim.months || 'N/A'}m</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">EMI:</span>
                                                <span className="font-medium text-green-600">
                                                    ₹{aim.calculated_emi ? parseFloat(aim.calculated_emi).toFixed(0) : '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Cycle:</span>
                                                <span className="font-medium">
                                                    {aim.payment_cycle || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payments:</span>
                                                <span className="font-medium">
                                                    {aim.payment_history ? aim.payment_history.length : 0}
                                                </span>
                                            </div>
                                            {aim.next_payment_date && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Next Pay:</span>
                                                    <span className="font-medium">
                                                        {new Date(aim.next_payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        {aim.months && aim.payment_history && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Progress</span>
                                                    <span>{aim.payment_history.length}/{aim.months}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${Math.min((aim.payment_history.length / aim.months) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="mt-3 pt-2 border-t border-gray-100">
                                            <div className="text-xs text-gray-500">
                                                {aim.createdAt ? new Date(aim.createdAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Target className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-1">No aims set</h3>
                        <p className="text-xs text-gray-500">This user hasn't set any aims yet.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderPaymentHistory = () => {
        if (!user || (!user.selected_schemes && !user.aims)) return null;

        // Collect all scheme payments
        const allSchemePayments = user.selected_schemes?.reduce((payments, selectedScheme) => {
            if (selectedScheme.payment_history && selectedScheme.payment_history.length > 0) {
                const schemePayments = selectedScheme.payment_history.map(payment => ({
                    ...payment,
                    type: 'Scheme',
                    scheme_name: selectedScheme.scheme?.name || 'Unknown Scheme',
                    scheme_id: selectedScheme.scheme_id
                }));
                return [...payments, ...schemePayments];
            }
            return payments;
        }, []) || [];

        // Collect all aim payments
        const allAimPayments = user.aims?.reduce((payments, aim) => {
            if (aim.payment_history && aim.payment_history.length > 0) {
                const aimPayments = aim.payment_history.map(payment => ({
                    ...payment,
                    type: 'Aim',
                    scheme_name: aim.name || 'Unknown Aim',
                    scheme_id: aim._id
                }));
                return [...payments, ...aimPayments];
            }
            return payments;
        }, []) || [];

        // Combine and sort payments by date (newest first)
        const allPayments = [...allSchemePayments, ...allAimPayments].sort(
            (a, b) => new Date(b.paidAt) - new Date(a.paidAt)
        );

        return (
            <div className="space-y-4">
                {allPayments.length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount Paid
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Scheme/Aim ID
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {allPayments.map((payment, index) => (
                                        <tr key={payment._id || index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-900">
                                                {payment._id ? payment._id.slice(-8) : `PAY-${index + 1}`}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                                {payment.type}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-900 font-medium max-w-xs truncate">
                                                {payment.scheme_name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-green-600">
                                                ₹{payment.paid_amount ? parseFloat(payment.paid_amount).toFixed(2) : '0.00'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                                {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 hidden md:table-cell">
                                                {payment.selected_scheme_id ? payment.selected_scheme_id.slice(-8) : payment.scheme_id ? payment.scheme_id.slice(-8) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-xs font-medium text-gray-500">
                                    Total Payments: {allPayments.length}
                                </span>
                                <span className="text-xs font-bold text-gray-900">
                                    Total Amount: ₹{allPayments.reduce((sum, payment) => sum + (parseFloat(payment.paid_amount) || 0), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <History className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-1">No payment history</h3>
                        <p className="text-xs text-gray-500">This user hasn't made any payments yet.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderWallet = () => {
        if (!user || !user.wallet) return null;

        return (
            <div className="space-y-4">
                {user.wallet ? (
                    <>
                        {/* Wallet Summary Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    ₹{user.wallet.balance ? parseFloat(user.wallet.balance).toLocaleString() : '0.00'}
                                </div>
                                <div className="text-xs text-blue-100">Current Balance</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    ₹{user.wallet.credit ? parseFloat(user.wallet.credit).toLocaleString() : '0.00'}
                                </div>
                                <div className="text-xs text-green-100">Total Credit</div>
                            </div>
                            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 text-white">
                                <div className="text-base font-bold">
                                    ₹{user.wallet.debit ? parseFloat(user.wallet.debit).toLocaleString() : '0.00'}
                                </div>
                                <div className="text-xs text-red-100">Total Debit</div>
                            </div>
                        </div>

                        {/* Wallet Payment History */}
                        <div className="space-y-4">
                            {user.wallet.payment_history && user.wallet.payment_history.length > 0 ? (
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Payment ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Payment Date
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                                        Wallet ID
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {user.wallet.payment_history.map((payment, index) => (
                                                    <tr key={payment._id || index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-900">
                                                            {payment._id ? payment._id.slice(-8) : `WAL-${index + 1}`}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-green-600">
                                                            ₹{payment.paid_amount ? parseFloat(payment.paid_amount).toFixed(2) : '0.00'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusBadge(payment.status)}`}>
                                                                {payment.status || 'Unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 hidden md:table-cell">
                                                            {payment.wallet_id ? payment.wallet_id.slice(-8) : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Wallet Payment Summary */}
                                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <span className="text-xs font-medium text-gray-500">
                                                Total Transactions: {user.wallet.payment_history.length}
                                            </span>
                                            <span className="text-xs font-bold text-gray-900">
                                                Total Amount: ₹{user.wallet.payment_history.reduce((sum, payment) => sum + (parseFloat(payment.paid_amount) || 0), 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <h3 className="text-base font-medium text-gray-900 mb-1">No wallet transactions</h3>
                                    <p className="text-xs text-gray-500">This user hasn't made any wallet transactions yet.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-1">No wallet data</h3>
                        <p className="text-xs text-gray-500">This user doesn't have a wallet yet.</p>
                    </div>
                )}
            </div>
        );
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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-base md:text-lg font-semibold text-gray-900">User Profile Management</h1>
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer w-fit text-xs"
                        >
                            <ArrowLeft size={14} />
                            Back to Users
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 mx-auto"></div>
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Loading user data...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && !user && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center space-x-3 text-red-600">
                            <AlertCircle size={16} />
                            <p className="text-xs">{error}</p>
                        </div>
                    </div>
                )}

                {/* User Profile Card */}
                {user && !loading && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* User Header */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-base font-medium">
                                        {(user.first_name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base md:text-lg font-bold text-gray-900 truncate">
                                        {user.first_name} {user.last_name}
                                    </h2>
                                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {user._id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-6 px-4 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 py-3 border-b-2 font-medium text-xs transition-colors whitespace-nowrap ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon size={14} />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4">
                            {activeTab === 'basic' && renderBasicDetails()}
                            {activeTab === 'scheme' && renderSelectedScheme()}
                            {activeTab === 'aim' && renderAims()}
                            {activeTab === 'payment' && renderPaymentHistory()}
                            {activeTab === 'wallet' && renderWallet()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;