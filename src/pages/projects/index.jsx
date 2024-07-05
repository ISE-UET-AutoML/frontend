import React from 'react';
import ProjectBlank from './blank';
import Project from './project';
import CreateProject from 'src/components/CreateProject';
import ProjectCard from 'src/components/ProjectCard';
import ProjectList from './list';

const Projects = () => {
	return (
		// <div className="container h-full flex items-center justify-center mx-auto gap-4">
		//   <CreateProject className="flex-1 w-full bg-slate-800">A</CreateProject>
		//   <ProjectCard className="flex-1 w-full bg-red-400">B</ProjectCard>
		//   <ProjectCard className="flex-1 w-full bg-green-500">C</ProjectCard>
		//   <ProjectCard className="flex-1 w-full bg-yellow-400">D</ProjectCard>
		// </div>
		// <div className="h-full flex items-center justify-center">
		//   <ProjectBlank className="mx-auto my-auto" />
		// </div>
		<ProjectList />
	);
};

export default Projects;
