// components/MainContent/MainContent.js
import React from 'react';
import ProjectCard from '../Projects/ProjectCard';
import TasksSection from '../Tasks/TasksSection';
import Statistics from '../Statistics/Statistics';

const MainContent = ({ projects, tasks }) => (
  <div className="flex-1 p-6">
    {/* Project Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>

    {/* Tasks and Statistics */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TasksSection tasks={tasks} />
      <Statistics />
    </div>
  </div>
);

export default MainContent;