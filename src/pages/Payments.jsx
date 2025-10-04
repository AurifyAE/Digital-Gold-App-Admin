import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { fetchPayments, updatePaymentStatus } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const modalRef = useRef(null); // For focus trapping

  // Focus trapping for modal accessibility
  useEffect(() => {
    if (showModal && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === 'Escape') {
          setShowModal(false);
        }
      };

      modalRef.current.addEventListener('keydown', handleKeyDown);
      firstElement.focus();

      return () => modalRef.current?.removeEventListener('keydown', handleKeyDown);
    }
  }, [showModal]);

  // Fetch payments
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
        let errorMessage = 'Error fetching payments';
        if (typeof response.data === 'string' && response.data.includes('<pre>')) {
          const match = response.data.match(/<pre>(.*?)(?:<br>|$)/);
          errorMessage = match ? match[1] : 'Error fetching payments';
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        }
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      let errorMessage = 'Network error. Please check your connection and try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && error.response.data.includes('<pre>')) {
          const match = error.response.data.match(/<pre>(.*?)(?:<br>|$)/);
          errorMessage = match ? match[1] : 'Network error. Please check your connection and try again.';
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    setActionLoading(paymentId);
    try {
      const response = await updatePaymentStatus({
        id: paymentId,
        status: newStatus,
      });
      if (!response.success) {
        showNotification(`Payment ${newStatus} successfully`);
        fetchPaymentRequests();
      } else {
        let errorMessage = `Failed to ${newStatus} payment`;
        if (typeof response.data === 'string' && response.data.includes('<pre>')) {
          const match = response.data.match(/<pre>(.*?)(?:<br>|$)/);
          errorMessage = match ? match[1] : `Failed to ${newStatus} payment`;
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        }
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error(`Error updating payment status to ${newStatus}:`, error);
      let errorMessage = 'Network error while updating payment status.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && error.response.data.includes('<pre>')) {
          const match = error.response.data.match(/<pre>(.*?)(?:<br>|$)/);
          errorMessage = match ? match[1] : 'Network error while updating payment status.';
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      showNotification(errorMessage, 'error');
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
    return dateString
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';
  };

  // Filter and paginate payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const user = payment.user || {};
      const searchString = `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''} ${
        user.mobile_no || ''
      }`.toLowerCase();
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const openDetailsModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Skeleton Loader Component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="ml-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
      </tr>
    );

  // Pagination component
  const PaginationControls = () => {
    const startItem = (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(currentPage * rowsPerPage, filteredPayments.length);

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-700">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-gray-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div className="text-xs text-gray-700">
            {filteredPayments.length > 0 ? `${startItem}-${endItem} of ${filteredPayments.length}` : '0-0 of 0'}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-700">Page {currentPage} of {totalPages || 1}</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...' || page === currentPage}
                className={`px-2 py-1 text-xs rounded ${
                  page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white text-xs font-medium flex items-center space-x-2`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Requests</h1>
        <p className="text-xs text-gray-500 mt-1">Manage and process user payment requests</p>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by user name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-300 text-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-gray-300 text-xs"
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
          <div className="flex items-center space-x-3 text-xs text-gray-600">
            <span>Total: {filteredPayments.length}</span>
            <span>Wallet: {filteredPayments.filter((p) => p.payment_type === 'wallet').length}</span>
            <span>Scheme: {filteredPayments.filter((p) => p.payment_type === 'scheme').length}</span>
            <span>AIM: {filteredPayments.filter((p) => p.payment_type === 'aim').length}</span>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
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
                {[...Array(5)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
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
                        <DollarSign className="mx-auto w-12 h-12 text-gray-400 mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-1">No payment requests found</h3>
                        <p className="text-xs text-gray-500">
                          {searchTerm || paymentTypeFilter !== 'all'
                            ? 'Try adjusting your search criteria or filters.'
                            : 'Payment requests will appear here when users make payments.'}
                        </p>
                        {(searchTerm || paymentTypeFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setPaymentTypeFilter('all');
                            }}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Clear Search and Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map((payment, index) => (
                      <motion.tr
                        key={payment._id}
                        className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-xs font-medium text-gray-900">
                                {payment.user?.first_name || 'N/A'} {payment.user?.last_name || ''}
                              </div>
                              <div className="text-xs text-gray-500">{payment.user?.email || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{payment.user?.mobile_no || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-semibold text-green-600">₹{(payment.paid_amount).toFixed(2) || '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                              payment.status
                            )}`}
                          >
                            {getStatusIcon(payment.status)}
                            <span className="capitalize">{payment.status || 'Unknown'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                          {formatDate(payment.paidAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.transaction_id ? (
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {payment.transaction_id}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openDetailsModal(payment)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                              aria-label="View payment details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {payment.status === 'requested' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(payment._id, 'accepted')}
                                  disabled={actionLoading === payment._id}
                                  className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 disabled:opacity-50"
                                  title="Approve Payment"
                                  aria-label="Approve payment"
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
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                  title="Reject Payment"
                                  aria-label="Reject payment"
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
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredPayments.length > 0 && <PaginationControls />}
          </>
        )}
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg border border-gray-200 shadow-lg p-5 w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-900">Payment Request Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* User Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-gray-900 mb-2">User Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Name:</span>
                      <span className="text-xs font-medium">
                        {selectedPayment.user?.first_name || 'N/A'} {selectedPayment.user?.last_name || ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Email:</span>
                      <span className="text-xs font-medium">{selectedPayment.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Phone:</span>
                      <span className="text-xs font-medium">{selectedPayment.user?.mobile_no || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-gray-900 mb-2">Payment Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Amount:</span>
                      <span className="text-xs font-semibold text-green-600">₹{selectedPayment.paid_amount || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Payment Type:</span>
                      <span className="text-xs font-medium capitalize">{selectedPayment.payment_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Status:</span>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(
                          selectedPayment.status
                        )}`}
                      >
                        {getStatusIcon(selectedPayment.status)}
                        <span className="capitalize">{selectedPayment.status || 'Unknown'}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Paid At:</span>
                      <span className="text-xs font-medium">{formatDate(selectedPayment.paidAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Created At:</span>
                      <span className="text-xs font-medium">{formatDate(selectedPayment.createdAt)}</span>
                    </div>
                    {selectedPayment.transaction_id && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Transaction ID:</span>
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
                          {selectedPayment.transaction_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheme Information */}
                {selectedPayment.payment_type === 'scheme' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-xs font-medium text-gray-900 mb-2">Scheme Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Scheme ID:</span>
                        <span className="text-xs font-mono">{selectedPayment.selected_scheme_id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedPayment.status === 'requested' && (
                  <div className="flex space-x-2 pt-3 border-t">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedPayment._id, 'accepted');
                        setShowModal(false);
                      }}
                      disabled={actionLoading === selectedPayment._id}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs"
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
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{actionLoading === selectedPayment._id ? 'Processing...' : 'Reject Payment'}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payments;