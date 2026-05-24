'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRefreshOnFocus, notifyDataMutated } from '../../../../hooks/use-refresh-on-focus';
import { ProjectsHeader } from '../../../../components/projects/projects-header';
import { SearchBar } from '../../../../components/projects/search-bar';
import { EmptyState } from '../../../../components/projects/empty-state';
import { NewProjectModal } from '../../../../components/projects/new-project-modal';
import { ProjectSuccessModal } from '../../../../components/projects/project-success-modal';
import { ProjectList } from '../../../../components/projects/project-list';
import { getProjects, createProject, deleteProject, deleteProjectPermanently, Project } from '../../../../services/project-service';
import { Loader2 } from 'lucide-react';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getProjects();
      setProjects(list);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useRefreshOnFocus(fetchProjects);

  const mappedProjects = projects.map((p: any) => ({
    id: p.id,
    name: p.name,
    accounts: p.accounts || [],
    accountsCount: p.accounts?.length || 0,
    taskersCount: p.taskers?.length || p.taskersCount || 0,
    dateCreated: new Date(p.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }),
  }));

  const handleCreateProject = async (newProject: any) => {
    try {
      await createProject({
        name: newProject.name,
        platformName: newProject.platformName,
        platformUrl: newProject.platformUrl,
        pricePerHour: newProject.pricePerHour,
      });
      fetchProjects();
      notifyDataMutated();
      setIsNewProjectOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Permanently delete project? This cannot be undone.')) return;
    try {
      await deleteProjectPermanently(projectId);
      fetchProjects();
      notifyDataMutated();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-6 w-full">
      {/* White card wrapper — consistent with Accounts/Taskers/Timesheets */}
      <div className="self-stretch p-6 bg-white rounded-xl shadow-md border-0 flex flex-col gap-4">
        {/* Header */}
        <ProjectsHeader 
          count={projects.length} 
          onNewClick={() => setIsNewProjectOpen(true)} 
        />

        {/* Search Bar */}
        <SearchBar />

        {/* Dynamic Content */}
        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : mappedProjects.length === 0 ? (
          <EmptyState onCreateClick={() => setIsNewProjectOpen(true)} />
        ) : (
          <ProjectList 
            projects={mappedProjects} 
            onDelete={handleDeleteProject} 
            onViewDetails={(project) => router.push(`/admin/projects/${project.id}`)}
          />
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
