// components/Tasks/TaskItem.js
import React from 'react';

const TaskItem = ({ task }) => (
  <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`w-1 h-12 rounded-full ${
      task.category === 'Mobile App' ? 'bg-orange-400' : 
      task.category === 'Design' ? 'bg-purple-500' : 'bg-teal-400'
    }`}></div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900">{task.title}</h4>
      <p className="text-sm text-gray-600">{task.subtitle}</p>
    </div>
    {task.completed && (
      <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    )}
  </div>
);

export default TaskItem;