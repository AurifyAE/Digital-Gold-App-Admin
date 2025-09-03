// src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import ProjectCard from '../components/Projects/ProjectCard';
import TasksSection from '../components/Tasks/TasksSection';
import Statistics from '../components/Statistics/Statistics';
import { mockData } from '../data/mockData';

const Dashboard = () => {
  return (
    <div className="p-6">
      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockData.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Tasks and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksSection tasks={mockData.tasks} />
        <Statistics />
      </div>
    </div>
  );
};

export default Dashboard;