// components/Common/Logo.js
import React from 'react';
import { BarChart3 } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
      <BarChart3 className="w-5 h-5 text-white" />
    </div>
    <span className="text-xl font-bold text-gray-900">Chart</span>
  </div>
);

export default Logo;