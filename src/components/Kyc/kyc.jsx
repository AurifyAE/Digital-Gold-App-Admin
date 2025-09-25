import React, { useState, useEffect } from 'react';
import { fetchPendingKYC, updateKYCStatus } from '../../api/api';
import { CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, Mail, User, X } from 'lucide-react';

const KYC = () => {
    const [kycApplications, setKycApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [actionType, setActionType] = useState(''); // 'accept' or 'reject'

    useEffect(() => {
        loadPendingKYC();
    }, []);

    const loadPendingKYC = async () => {
        try {
            setLoading(true);
            const response = await fetchPendingKYC();
            // console.log('API Response:', response); // Debug log
            
            // Handle different response structures
            let applications = [];
            if (response && response.data && Array.isArray(response.data)) {
                applications = response.data;
            } 
            
            setKycApplications(response.data.data || []); 
            setError(null);
        } catch (err) {
            setError('Failed to fetch KYC applications');
            setKycApplications([]); 
            console.error('Error fetching KYC:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const handleAccept = (application) => {
        setSelectedApplication(application);
        setActionType('accept');
        // For accept, we can proceed directly or show confirmation
        processApplication(application, 'approved');
    };

    const handleReject = (application) => {
        setSelectedApplication(application);
        setActionType('reject');
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const processApplication = async (application, status, reason = null) => {
        if (processing) return;
        
        try {
            setProcessing(true);
            console.log(`${status === 'approved' ? 'Accepting' : 'Rejecting'} KYC:`, application._id);
            if (reason) console.log('Reason:', reason);
            
            // Since there's no separate API, you might need to call a general update API
            await updateKYCStatus(application._id, status, reason);
            
            // Update local state to remove the processed application
            setKycApplications(prev => prev.filter(app => app._id !== application._id));
            
            // Close modals
            setShowRejectModal(false);
            setSelectedApplication(null);
            setRejectionReason('');
            
        } catch (err) {
            console.error(`Error ${status === 'approved' ? 'accepting' : 'rejecting'} KYC:`, err);
            alert(`Failed to ${status === 'approved' ? 'accept' : 'reject'} KYC application`);
        } finally {
            setProcessing(false);
        }
    };

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading KYC applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={loadPendingKYC}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">KYC Applications</h1>
                    <p className="text-gray-600 mt-2">Review and manage pending KYC applications</p>
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                        <p className="text-blue-700">
                            <span className="font-semibold">{Array.isArray(kycApplications) ? kycApplications.length : 0}</span> pending applications
                        </p>
                    </div>
                </div>

                {!Array.isArray(kycApplications) || kycApplications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No pending applications</h3>
                        <p className="text-gray-600">All KYC applications have been processed.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Applicant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Emirates ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Applied Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {kycApplications.map((application) => (
                                        <tr key={application._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {application.user.first_name} {application.user.last_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 capitalize">
                                                            {application.user.gender}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-gray-900">{application.emirates_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{application.user.mobile_no}</div>
                                                <div className="text-sm text-gray-500">{application.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(application.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 capitalize">
                                                    {application.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(application)}
                                                        className="text-blue-600 hover:text-blue-900 p-1"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAccept(application)}
                                                        disabled={processing}
                                                        className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                                                        title="Accept"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(application)}
                                                        disabled={processing}
                                                        className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
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
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">
                                KYC Application Details
                            </h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-600">Name:</span>
                                                <span className="ml-2 font-medium">{selectedApplication.user.first_name} {selectedApplication.user.last_name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-600">Emirates ID:</span>
                                                <span className="ml-2 font-mono font-medium">{selectedApplication.emirates_id}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-600">Date of Birth:</span>
                                                <span className="ml-2">{formatDate(selectedApplication.user.date_of_birth)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-600">Gender:</span>
                                                <span className="ml-2 capitalize">{selectedApplication.user.gender}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-600">Phone:</span>
                                                <span className="ml-2">{selectedApplication.user.mobile_no}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-600">Email:</span>
                                                <span className="ml-2">{selectedApplication.user.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <span className="text-gray-600">Applied On:</span>
                                                <span className="ml-2">{formatDate(selectedApplication.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                        <div className="space-y-1">
                                            <div className="font-medium">{selectedApplication.address.street}</div>
                                            <div>{selectedApplication.address.district}, {selectedApplication.address.city}</div>
                                            <div>{selectedApplication.address.state}, {selectedApplication.address.country}</div>
                                            <div>Postal Code: {selectedApplication.address.postal_code}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Document Images</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Emirates ID - Front</p>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600 break-all">
                                                {selectedApplication.emirates_id_front_img}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Emirates ID - Back</p>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600 break-all">
                                                {selectedApplication.emirates_id_back_img}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    handleReject(selectedApplication);
                                }}
                                disabled={processing}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    handleAccept(selectedApplication);
                                }}
                                disabled={processing}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Reject KYC Application
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting the KYC application for{' '}
                            <span className="font-medium">
                                {selectedApplication.user.first_name} {selectedApplication.user.last_name}
                            </span>
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={confirmReject}
                                disabled={!rejectionReason.trim() || processing}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedApplication(null);
                                    setRejectionReason('');
                                }}
                                disabled={processing}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KYC;