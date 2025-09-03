// components/Projects/ProjectCard.js
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const ProjectCard = ({ project }) => (
  <div className={`${project.color} rounded-2xl p-6 text-white relative overflow-hidden`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-2">
        <span className="text-lg font-medium">+{project.memberCount}</span>
        <div className="flex -space-x-2">
          {project.members.map((member, index) => (
            <img
              key={index}
              src={member}
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white"
            />
          ))}
        </div>
      </div>
      <MoreHorizontal className="w-5 h-5" />
    </div>
    
    <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
    <p className="text-sm opacity-90 mb-4">{project.tasks} tasks • {project.progress}%</p>
    
    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
      <div 
        className="bg-white h-2 rounded-full transition-all duration-300"
        style={{ width: `${project.progress}%` }}
      ></div>
    </div>
  </div>
);

export default ProjectCard;