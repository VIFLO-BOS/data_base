import React from "react";
import { ProjectCard } from "./project-card";

interface Project {
  id: string;
  name: string;
  accountsCount: number;
  taskersCount: number;
  dateCreated: string;
}

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  );
}
