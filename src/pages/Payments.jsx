import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Filter,
    DollarSign,
    Calendar,
    User,
    Eye,
    ThumbsUp,
    ThumbsDown,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { fetchPayments, updatePaymentStatus } from '../api/api';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [notification, setNotification] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchPaymentRequests();
    }, []);

    const fetchPaymentRequests = async () => {
        setLoading(true);
        try {
            const response = await fetchPayments();
            if (!response.success) {
                setPayments(response.data.data || []);
            } else {
                showNotification(response.message || 'Error fetching payments', 'error');
            }
        } catch (error) {
            showNotification('Error fetching payments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleStatusUpdate = async (paymentId, newStatus) => {
        setActionLoading(paymentId);
        try {
            const response = await updatePaymentStatus({
                id: paymentId,
                status: newStatus
            });
            if (!response.success) {
                showNotification(`Payment ${newStatus} successfully`);
                fetchPaymentRequests();
            } else {
                showNotification(response.message || `Failed to ${newStatus} payment`, 'error');
            }
        } catch (error) {
            showNotification(`Failed to ${newStatus} payment`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'requested':
                return 'bg-yellow-100 text-yellow-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'requested':
                return <Clock className="w-4 h-4" />;
            case 'accepted':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter and paginate payments
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const user = payment.user;
            const searchString = `${user.first_name} ${user.last_name} ${user.email} ${user.mobile_no}`.toLowerCase();
            const matchesSearch = searchString.includes(searchTerm.toLowerCase());
            const matchesFilter = paymentTypeFilter === 'all' || payment.payment_type === paymentTypeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [payments, searchTerm, paymentTypeFilter]);

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredPayments.slice(startIndex, endIndex);
    }, [filteredPayments, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, paymentTypeFilter, rowsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handleRowsPerPageChange = (newRowsPerPage) => {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1);
    };

    const openDetailsModal = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    // Pagination component
    const PaginationControls = () => {
        const startItem = (currentPage - 1) * rowsPerPage + 1;
        const endItem = Math.min(currentPage * rowsPerPage, filteredPayments.length);

        return (
            <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-700">
                        {filteredPayments.length > 0 ? `${startItem}-${endItem} of ${filteredPayments.length}` : '0-0 of 0'}
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-sm">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                    <div className="flex items-center space-x-2">
                        {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Requests</h1>
                <p className="text-gray-600">Manage and process user payment requests</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by user name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Filter */}
                        <div className="relative">
                            <select
                                value={paymentTypeFilter}
                                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">All Payment Types</option>
                                <option value="wallet">Wallet</option>
                                <option value="scheme">Scheme</option>
                                <option value="aim">AIM</option>
                            </select>
                            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Total: {filteredPayments.length}</span>
                        <span>Wallet: {filteredPayments.filter(p => p.payment_type === 'wallet').length}</span>
                        <span>Scheme: {filteredPayments.filter(p => p.payment_type === 'scheme').length}</span>
                        <span>AIM: {filteredPayments.filter(p => p.payment_type === 'aim').length}</span>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading payments...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paid At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <DollarSign className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment requests found</h3>
                                                <p className="text-gray-500">
                                                    {searchTerm || paymentTypeFilter !== 'all'
                                                        ? 'Try adjusting your search criteria or filters.'
                                                        : 'Payment requests will appear here when users make payments.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedPayments.map((payment, index) => (
                                            <tr key={payment._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <User className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {payment.user.first_name} {payment.user.last_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{payment.user.email}</div>
                                                            <div className="text-xs text-gray-400">{payment.user.mobile_no}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-green-600">₹{payment.paid_amount}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                        {getStatusIcon(payment.status)}
                                                        <span className="capitalize">{payment.status}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(payment.paidAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {payment.transaction_id ? (
                                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                                            {payment.transaction_id}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => openDetailsModal(payment)}
                                                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        
                                                        {payment.status === 'requested' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(payment._id, 'accepted')}
                                                                    disabled={actionLoading === payment._id}
                                                                    className="text-green-600 hover:text-green-800 p-1 rounded disabled:opacity-50"
                                                                    title="Approve Payment"
                                                                >
                                                                    {actionLoading === payment._id ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                                    ) : (
                                                                        <ThumbsUp className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(payment._id, 'rejected')}
                                                                    disabled={actionLoading === payment._id}
                                                                    className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50"
                                                                    title="Reject Payment"
                                                                >
                                                                    {actionLoading === payment._id ? (
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                                    ) : (
                                                                        <ThumbsDown className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Controls */}
                        {filteredPayments.length > 0 && <PaginationControls />}
                    </>
                )}
            </div>

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block w-full max-w-lg border-2 border-gray-300 p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Payment Request Details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* User Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Name:</span>
                                            <span className="text-sm font-medium">{selectedPayment.user.first_name} {selectedPayment.user.last_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Email:</span>
                                            <span className="text-sm font-medium">{selectedPayment.user.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Phone:</span>
                                            <span className="text-sm font-medium">{selectedPayment.user.mobile_no}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Amount:</span>
                                            <span className="text-sm font-semibold text-green-600">₹{selectedPayment.paid_amount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Payment Type:</span>
                                            <span className="text-sm font-medium capitalize">{selectedPayment.payment_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Status:</span>
                                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedPayment.status)}`}>
                                                {getStatusIcon(selectedPayment.status)}
                                                <span className="capitalize">{selectedPayment.status}</span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Paid At:</span>
                                            <span className="text-sm font-medium">{formatDate(selectedPayment.paidAt)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Created At:</span>
                                            <span className="text-sm font-medium">{formatDate(selectedPayment.createdAt)}</span>
                                        </div>
                                        {selectedPayment.transaction_id && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Transaction ID:</span>
                                                <span className="text-sm font-mono bg-white px-2 py-1 rounded border">{selectedPayment.transaction_id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Scheme Information */}
                                {selectedPayment.payment_type === 'scheme' && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Scheme Information</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Scheme ID:</span>
                                                <span className="text-sm font-mono">{selectedPayment.selected_scheme_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedPayment.status === 'requested' && (
                                    <div className="flex space-x-3 pt-4 border-t">
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedPayment._id, 'accepted');
                                                setShowModal(false);
                                            }}
                                            disabled={actionLoading === selectedPayment._id}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            <span>{actionLoading === selectedPayment._id ? 'Processing...' : 'Approve Payment'}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedPayment._id, 'rejected');
                                                setShowModal(false);
                                            }}
                                            disabled={actionLoading === selectedPayment._id}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                            <span>{actionLoading === selectedPayment._id ? 'Processing...' : 'Reject Payment'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;