// components/Statistics/Statistics.js
import React from 'react';
import ProPlan from './ProPlan';

const Statistics = () => (
  <div className="bg-white rounded-2xl p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistics</h2>
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">28 h</div>
        <div className="text-sm text-gray-600">Tracked time</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">18</div>
        <div className="text-sm text-gray-600">Finished tasks</div>
      </div>
      <div className="text-center flex items-center justify-center">
        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="ml-2 text-sm text-gray-600">New widget</div>
      </div>
    </div>

    <ProPlan />
  </div>
);

export default Statistics;