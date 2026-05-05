'use client';

import React, { useState } from 'react';
import { ProjectsHeader } from '../../../../components/projects/projects-header';
import { SearchBar } from '../../../../components/projects/search-bar';
import { EmptyState } from '../../../../components/projects/empty-state';
import { NewProjectModal } from '../../../../components/projects/new-project-modal';
import { ProjectSuccessModal } from '../../../../components/projects/project-success-modal';
import { ProjectList } from '../../../../components/projects/project-list';
import { useDashboardStore } from '../../../../store/dashboardStore';

export default function ProjectsPage() {
  const { projects, addProject } = useDashboardStore();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleCreateProject = (newProject: any) => {
    addProject({
      ...newProject,
      accountsCount: 0,
      taskersCount: 0,
      dateCreated: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }),
    });
    setIsNewProjectOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-6 w-full h-full pb-8 px-6">
      {/* Header */}
      <ProjectsHeader 
        count={projects.length} 
        onNewClick={() => setIsNewProjectOpen(true)} 
      />

      {/* Projects Content */}
      <div className="self-stretch flex flex-col justify-start items-start gap-6 w-full">
        {/* Search Bar */}
        <div className="w-full">
          <SearchBar />
        </div>

        {/* Dynamic Content */}
        {projects.length === 0 ? (
          <EmptyState onCreateClick={() => setIsNewProjectOpen(true)} />
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>

      {/* Modals */}
      {isNewProjectOpen && (
        <NewProjectModal 
          onClose={() => setIsNewProjectOpen(false)} 
          onCreate={handleCreateProject} 
        />
      )}

      {isSuccessOpen && (
        <ProjectSuccessModal 
          onClose={() => setIsSuccessOpen(false)} 
        />
      )}
    </div>
  );
}
