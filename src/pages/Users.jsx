import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, X, Save, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { fetchUsers, deleteUser, updateUser, addUser, blockUser } from '../api/api';

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
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_no: '',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user =>
      (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile_no.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchUsers();
      if (!response.success) {
        const usersData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        showNotification('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Error fetching users', 'error');
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
      first_name: '',
      last_name: '',
      email: '',
      mobile_no: '',
      password: ''
    });
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
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      const response = await deleteUser(userId);
      console.log('Delete response:', response);
      if (!response.success) {
        showNotification('User deleted successfully');
        loadUsers(); // Refresh the users list
      } else {
        showNotification('Failed to delete user', 'error');
      }
    } catch (error) {
      showNotification('Failed to delete user', 'error');
    } finally {
      setLoading(false);
      setConfirmModal({ isOpen: false, type: '', user: null });
    }
  };

  // New function to handle block/unblock user
  const handleBlockUnblockUser = async (user) => {
    const newStatus = user.is_active ? 'inactive' : 'active';
    
    setLoading(true);
    try {
      const blockData = {
        id: user._id,
        status: newStatus
      };
      
      const response = await blockUser(blockData);
      console.log('Block/Unblock response:', response);
      
      if (!response.success) {
        const action = user.is_active ? 'blocked' : 'unblocked';
        showNotification(`User ${action} successfully`);
        loadUsers(); // Refresh the users list
      } else {
        const action = user.is_active ? 'block' : 'unblock';
        showNotification(`Failed to ${action} user`, 'error');
      }
    } catch (error) {
      const action = user.is_active ? 'blocking' : 'unblocking';
      console.error(`Error ${action} user:`, error);
      showNotification(`Failed to ${action.replace('ing', '')} user`, 'error');
    } finally {
      setLoading(false);
      setConfirmModal({ isOpen: false, type: '', user: null });
    }
  };

  // Function to open confirmation modal
  const openConfirmModal = (type, user) => {
    setConfirmModal({ isOpen: true, type, user });
  };

  // Function to handle confirmation
  const handleConfirm = () => {
    const { type, user } = confirmModal;
    if (type === 'delete') {
      handleDeleteUser(user._id);
    } else if (type === 'block' || type === 'unblock') {
      handleBlockUnblockUser(user);
    }
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      showNotification('First name is required', 'error');
      return false;
    }
    if (!formData.last_name.trim()) {
      showNotification('Last name is required', 'error');
      return false;
    }
    if (!formData.email.trim()) {
      showNotification('Email is required', 'error');
      return false;
    }
    if (!formData.mobile_no.trim()) {
      showNotification('Mobile number is required', 'error');
      return false;
    }
    if (!editingUser && !formData.password.trim()) {
      showNotification('Password is required', 'error');
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
        // Update existing user
        const updateData = {
          id: editingUser._id,
          status: editingUser.is_active,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          mobile_no: formData.mobile_no
        };
        response = await updateUser(updateData);
      } else {
        // Add new user
        response = await addUser(formData);
      }

      if (!response.success) {
        showNotification(response.message || `User ${editingUser ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        resetForm();
        loadUsers(); // Refresh the users list
      } else {
        showNotification(response.message || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification('Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleNavigate = (id) => {
    navigate(`/users/user-details/${id}`); 
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={handleAddUser}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading users...</p>
          </div>
        ) : (
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
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleNavigate(user._id)} >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {(user.first_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.mobile_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded disabled:opacity-50"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openConfirmModal(user.is_active ? 'block' : 'unblock', user)}
                          disabled={loading}
                          className={`px-3 py-1 text-xs font-medium rounded disabled:opacity-50 transition-colors ${
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
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {loading ? 'Processing...' : (editingUser ? 'Update' : 'Add')} User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full border-2 border-gray-300 shadow-lg max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-full ${
                confirmModal.type === 'delete' ? 'bg-red-100' : 
                confirmModal.type === 'block' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                {confirmModal.type === 'delete' ? 
                  <Trash2 className={`w-5 h-5 text-red-600`} /> :
                  confirmModal.type === 'block' ? 
                    <AlertCircle className="w-5 h-5 text-orange-600" /> :
                    <Check className="w-5 h-5 text-green-600" />
                }
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmModal.type === 'delete' ? 'Delete User' : 
                   confirmModal.type === 'block' ? 'Block User' : 'Unblock User'}
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                {confirmModal.type === 'delete' 
                  ? `Are you sure you want to delete "${confirmModal.user?.first_name} ${confirmModal.user?.last_name}"? This action cannot be undone.`
                  : confirmModal.type === 'block'
                    ? `Are you sure you want to block "${confirmModal.user?.first_name} ${confirmModal.user?.last_name}"? They won't be able to access their account.`
                    : `Are you sure you want to unblock "${confirmModal.user?.first_name} ${confirmModal.user?.last_name}"? They will regain access to their account.`
                }
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: '', user: null })}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                  confirmModal.type === 'block' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : 
                 confirmModal.type === 'delete' ? 'Delete' : 
                 confirmModal.type === 'block' ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;