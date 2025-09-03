// components/Common/UserProfile.js
import React from 'react';

const UserProfile = ({ user }) => (
  <div className="flex items-center space-x-3">
    <div className="relative">
      <img
        src={user.avatar}
        className="w-14 h-14 rounded-full bg-gray-200"
      />
      {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
        <span className="text-xs text-white font-medium">{user.notifications}</span>
      </div> */}
    </div>
    <div>
      <p className="font-semibold text-gray-900">{user.name}</p>
      <p className="text-sm text-gray-600">{user.email}</p>
      <div className="flex items-center space-x-1 mt-1">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="text-xs text-gray-500">{user.status}</span>
      </div>
    </div>
  </div>
);

export default UserProfile;