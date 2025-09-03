import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Profile = () => {
  // Sample user data - in a real app, this would come from props or state
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-6xl my-6 mx-auto">
      <div className="flex">
        {/* Left Side - Profile Image */}
        <div className="w-1/3 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 p-8 flex items-center justify-center">
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-48 h-48 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>
        
        {/* Right Side - Profile Details */}
        <div className="w-2/3 p-8 flex flex-col justify-center">
          {/* User Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-lg text-gray-500">Software Developer</p>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="text-gray-900 font-medium text-lg">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Phone</p>
                <p className="text-gray-900 font-medium text-lg">{user.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                <p className="text-gray-900 font-medium text-lg">{user.location}</p>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          <div>
            <button className="bg-blue-600 text-white py-3 px-8 rounded-xl font-medium hover:bg-blue-700 transition-colors text-lg">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;