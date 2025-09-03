// components/Statistics/ProPlan.js
import React from 'react';

const ProPlan = () => (
  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          $9.99 <span className="text-sm font-normal text-gray-600">p/m</span>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-1">Pro Plan</div>
        <div className="text-sm text-gray-600">More productivity with premium</div>
      </div>
      <div className="w-20 h-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 90,90 10,90" fill="#f97316" opacity="0.8" />
          <polygon points="30,30 70,30 50,70" fill="#3b82f6" opacity="0.6" />
          <circle cx="35" cy="45" r="8" fill="#ef4444" opacity="0.7" />
          <circle cx="65" cy="45" r="6" fill="#10b981" opacity="0.8" />
        </svg>
      </div>
    </div>
  </div>
);

export default ProPlan;