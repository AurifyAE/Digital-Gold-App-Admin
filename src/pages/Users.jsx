import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, X, Save, Eye, EyeOff, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchUsers, deleteUser, updateUser, addUser, blockUser } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion'; // For animations

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', user: null });
  const [errors, setErrors] = useState({}); // For form validation errors
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // Separate loading state for user fetching
  const modalRef = useRef(null); // For focus trapping

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedUsers, setPaginatedUsers] = useState([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_no: '',
    password: '',
    date_of_birth: '',
    gender: '',
  });
  const navigate = useNavigate();

  // Focus trapping for modal accessibility
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
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
          setIsModalOpen(false);
        }
      };

      modalRef.current.addEventListener('keydown', handleKeyDown);
      firstElement.focus();

      return () => modalRef.current?.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen]);

  // Fetch users
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile_no.includes(searchTerm)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredUsers.slice(startIndex, endIndex);

    setPaginatedUsers(paginated);
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
  }, [filteredUsers, currentPage, itemsPerPage]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetchUsers();
      if (!response.success) {
        const usersData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        showNotification(response.data?.message || 'Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification(
        error.response?.data?.message || 'Network error. Please check your connection and try again.',
        'error'
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      mobile_no: '',
      password: '',
      date_of_birth: '',
      gender: '',
    });
    setErrors({});
  };

  const handleAddUser = () => {
    setEditingUser(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      mobile_no: user.mobile_no || '',
      password: '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      const response = await deleteUser(userId);
      if (!response.success) {
        showNotification('User deleted successfully');
        loadUsers();
      } else {
        showNotification(response.data?.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification(
        error.response?.data?.message || 'Network error while deleting user.',
        'error'
      );
    } finally {
      setLoading(false);
      setConfirmModal({ isOpen: false, type: '', user: null });
    }
  };

  const handleBlockUnblockUser = async (user) => {
    const newStatus = user.is_active ? 'inactive' : 'active';
    setLoading(true);
    try {
      const blockData = {
        id: user._id,
        status: newStatus,
      };
      const response = await blockUser(blockData);
      if (!response.success) {
        const action = user.is_active ? 'blocked' : 'unblocked';
        showNotification(`User ${action} successfully`);
        loadUsers();
      } else {
        const action = user.is_active ? 'block' : 'unblock';
        showNotification(response.data?.message || `Failed to ${action} user`, 'error');
      }
    } catch (error) {
      console.error(`Error ${user.is_active ? 'blocking' : 'unblocking'} user:`, error);
      showNotification(
        error.response?.data?.message || `Network error while ${user.is_active ? 'blocking' : 'unblocking'} user`,
        'error'
      );
    } finally {
      setLoading(false);
      setConfirmModal({ isOpen: false, type: '', user: null });
    }
  };

  const openConfirmModal = (type, user) => {
    setConfirmModal({ isOpen: true, type, user });
  };

  const handleConfirm = () => {
    const { type, user } = confirmModal;
    if (type === 'delete') {
      handleDeleteUser(user._id);
    } else if (type === 'block' || type === 'unblock') {
      handleBlockUnblockUser(user);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.mobile_no.trim()) newErrors.mobile_no = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobile_no)) newErrors.mobile_no = 'Mobile number must be 10 digits';
    if (!editingUser && !formData.password.trim()) newErrors.password = 'Password is required';
    else if (!editingUser && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.date_of_birth.trim()) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender.trim()) newErrors.gender = 'Gender is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showNotification('Please fix the form errors', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      if (editingUser) {
        const updateData = {
          id: editingUser._id,
          status: editingUser.is_active,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          mobile_no: formData.mobile_no,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
        };
        if (formData.password) updateData.password = formData.password;
        response = await updateUser(updateData);
      } else {
        response = await addUser(formData);
      }

      if (!response.success) {
        showNotification(`User ${editingUser ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        resetForm();
        loadUsers();
      } else {
        showNotification(response.data?.message || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification(
        error.response?.data?.message || 'Network error. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on input change
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const handleNavigate = (id) => {
    navigate(`/users/user-details/${id}`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
    </tr>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="text-xs text-gray-500 mt-1">Create and manage users</p>
          </div>
          <button
            onClick={handleAddUser}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-300 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Show:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-300 text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-gray-600">per page</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoadingUsers ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleNavigate(user._id)}>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-xs">
                              {(user.first_name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-xs font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {user.mobile_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(user.is_active)}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded disabled:opacity-50"
                            title="Edit User"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => openConfirmModal(user.is_active ? 'block' : 'unblock', user)}
                            disabled={loading}
                            className={`px-2 py-0.5 text-xs font-medium rounded disabled:opacity-50 transition-colors ${
                              user.is_active
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.is_active ? 'Block' : 'Unblock'}
                          </button>
                          <button
                            onClick={() => openConfirmModal('delete', user)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-700">Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-gray-300"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="text-xs text-gray-700">
                    {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)}-
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="First page"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                        </svg>
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
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Next page"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Last page"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!isLoadingUsers && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xs">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-xs"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg border border-gray-200 shadow-lg p-5 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={!!errors.first_name}
                      aria-describedby={errors.first_name ? 'first_name-error' : undefined}
                    />
                    {errors.first_name && (
                      <p id="first_name-error" className="text-red-500 text-xs mt-1">
                        {errors.first_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      aria-invalid={!!errors.last_name}
                      aria-describedby={errors.last_name ? 'last_name-error' : undefined}
                    />
                    {errors.last_name && (
                      <p id="last_name-error" className="text-red-500 text-xs mt-1">
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile_no"
                    value={formData.mobile_no}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${
                      errors.mobile_no ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!errors.mobile_no}
                    aria-describedby={errors.mobile_no ? 'mobile_no-error' : undefined}
                  />
                  {errors.mobile_no && (
                    <p id="mobile_no-error" className="text-red-500 text-xs mt-1">
                      {errors.mobile_no}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${
                      errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!errors.date_of_birth}
                    aria-describedby={errors.date_of_birth ? 'date_of_birth-error' : undefined}
                  />
                  {errors.date_of_birth && (
                    <p id="date_of_birth-error" className="text-red-500 text-xs mt-1">
                      {errors.date_of_birth}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!errors.gender}
                    aria-describedby={errors.gender ? 'gender-error' : undefined}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p id="gender-error" className="text-red-500 text-xs mt-1">
                      {errors.gender}
                    </p>
                  )}
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-1.5 pr-10 border rounded-lg focus:outline-none focus:border-gray-300 text-xs ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                    className="px-3 py-1.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs"
                  >
                    <Save size={14} />
                    {loading ? 'Processing...' : editingUser ? 'Update' : 'Add'} User
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-5 w-full max-w-md mx-4 border border-gray-200 shadow-lg"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div
                  className={`p-2 rounded-full ${
                    confirmModal.type === 'delete'
                      ? 'bg-red-100'
                      : confirmModal.type === 'block'
                      ? 'bg-orange-100'
                      : 'bg-green-100'
                  }`}
                >
                  {confirmModal.type === 'delete' ? (
                    <Trash2 className="w-4 h-4 text-red-600" />
                  ) : confirmModal.type === 'block' ? (
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {confirmModal.type === 'delete' ? 'Delete User' : confirmModal.type === 'block' ? 'Block User' : 'Unblock User'}
                </h3>
              </div>

              <p className="text-gray-600 text-xs mb-4">
                {confirmModal.type === 'delete'
                  ? `Are you sure you want to delete "${confirmModal.user?.first_name} ${confirmModal.user?.last_name}"? This action cannot be undone.`
                  : confirmModal.type === 'block'
                  ? `Are you sure you want to block "${confirmModal.user?.first_name} ${confirmModal.user?.last_name}"? They won't be able to access their account.`
                  : `Are you sure you want to unblock "${confirmModal.user?.first_name} ${confirmModal.user?.last_name}"? They will regain access to their account.`}
              </p>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, type: '', user: null })}
                  disabled={loading}
                  className="px-3 py-1.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`px-3 py-1.5 text-white rounded-lg transition-colors disabled:opacity-50 text-xs ${
                    confirmModal.type === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmModal.type === 'block'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Processing...' : confirmModal.type === 'delete' ? 'Delete' : confirmModal.type === 'block' ? 'Block' : 'Unblock'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;