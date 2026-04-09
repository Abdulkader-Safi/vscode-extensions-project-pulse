import React, { useState } from "react";
import TopBar from "../components/layout/TopBar";
import DashboardStats from "../components/dashboard/DashboardStats";
import ProjectGrid from "../components/dashboard/ProjectGrid";
import EmptyState from "../components/shared/EmptyState";
import AddProjectWizard from "../components/add-project/AddProjectWizard";
import { useProjects } from "../hooks/useProjects";

interface DashboardPageProps {
  onProjectClick?: (id: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onProjectClick }) => {
  const { projects, loading, refreshAll } = useProjects();
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="Monitor health signals across all projects"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWizardOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Project
            </button>
            <button
              onClick={refreshAll}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">
            Loading...
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Add your first project to start monitoring its health signals."
            action={
              <button
                onClick={() => setWizardOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
              >
                Add Project
              </button>
            }
          />
        ) : (
          <>
            <DashboardStats projects={projects} />
            <ProjectGrid
              projects={projects}
              onProjectClick={onProjectClick || (() => {})}
            />
          </>
        )}
      </div>
      <AddProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </>
  );
};

export default DashboardPage;
