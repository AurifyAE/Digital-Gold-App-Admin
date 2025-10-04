import React, { useState, useEffect } from 'react';
import { Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  // Sample user data - in a real app, this would come from props or state
  const [user, setUser] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'Software Developer',
  });
  const [loading, setLoading] = useState(false); // For async data fetching
  const [error, setError] = useState(null);

  // Simulate async data fetching (replace with actual API call in a real app)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        // const response = await fetchUser();
        // if (response.success) {
        //   setUser(response.data);
        // } else {
        //   setError(response.message || 'Failed to fetch user data');
        // }
        // For demo, use static data
        setUser({
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          role: 'Software Developer',
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Skeleton Loader Component
  const SkeletonProfile = () => (
    <div className="bg-white rounded-lg border border-gray-200 max-w-6xl my-6 mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-1/3 bg-gray-200 p-6 flex items-center justify-center">
          <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
        </div>
        <div className="w-full sm:w-2/3 p-6 flex flex-col justify-center space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto my-6 px-4">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg bg-red-500 text-white text-xs font-medium flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <SkeletonProfile />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-6xl"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Left Side - Profile Avatar */}
            <div className="w-full sm:w-1/3 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 p-6 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-blue-100 flex items-center justify-center">
                <User className="w-16 h-16 text-blue-600" />
              </div>
            </div>

            {/* Right Side - Profile Details */}
            <div className="w-full sm:w-2/3 p-6 flex flex-col justify-center">
              {/* User Info */}
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900 mb-1">{user.name || 'N/A'}</h1>
                <p className="text-sm text-gray-500">{user.role || 'N/A'}</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!user.name || !user.email}
                  title={!user.name || !user.email ? 'Profile data incomplete' : 'Edit Profile'}
                  aria-label="Edit Profile"
                >
                  Edit Profile
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;