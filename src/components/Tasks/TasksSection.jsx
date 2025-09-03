// components/Tasks/TasksSection.js
import React from 'react';
import TaskItem from './TaskItem';

const TasksSection = ({ tasks }) => (
  <div className="bg-white rounded-2xl p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks for today</h2>
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  </div>
);

export default TasksSection;