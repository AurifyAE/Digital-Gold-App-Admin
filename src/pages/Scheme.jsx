import React, { useState, useEffect } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { fetchScheme, addScheme, editScheme, deleteScheme } from '../api/api';

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
        bonus: ''
    });
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [schemeToDelete, setSchemeToDelete] = useState(null);

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        setLoading(true);
        try {
            const response = await fetchScheme();
            if (!response.success) {
                setSchemes(response.data.data);
            } else {
                showNotification(response.message || 'Error fetching schemes', 'error');
            }
        } catch (error) {
            showNotification('Error fetching schemes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            months: '',
            monthly_pay: '',
            amount: '',
            bonus: ''
        });
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Scheme name is required';
        if (!formData.months || formData.months <= 0) newErrors.months = 'Valid months required';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount required';
        // Monthly pay is calculated and not edited, so skip validation for create
        if (modalMode !== 'create' && (!formData.monthly_pay || formData.monthly_pay <= 0))
            newErrors.monthly_pay = 'Valid monthly pay required';
        if (!formData.bonus || formData.bonus < 0) newErrors.bonus = 'Valid bonus required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Auto-calculate monthly_pay in create/edit mode on amount/months change
    useEffect(() => {
        if (modalMode === 'create' || modalMode === 'edit') {
            const months = parseInt(formData.months);
            const amount = parseFloat(formData.amount);
            if (months > 0 && amount > 0) {
                setFormData(prev => ({
                    ...prev,
                    monthly_pay: (amount / months).toFixed(2)
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    monthly_pay: ''
                }));
            }
        }
        // eslint-disable-next-line
    }, [formData.months, formData.amount, modalMode]);

    // Set up formData when modal opens
    useEffect(() => {
        if (showModal) {
            if (selectedScheme && (modalMode === 'edit' || modalMode === 'view')) {
                setFormData({
                    name: selectedScheme.name,
                    months: selectedScheme.months.toString(),
                    monthly_pay: selectedScheme.monthly_pay.toString(),
                    amount: selectedScheme.amount.toString(),
                    bonus: selectedScheme.bonus.toString()
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
                bonus: parseFloat(formData.bonus)
            };

            // Always recalc monthly_pay on submit (for both create & edit)
            schemeData.monthly_pay = schemeData.amount / schemeData.months;

            let response;
            if (modalMode === 'create') {
                response = await addScheme(schemeData);
            } else if (modalMode === 'edit') {
                response = await editScheme(selectedScheme._id, schemeData);
            }

            if (!response.success) {
                showNotification(response.message || 'Operation successful');
                setShowModal(false);
                resetForm();
                fetchSchemes();
            } else {
                showNotification(response.message || 'Operation failed', 'error');
            }
        } catch (error) {
            showNotification('Operation failed', 'error');
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
                showNotification(response.message || 'Scheme deleted');
                fetchSchemes();
            } else {
                showNotification(response.message || 'Delete failed', 'error');
            }
        } catch (error) {
            showNotification('Delete failed', 'error');
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

    const filteredSchemes = schemes.filter(scheme => {
        const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterActive === 'all' ||
            (filterActive === 'active' && scheme.is_active) ||
            (filterActive === 'inactive' && !scheme.is_active);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                    <div className="flex items-center space-x-2">
                        {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheme Management</h1>
                <p className="text-gray-600">Create and manage investment schemes</p>
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
                                placeholder="Search schemes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-300"
                            />
                        </div>

                        {/* Filter */}
                        <div className="relative">
                            <select
                                value={filterActive}
                                onChange={(e) => setFilterActive(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-gray-300"
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
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Scheme</span>
                    </button>
                </div>
            </div>

            {/* Schemes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {loading && schemes.length === 0 ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    filteredSchemes.map((scheme) => (
                        <div key={scheme._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{scheme.name}</h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scheme.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {scheme.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => openModal('view', scheme)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openModal('edit', scheme)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit Scheme"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(scheme)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Scheme"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Duration</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{scheme.months} months</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Monthly Pay</span>
                                    </div>
                                    <span className="font-medium text-gray-900">₹{(scheme.monthly_pay).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Total Amount</span>
                                    </div>
                                    <span className="font-medium text-gray-900">₹{scheme.amount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Gift className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Bonus</span>
                                    </div>
                                    <span className="font-medium text-green-600">₹{scheme.bonus}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Empty State */}
            {!loading && filteredSchemes.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <DollarSign className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No schemes found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first scheme to get started.'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => openModal('create')}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create First Scheme</span>
                        </button>
                    )}
                </div>
            )}

            {/* Main Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block w-full max-w-md border-2 border-gray-300 p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {modalMode === 'create' ? 'Create New Scheme' :
                                        modalMode === 'edit' ? 'Edit Scheme' : 'Scheme Details'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scheme Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={modalMode === 'view'}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                        placeholder="Enter scheme name"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Months
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.months}
                                            onChange={(e) => setFormData({ ...formData, months: e.target.value })}
                                            disabled={modalMode === 'view'}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.months ? 'border-red-300' : 'border-gray-300'
                                                } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                            placeholder="24"
                                        />
                                        {errors.months && <p className="text-red-500 text-xs mt-1">{errors.months}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total Amount
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            disabled={modalMode === 'view'}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.amount ? 'border-red-300' : 'border-gray-300'
                                                } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                            placeholder="1500"
                                        />
                                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monthly Pay
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.monthly_pay}
                                            onChange={(e) => setFormData({ ...formData, monthly_pay: e.target.value })}
                                            disabled={modalMode === 'view' || modalMode === 'create'}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.monthly_pay ? 'border-red-300' : 'border-gray-300'
                                                } ${modalMode === 'view' || modalMode === 'create' ? 'bg-gray-50' : ''}`}
                                            placeholder="62.5"
                                        />
                                        {errors.monthly_pay && <p className="text-red-500 text-xs mt-1">{errors.monthly_pay}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bonus
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.bonus}
                                            onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                                            disabled={modalMode === 'view'}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.bonus ? 'border-red-300' : 'border-gray-300'
                                                } ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                                            placeholder="150"
                                        />
                                        {errors.bonus && <p className="text-red-500 text-xs mt-1">{errors.bonus}</p>}
                                    </div>
                                </div>
                                {modalMode !== 'view' && (
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : (modalMode === 'create' ? 'Create' : 'Update')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteConfirm(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block w-full max-w-md p-6 my-8 border-2 border-gray-300 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete "{schemeToDelete?.name}"? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scheme;
