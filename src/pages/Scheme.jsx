import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Gift,
  Eye,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { fetchScheme, addScheme, editScheme, deleteScheme } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion'
import DirhamIcon from '../components/Icon/DirhamIcon';

const Scheme = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    months: '',
    monthly_pay: '',
    amount: '',
    bonus: '',
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState(null);
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

  // Fetch schemes
  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await fetchScheme();
      if (!response.success) {
        setSchemes(response.data.data || []);
      } else {
        showNotification(response.data?.message || 'Error fetching schemes', 'error');
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
      showNotification(
        error.response?.data?.message || 'Network error. Please check your connection and try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      months: '',
      monthly_pay: '',
      amount: '',
      bonus: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Scheme name is required';
    if (!formData.months || parseInt(formData.months) <= 0) newErrors.months = 'Months must be a positive number';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be a positive number';
    if (!formData.bonus || parseFloat(formData.bonus) < 0) newErrors.bonus = 'Bonus must be a non-negative number';
    if (!formData.monthly_pay || parseFloat(formData.monthly_pay) <= 0) {
      newErrors.monthly_pay = 'Monthly pay must be a positive number';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showNotification('Please fix the form errors', 'error');
    }
    return Object.keys(newErrors).length === 0;
  };

  // Auto-calculate monthly_pay from months and amount
  useEffect(() => {
    if (modalMode === 'create' || modalMode === 'edit') {
      const months = parseInt(formData.months);
      const amount = parseFloat(formData.amount);
      if (months > 0 && amount > 0) {
        const newMonthlyPay = (amount / months).toFixed(2);
        if (Math.abs(parseFloat(formData.monthly_pay || 0) - parseFloat(newMonthlyPay)) > 0.01) {
          setFormData((prev) => ({
            ...prev,
            monthly_pay: newMonthlyPay,
          }));
        }
      }
    }
    // eslint-disable-next-line
  }, [formData.months, formData.amount, modalMode]);

  // Auto-calculate amount from months and monthly_pay
  useEffect(() => {
    if (modalMode === 'create' || modalMode === 'edit') {
      const months = parseInt(formData.months);
      const monthlyPay = parseFloat(formData.monthly_pay);
      if (months > 0 && monthlyPay > 0) {
        const newAmount = (monthlyPay * months).toFixed(2);
        if (Math.abs(parseFloat(formData.amount || 0) - parseFloat(newAmount)) > 0.01) {
          setFormData((prev) => ({
            ...prev,
            amount: newAmount,
          }));
        }
      }
    }
    // eslint-disable-next-line
  }, [formData.months, formData.monthly_pay, modalMode]);

  // Set up formData when modal opens
  useEffect(() => {
    if (showModal) {
      if (selectedScheme && (modalMode === 'edit' || modalMode === 'view')) {
        setFormData({
          name: selectedScheme.name,
          months: selectedScheme.months.toString(),
          monthly_pay: selectedScheme.monthly_pay.toString(),
          amount: selectedScheme.amount.toString(),
          bonus: selectedScheme.bonus.toString(),
        });
      } else if (modalMode === 'create') {
        resetForm();
      }
    }
    // eslint-disable-next-line
  }, [showModal, selectedScheme, modalMode]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let schemeData = {
        ...formData,
        name: formData.name.trim(),
        months: parseInt(formData.months),
        monthly_pay: parseFloat(formData.monthly_pay),
        amount: parseFloat(formData.amount),
        bonus: parseFloat(formData.bonus),
      };

      // Always recalc monthly_pay on submit for consistency
      schemeData.monthly_pay = schemeData.amount / schemeData.months;

      let response;
      if (modalMode === 'create') {
        response = await addScheme(schemeData);
      } else if (modalMode === 'edit') {
        response = await editScheme(selectedScheme._id, schemeData);
      }

      if (!response.success) {
        showNotification(`Scheme ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
        setShowModal(false);
        resetForm();
        fetchSchemes();
      } else {
        // Handle non-JSON response (e.g., HTML) or JSON with message
        let errorMessage = 'Operation failed';
        if (typeof response.data === 'string' && response.data.includes('<pre>')) {
          const match = response.data.match(/<pre>(.*?)(?:<br>|$)/);
          errorMessage = match ? match[1] : 'Operation failed';
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        }
        showNotification(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error saving scheme:', error);
      let errorMessage = 'Network error. Please try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && error.response.data.includes('<pre>')) {
          const match = error.response.data.match(/<pre>(.*?)(?:<br>|$)/);
          errorMessage = match ? match[1] : 'Network error. Please try again.';
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (scheme) => {
    setSchemeToDelete(scheme);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteScheme(schemeToDelete._id);
      if (!response.success) {
        showNotification('Scheme deleted successfully');
        fetchSchemes();
      } else {
        showNotification(response.data?.message || 'Delete failed', 'error');
      }
    } catch (error) {
      console.error('Error deleting scheme:', error);
      showNotification(
        error.response?.data?.message || 'Network error while deleting scheme.',
        'error'
      );
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const openModal = (mode, scheme = null) => {
    setModalMode(mode);
    setSelectedScheme(scheme);
    setShowModal(true);
  };

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && !scheme.is_active) ||
      (filterActive === 'inactive' && scheme.is_active);
    return matchesSearch && matchesFilter;
  });

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white text-xs font-medium flex items-center space-x-2`}
          >
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Scheme Management</h1>
        <p className="text-xs text-gray-500 mt-1">Create and manage investment schemes</p>
      </div>

      {/* Controls */}
      <div className="mb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-4 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search schemes..."
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
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-gray-300 text-[12px]"
              >
                <option value="all">All Schemes</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={() => openModal('create')}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Scheme</span>
          </button>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loading && schemes.length === 0 ? (
          Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
        ) : (
          filteredSchemes.map((scheme) => (
            <motion.div
              key={scheme._id}
              className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{scheme.name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${scheme.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {scheme.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openModal('view', scheme)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                    aria-label="View scheme details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openModal('edit', scheme)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Scheme"
                    aria-label="Edit scheme"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(scheme)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Scheme"
                    aria-label="Delete scheme"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Duration</span>
                  </div>
                  <span className="font-medium text-gray-900 text-xs">{scheme.months} months</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DirhamIcon color="gray" size="medium" />
                    <span className="text-xs text-gray-600">Monthly Pay</span>
                  </div>
                  <span className="font-medium text-gray-900 text-xs flex items-center gap-1">
                    <DirhamIcon color="black" size="small" />
                    {(scheme.monthly_pay).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DirhamIcon color="gray" size="medium" />
                    <span className="text-xs text-gray-600">Total Amount</span>
                  </div>
                  <span className="font-medium text-gray-900 text-xs flex items-center gap-1">
                    <DirhamIcon color="black" size="small" />
                    {scheme.amount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Bonus</span>
                  </div>
                  <span className="font-medium text-green-600 text-xs flex items-center gap-1">
                    <DirhamIcon color="black" size="small" />
                    {scheme.bonus}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredSchemes.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <DollarSign className="mx-auto w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">No schemes found</h3>
          <p className="text-xs text-gray-500 mb-4">
            {searchTerm || filterActive !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first scheme to get started.'}
          </p>
          {(searchTerm || filterActive !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterActive('all');
              }}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Clear Search and Filters
            </button>
          )}
          {!searchTerm && filterActive === 'all' && (
            <button
              onClick={() => openModal('create')}
              className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Scheme</span>
            </button>
          )}
        </div>
      )}

      {/* Main Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-white rounded-lg border border-gray-200 shadow-lg p-5 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-900">
                  {modalMode === 'create' ? 'Create New Scheme' : modalMode === 'edit' ? 'Edit Scheme' : 'Scheme Details'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Scheme Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${errors.name ? 'border-red-500' : 'border-gray-300'
                      } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                    placeholder="Enter scheme name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-red-500 text-xs mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Months</label>
                    <input
                      type="number"
                      value={formData.months}
                      onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${errors.months ? 'border-red-500' : 'border-gray-300'
                        } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                      placeholder="24"
                      aria-invalid={!!errors.months}
                      aria-describedby={errors.months ? 'months-error' : undefined}
                    />
                    {errors.months && (
                      <p id="months-error" className="text-red-500 text-xs mt-1">
                        {errors.months}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${errors.amount ? 'border-red-500' : 'border-gray-300'
                        } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                      placeholder="1500"
                      aria-invalid={!!errors.amount}
                      aria-describedby={errors.amount ? 'amount-error' : undefined}
                    />
                    {errors.amount && (
                      <p id="amount-error" className="text-red-500 text-xs mt-1">
                        {errors.amount}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Pay</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly_pay}
                      onChange={(e) => setFormData({ ...formData, monthly_pay: e.target.value })}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${errors.monthly_pay ? 'border-red-500' : 'border-gray-300'
                        } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                      placeholder="62.5"
                      aria-invalid={!!errors.monthly_pay}
                      aria-describedby={errors.monthly_pay ? 'monthly_pay-error' : undefined}
                    />
                    {errors.monthly_pay && (
                      <p id="monthly_pay-error" className="text-red-500 text-xs mt-1">
                        {errors.monthly_pay}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bonus</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${errors.bonus ? 'border-red-500' : 'border-gray-300'
                        } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                      placeholder="150"
                      aria-invalid={!!errors.bonus}
                      aria-describedby={errors.bonus ? 'bonus-error' : undefined}
                    />
                    {errors.bonus && (
                      <p id="bonus-error" className="text-red-500 text-xs mt-1">
                        {errors.bonus}
                      </p>
                    )}
                  </div>
                </div>
                {modalMode !== 'view' && (
                  <div className="flex space-x-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="flex-1 px-3 py-1.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs"
                    >
                      {loading ? 'Processing...' : modalMode === 'create' ? 'Create' : 'Update'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-5 w-full max-w-md mx-4 border border-gray-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-red-100">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900">Confirm Delete</h3>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Are you sure you want to delete "{schemeToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scheme;