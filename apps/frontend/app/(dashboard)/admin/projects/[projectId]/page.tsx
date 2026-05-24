"use client";
/**
 * Project Details Page
 * Project detail view with info, accounts on the project, edit actions.
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProjectById, updateProject, Project } from '../../../../../services/project-service';
import { ArrowLeft, Loader2, Calendar, Building2, Briefcase, Link as LinkIcon, DollarSign, Edit } from 'lucide-react';
import { EditProjectModal } from '../../../../../components/projects/edit-project-modal';
import toast from 'react-hot-toast';

export default function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Next.js params in Next 15+ needs to be awaited if they are dynamic
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.projectId;

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjectById(projectId);
        setProject(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    if (projectId) load();
  }, [projectId]);

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await updateProject(id, updates);
      setProject({ ...project, ...updates });
      setIsEditModalOpen(false);
      toast.success('Project updated successfully');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update project');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="text-zinc-500">Project not found</div>
      </div>
    );
  }

  const projectAccounts =
    project.accounts?.length > 0
      ? project.accounts
      : project.account
        ? [project.account]
        : [];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors border border-zinc-200 bg-white"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">{project.name}</h1>
            <p className="text-stone-500 text-sm mt-1">{project.description || 'No description provided'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <Edit className="w-4 h-4 text-stone-500" />
          Edit Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm col-span-2 flex flex-col gap-6">
          <h3 className="font-semibold text-stone-900 border-b border-zinc-100 pb-3">Project Information</h3>

          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <div className="text-xs font-medium text-stone-500 mb-1 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Status</div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-emerald-100 text-emerald-800">
                {project.status || 'Active'}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-stone-500 mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created Date</div>
              <div className="text-sm text-stone-900 font-medium">
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>

            {project.platformName && (
              <div>
                <div className="text-xs font-medium text-stone-500 mb-1 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Platform Name</div>
                <div className="text-sm text-stone-900 font-medium">{project.platformName}</div>
              </div>
            )}

            {project.platformUrl && (
              <div>
                <div className="text-xs font-medium text-stone-500 mb-1 flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Platform URL</div>
                <a href={project.platformUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline font-medium break-all">
                  {project.platformUrl}
                </a>
              </div>
            )}

            {project.pricePerHour != null && (
              <div>
                <div className="text-xs font-medium text-stone-500 mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Price Per Hour</div>
                <div className="text-sm text-stone-900 font-medium">${project.pricePerHour.toString()}</div>
              </div>
            )}

          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-semibold text-stone-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" /> Account on Project
          </h3>

          <div className="flex flex-col gap-3">
            {projectAccounts.length > 0 ? (
              projectAccounts.map((a: { id: string; name: string; email?: string; status?: string }) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg border border-zinc-100 bg-zinc-50/50">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {a.name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-stone-900 truncate">{a.name}</span>
                    {a.email && <span className="text-xs text-stone-500 truncate">{a.email}</span>}
                    {a.status && (
                      <span className="text-xs text-stone-400 capitalize mt-0.5">{a.status}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-stone-500 py-2">No account assigned to this project yet.</div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateProject}
        />
      )}
    </div>
  );
}
