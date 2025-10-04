import React, { useState, useEffect } from 'react';
import { fetchPendingKYC, updateKYCStatus } from '../../api/api';
import { CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, Mail, User, X, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KYC = () => {
    const [kycApplications, setKycApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [imageModal, setImageModal] = useState(null);

    useEffect(() => {
        loadPendingKYC();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [searchQuery, kycApplications]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000); // Match Scheme and Payments timeout
    };

    const loadPendingKYC = async () => {
        try {
            setLoading(true);
            const response = await fetchPendingKYC();
            
            let applications = [];
            if (response?.data?.data && Array.isArray(response.data.data)) {
                applications = response.data.data;
            } else if (response?.data && Array.isArray(response.data)) {
                applications = response.data;
            }
            
            setKycApplications(applications);
            setFilteredApplications(applications);
            
            if (applications.length === 0) {
                showToast('No pending KYC applications found', 'info');
            }
        } catch (err) {
            console.error('Error fetching KYC:', err);
            showToast(err.response?.data?.message || 'Failed to fetch KYC applications. Please try again.', 'error');
            setKycApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        if (!searchQuery.trim()) {
            setFilteredApplications(kycApplications);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = kycApplications.filter(app => {
            const fullName = `${app.user.first_name} ${app.user.last_name}`.toLowerCase();
            const emiratesId = app.emirates_id.toLowerCase();
            const email = app.user.email.toLowerCase();
            const mobile = app.user.mobile_no.toLowerCase();
            
            return fullName.includes(query) || 
                   emiratesId.includes(query) || 
                   email.includes(query) || 
                   mobile.includes(query);
        });

        setFilteredApplications(filtered);
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const handleAccept = (application) => {
        setSelectedApplication(application);
        processApplication(application, 'approved');
    };

    const handleReject = (application) => {
        setSelectedApplication(application);
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const processApplication = async (application, status, reason = null) => {
        if (processing) return;
        
        try {
            setProcessing(true);
            await updateKYCStatus(application._id, status, reason);
            
            setKycApplications(prev => prev.filter(app => app._id !== application._id));
            setFilteredApplications(prev => prev.filter(app => app._id !== application._id));
            
            showToast(
                `KYC application ${status === 'approved' ? 'approved' : 'rejected'} successfully for ${application.user.first_name} ${application.user.last_name}`,
                'success'
            );
            
            setShowRejectModal(false);
            setShowDetailsModal(false);
            setSelectedApplication(null);
            setRejectionReason('');
            
        } catch (err) {
            console.error(`Error ${status === 'approved' ? 'accepting' : 'rejecting'} KYC:`, err);
            showToast(
                err.response?.data?.message || `Failed to ${status === 'approved' ? 'approve' : 'reject'} KYC application. Please try again.`,
                'error'
            );
        } finally {
            setProcessing(false);
        }
    };

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            showToast('Please provide a reason for rejection', 'warning');
            return;
        }
        processApplication(selectedApplication, 'rejected', rejectionReason);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleImageClick = (imageUrl, title) => {
        setImageModal({ url: imageUrl, title });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
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
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">KYC Management</h1>
                            <p className="text-xs text-gray-500 mt-1">Review and manage pending KYC applications</p>
                        </div>
                        <button
                            onClick={loadPendingKYC}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users by name, email, or mobile..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-9 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-300 text-xs"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {filteredApplications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                        <div className="text-gray-300 text-6xl mb-3">📋</div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">
                            {searchQuery ? 'No matching applications found' : 'No applications found.'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {searchQuery ? 'Try adjusting your search criteria' : 'All KYC applications have been processed'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mobile
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredApplications.map((application) => (
                                        <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-600 font-medium text-xs">
                                                                {application.user.first_name[0]}{application.user.last_name[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {application.user.first_name} {application.user.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {application.user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{application.user.mobile_no}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 capitalize">
                                                    {application.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(application.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(application)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAccept(application)}
                                                        disabled={processing}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Accept"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(application)}
                                                        disabled={processing}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">KYC Application Details</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedApplication.user.first_name} {selectedApplication.user.last_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-5">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-600" />
                                        Personal Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <User className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-500 block">Full Name</span>
                                                <span className="text-sm font-medium text-gray-900">{selectedApplication.user.first_name} {selectedApplication.user.last_name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <User className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-500 block">Emirates ID</span>
                                                <span className="text-sm font-mono font-medium text-gray-900">{selectedApplication.emirates_id}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-500 block">Date of Birth</span>
                                                <span className="text-sm text-gray-900">{formatDate(selectedApplication.user.date_of_birth)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <User className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-500 block">Gender</span>
                                                <span className="text-sm capitalize text-gray-900">{selectedApplication.user.gender}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Phone className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-500 block">Phone</span>
                                                <span className="text-sm text-gray-900">{selectedApplication.user.mobile_no}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Mail className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-500 block">Email</span>
                                                <span className="text-sm text-gray-900 break-all">{selectedApplication.user.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-gray-500 block">Applied On</span>
                                                <span className="text-sm text-gray-900">{formatDate(selectedApplication.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                                        Address Information
                                    </h4>
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900">{selectedApplication.address.street}</div>
                                            <div className="text-sm text-gray-700">{selectedApplication.address.district}</div>
                                            <div className="text-sm text-gray-700">{selectedApplication.address.city}</div>
                                            <div className="text-sm text-gray-700">{selectedApplication.address.state}</div>
                                            <div className="text-sm text-gray-700">{selectedApplication.address.country}</div>
                                            <div className="text-xs text-gray-600 mt-2">
                                                <span className="font-medium">Postal:</span> {selectedApplication.address.postal_code}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-4">Document Images</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 mb-2">Emirates ID - Front</p>
                                        <button
                                            onClick={() => handleImageClick(selectedApplication.emirates_id_front_img, 'Emirates ID - Front')}
                                            className="w-full border border-gray-200 rounded-lg p-4 text-center bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                                        >
                                            <Eye className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
                                            <p className="text-xs text-gray-600 font-medium">Click to view</p>
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-700 mb-2">Emirates ID - Back</p>
                                        <button
                                            onClick={() => handleImageClick(selectedApplication.emirates_id_back_img, 'Emirates ID - Back')}
                                            className="w-full border border-gray-200 rounded-lg p-4 text-center bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                                        >
                                            <Eye className="w-8 h-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
                                            <p className="text-xs text-gray-600 font-medium">Click to view</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    handleReject(selectedApplication);
                                }}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    handleAccept(selectedApplication);
                                }}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {imageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[55]" onClick={() => setImageModal(null)}>
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 right-0 m-4 z-10">
                            <button
                                onClick={() => setImageModal(null)}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="bg-gray-800 text-white px-4 py-3">
                                <h3 className="text-sm font-medium">{imageModal.title}</h3>
                            </div>
                            <img 
                                src={imageModal.url} 
                                alt={imageModal.title}
                                className="w-full h-auto"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="bg-red-600 text-white p-4 rounded-t-lg">
                            <h3 className="text-base font-semibold">Reject KYC Application</h3>
                        </div>
                        
                        <div className="p-5">
                            <p className="text-sm text-gray-600 mb-4">
                                You are about to reject the KYC application for{' '}
                                <span className="font-medium text-gray-900">
                                    {selectedApplication.user.first_name} {selectedApplication.user.last_name}
                                </span>
                            </p>
                            <div className="mb-2">
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a detailed reason for rejection..."
                                    className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 p-5 bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedApplication(null);
                                    setRejectionReason('');
                                }}
                                disabled={processing}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={!rejectionReason.trim() || processing}
                                className="flex-1 bg-red-600 text-white py-2 px-4 text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </span>
                                ) : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KYC;