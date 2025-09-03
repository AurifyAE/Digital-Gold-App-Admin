import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, AlertCircle, User, CreditCard, History } from 'lucide-react';
import { getUserById } from '../../api/api';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        const loadUser = async () => {
            if (!userId) {
                setError('Invalid user ID');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await getUserById(userId);
                if (!response.success) {
                    const usersArray = response.data.data || [];
                    const userData = usersArray.length > 0 ? usersArray[0] : {};
                    setUser(userData);
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError(err.message || 'Failed to fetch user data');
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

    const tabs = [
        { id: 'basic', label: 'Basic Details', icon: User },
        { id: 'scheme', label: 'Selected Scheme', icon: CreditCard },
        { id: 'payment', label: 'Payment History', icon: History },
    ];

    const renderBasicDetails = () => {
        if (!user) return null;
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            First Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.first_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Last Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.last_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Email
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.email || 'N/A'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Status
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(user.is_active)}`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Mobile Number
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.mobile_no || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Created At
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderSelectedScheme = () => {
        if (!user) return null;
        return (
            <div className="space-y-4">
                {user.selected_schemes && user.selected_schemes.length > 0 ? (
                    user.selected_schemes.map((scheme, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-lg border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {scheme.scheme_name || `Scheme #${index + 1}`}
                                </h3>
                                <span className="text-sm text-gray-500">
                                    ID: {scheme.scheme_id || 'N/A'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Scheme Name
                                    </label>
                                    <p className="text-gray-900 bg-white p-3 rounded border">
                                        {scheme.scheme_name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Selected Date
                                    </label>
                                    <p className="text-gray-900 bg-white p-3 rounded border">
                                        {scheme.selected_date ? new Date(scheme.selected_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Payment History Count
                                    </label>
                                    <p className="text-gray-900 bg-white p-3 rounded border font-medium">
                                        {scheme.payment_history ? scheme.payment_history.length : 0} payments
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No schemes selected</p>
                        <p className="text-gray-400 text-sm mt-2">This user hasn't selected any schemes yet.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderPaymentHistory = () => {
        if (!user) return null;
        const allPayments = user.selected_schemes?.reduce((payments, scheme) => {
            return [...payments, ...(scheme.payment_history || [])];
        }, []) || [];

        return (
            <div className="space-y-4">
                {allPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {allPayments.map((payment, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {payment.transaction_id || `TXN-${index + 1}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            ${payment.amount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : payment.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {payment.status || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">No payment history</p>
                        <p className="text-gray-400 text-sm mt-2">This user hasn't made any payments yet.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">User Profile Management</h1>
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                            Back
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading user data...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-3 text-red-600">
                            <AlertCircle size={24} />
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* User Profile Card */}
                {user && !loading && !error && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* User Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-2xl font-medium">
                                        {(user.first_name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </h2>
                                    <p className="text-gray-600">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon size={16} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'basic' && renderBasicDetails()}
                            {activeTab === 'scheme' && renderSelectedScheme()}
                            {activeTab === 'payment' && renderPaymentHistory()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;